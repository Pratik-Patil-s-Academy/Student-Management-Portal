import { Attendance } from '../models/attendence.model.js';
import { Batch } from '../models/batch.model.js';
import { Student } from '../models/student.model.js';

// Helper to group flat student records into batch+date format for frontend
const groupRecordsByKey = (records) => {
  const grouped = {};

  for (const record of records) {
    const key = `${record.batchId?._id || record.batchId}_${new Date(record.date).toISOString()}`;
    if (!grouped[key]) {
      grouped[key] = {
        _id: key, // Pseudo-ID for frontend mapping
        batchId: record.batchId,
        subject: record.subject,
        date: record.date,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        students: []
      };
    }

    if (!grouped[key].students.some(s => (s.studentId?._id?.toString() || s.studentId?.toString()) === (record.studentId?._id?.toString() || record.studentId?.toString()))) {
      grouped[key].students.push({
        studentId: record.studentId,
        status: record.status
      });
    }
  }

  return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const validateAttendanceData = async (batchId, date, students) => {
  if (!batchId || !date) {
    throw new Error('Batch ID and date are required');
  }

  const batch = await Batch.findById(batchId).populate('students');
  if (!batch) {
    throw new Error('Batch not found');
  }

  if (!students || !Array.isArray(students) || students.length === 0) {
    throw new Error('At least one student attendance record is required');
  }

  return batch;
};

export const validateStudentsInBatch = async (batch, students) => {
  const studentIds = students.map(s => typeof s === 'string' ? s : s.studentId);

  const validStudents = await Student.find({ _id: { $in: studentIds } });
  if (validStudents.length !== studentIds.length) {
    throw new Error('One or more student IDs are invalid');
  }

  const batchStudentIds = batch.students.map(s => s._id.toString());
  const invalidStudents = studentIds.filter(sid => !batchStudentIds.includes(sid.toString()));

  if (invalidStudents.length > 0) {
    throw new Error(`Students with IDs ${invalidStudents.join(', ')} are not in this batch`);
  }
};

export const createAttendanceRecord = async (batchId, date, students, subject) => {
  const normalizedStudents = students.map(s => ({
    batchId,
    subject: subject || 'Maths',
    date: new Date(date),
    studentId: typeof s === 'string' ? s : s.studentId,
    status: typeof s === 'string' ? 'Present' : (s.status || 'Present')
  }));

  const records = await Attendance.insertMany(normalizedStudents);

  await Attendance.populate(records, { path: 'batchId studentId' });
  return groupRecordsByKey(records)[0];
};

export const fetchAttendanceByBatch = async (batchId, startDate, endDate) => {
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  const filter = { batchId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const records = await Attendance.find(filter)
    .populate('batchId')
    .populate('studentId')
    .sort({ date: -1 });

  return groupRecordsByKey(records);
};

export const fetchAttendanceByStudent = async (studentId, startDate, endDate) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const filter = { studentId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const records = await Attendance.find(filter)
    .populate('batchId')
    .populate('studentId')
    .sort({ date: -1 });

  return records.map(record => ({
    _id: record._id,
    batchId: record.batchId,
    subject: record.subject,
    date: record.date,
    status: record.status,
    createdAt: record.createdAt
  }));
};

export const fetchAttendanceByDate = async (date) => {
  const records = await Attendance.find({
    date: new Date(date)
  })
    .populate('batchId')
    .populate('studentId')
    .sort({ createdAt: -1 });

  return groupRecordsByKey(records);
};

export const fetchAttendanceById = async (id) => {
  const idStr = String(id);

  // Try to find by direct ObjectId (legacy/single fallback)
  if (idStr.length === 24 && !idStr.includes('_')) {
    const record = await Attendance.findById(idStr).populate('batchId studentId');
    if (record) return groupRecordsByKey([record])[0];
  }

  // Parse pseudo-ID (batchId_date)
  const [batchId, dateStr] = idStr.split('_');
  if (!batchId || !dateStr) {
    throw new Error('Invalid attendance ID format');
  }

  const records = await Attendance.find({
    batchId,
    date: new Date(dateStr)
  })
    .populate('batchId')
    .populate('studentId');

  if (!records || records.length === 0) {
    throw new Error('Attendance record not found');
  }

  return groupRecordsByKey(records)[0];
};

export const updateAttendanceRecord = async (id, students, subject) => {
  let batchId, dateObj;
  const idStr = String(id);

  // Since we use logic based on old IDs vs Pseudo IDs
  if (idStr.length === 24 && !idStr.includes('_')) {
    const existing = await Attendance.findById(idStr);
    if (!existing) throw new Error('Attendance record not found');
    batchId = existing.batchId;
    dateObj = existing.date;
  } else {
    const [bId, dateStr] = idStr.split('_');
    batchId = bId;
    dateObj = new Date(dateStr);
  }

  if (students && Array.isArray(students)) {
    const studentIds = students.map(s => typeof s === 'string' ? s : s.studentId);

    const validStudents = await Student.find({ _id: { $in: studentIds } });
    if (validStudents.length !== studentIds.length) {
      throw new Error('One or more student IDs are invalid');
    }

    // Note: We intentionally do NOT check if students are currently in the batch.
    // Students may have been reassigned to a different batch after this attendance
    // was recorded. Old attendance records must preserve their historical membership.

    // Delete existing records for this batch+date
    await Attendance.deleteMany({
      batchId,
      date: dateObj
    });

    // Insert new ones
    const normalizedStudents = students.map(s => ({
      batchId,
      subject: subject || 'Maths',
      date: dateObj,
      studentId: typeof s === 'string' ? s : s.studentId,
      status: typeof s === 'string' ? 'Present' : (s.status || 'Present')
    }));

    await Attendance.insertMany(normalizedStudents);
  } else if (subject) {
    // Just update subjects
    await Attendance.updateMany(
      { batchId, date: dateObj },
      { $set: { subject } }
    );
  }

  const updatedRecords = await Attendance.find({ batchId, date: dateObj }).populate('batchId studentId');
  return groupRecordsByKey(updatedRecords)[0];
};

export const deleteAttendanceRecord = async (id) => {
  let batchId, dateObj;
  const idStr = String(id);

  if (idStr.length === 24 && !idStr.includes('_')) {
    const existing = await Attendance.findById(idStr);
    if (!existing) throw new Error('Attendance record not found');
    batchId = existing.batchId;
    dateObj = existing.date;
  } else {
    const [bId, dateStr] = idStr.split('_');
    batchId = bId;
    dateObj = new Date(dateStr);
  }

  await Attendance.deleteMany({ batchId, date: dateObj });
};

export const calculateAttendanceStats = async (studentId, startDate, endDate) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const filter = { studentId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const records = await Attendance.find(filter);

  let totalPresent = 0;
  let totalAbsent = 0;

  records.forEach(record => {
    if (record.status === 'Present') {
      totalPresent++;
    } else {
      totalAbsent++;
    }
  });

  const totalClasses = totalPresent + totalAbsent;
  const attendancePercentage = totalClasses > 0
    ? ((totalPresent / totalClasses) * 100).toFixed(2)
    : 0;

  return {
    totalClasses,
    totalPresent,
    totalAbsent,
    attendancePercentage: parseFloat(attendancePercentage)
  };
};

export const calculateBatchAttendanceStats = async (batchId, startDate, endDate) => {
  const batch = await Batch.findById(batchId).populate('students');
  if (!batch) {
    throw new Error('Batch not found');
  }

  const filter = { batchId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const attendanceRecords = await Attendance.find(filter);

  return batch.students.map(student => {
    let totalPresent = 0;
    let totalAbsent = 0;

    attendanceRecords.forEach(record => {
      if (record.studentId.toString() === student._id.toString()) {
        if (record.status === 'Present') {
          totalPresent++;
        } else {
          totalAbsent++;
        }
      }
    });

    const totalClasses = totalPresent + totalAbsent;
    const attendancePercentage = totalClasses > 0
      ? ((totalPresent / totalClasses) * 100).toFixed(2)
      : 0;

    return {
      studentId: student._id,
      totalClasses,
      totalPresent,
      totalAbsent,
      attendancePercentage: parseFloat(attendancePercentage)
    };
  });
};

export const fetchAllAttendance = async (startDate, endDate) => {
  const filter = {};

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const records = await Attendance.find(filter)
    .populate('batchId')
    .populate('studentId')
    .sort({ date: -1 });

  return groupRecordsByKey(records);
};
