import { Attendance } from '../models/attendenceModel.js';
import { Batch } from '../models/batchModel.js';
import { Student } from '../models/studentModel.js';

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

  const existingAttendance = await Attendance.findOne({
    batchId,
    date: new Date(date)
  });

  if (existingAttendance) {
    throw new Error('Attendance already marked for this batch on this date');
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
    studentId: typeof s === 'string' ? s : s.studentId,
    status: typeof s === 'string' ? 'Present' : (s.status || 'Present')
  }));

  const attendance = await Attendance.create({
    batchId,
    subject: subject || 'Maths',
    date: new Date(date),
    students: normalizedStudents
  });

  await attendance.populate('batchId students.studentId');
  return attendance;
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

  return await Attendance.find(filter)
    .populate('batchId')
    .populate('students.studentId')
    .sort({ date: -1 });
};

export const fetchAttendanceByStudent = async (studentId, startDate, endDate) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const filter = { 'students.studentId': studentId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const attendance = await Attendance.find(filter)
    .populate('batchId')
    .populate('students.studentId')
    .sort({ date: -1 });

  return attendance.map(record => {
    const studentRecord = record.students.find(
      s => s.studentId._id.toString() === studentId
    );
    return {
      _id: record._id,
      batchId: record.batchId,
      subject: record.subject,
      date: record.date,
      status: studentRecord?.status,
      createdAt: record.createdAt
    };
  });
};

export const fetchAttendanceByDate = async (date) => {
  return await Attendance.find({
    date: new Date(date)
  })
    .populate('batchId')
    .populate('students.studentId')
    .sort({ createdAt: -1 });
};

export const fetchAttendanceById = async (id) => {
  const attendance = await Attendance.findById(id)
    .populate('batchId')
    .populate('students.studentId');

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  return attendance;
};

export const updateAttendanceRecord = async (id, students, subject) => {
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  if (students && Array.isArray(students)) {
    const studentIds = students.map(s => typeof s === 'string' ? s : s.studentId);

    const validStudents = await Student.find({ _id: { $in: studentIds } });
    if (validStudents.length !== studentIds.length) {
      throw new Error('One or more student IDs are invalid');
    }

    const batch = await Batch.findById(attendance.batchId).populate('students');
    const batchStudentIds = batch.students.map(s => s._id.toString());
    const invalidStudents = studentIds.filter(sid => !batchStudentIds.includes(sid.toString()));

    if (invalidStudents.length > 0) {
      throw new Error(`Students with IDs ${invalidStudents.join(', ')} are not in this batch`);
    }

    attendance.students = students.map(s => ({
      studentId: typeof s === 'string' ? s : s.studentId,
      status: typeof s === 'string' ? 'Present' : (s.status || 'Present')
    }));
  }

  if (subject) {
    attendance.subject = subject;
  }

  await attendance.save();
  await attendance.populate('batchId students.studentId');
  return attendance;
};

export const deleteAttendanceRecord = async (id) => {
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  await Attendance.findByIdAndDelete(id);
};

export const calculateAttendanceStats = async (studentId, startDate, endDate) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const filter = { 'students.studentId': studentId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const attendance = await Attendance.find(filter);

  let totalPresent = 0;
  let totalAbsent = 0;

  attendance.forEach(record => {
    const studentRecord = record.students.find(
      s => s.studentId.toString() === studentId
    );
    if (studentRecord) {
      if (studentRecord.status === 'Present') {
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
      const studentRecord = record.students.find(
        s => s.studentId.toString() === student._id.toString()
      );
      if (studentRecord) {
        if (studentRecord.status === 'Present') {
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

  return await Attendance.find(filter)
    .populate('batchId')
    .populate('students.studentId')
    .sort({ date: -1 });
};
