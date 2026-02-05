import {Attendance} from '../models/attendenceModel.js';
import { Batch } from '../models/batchModel.js';
import { Student } from '../models/studentModel.js';
import TryCatch from '../utils/TryCatch.js';

export const markAttendance = TryCatch(async (req, res) => {
  const { batchId, date, students, subject } = req.body;

  if (!batchId || !date) {
    return res.status(400).json({ 
      message: 'Batch ID and date are required' 
    });
  }

  const batch = await Batch.findById(batchId).populate('students');
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ 
      message: 'At least one student attendance record is required' 
    });
  }

  const existingAttendance = await Attendance.findOne({ 
    batchId, 
    date: new Date(date) 
  });
  
  if (existingAttendance) {
    return res.status(400).json({ 
      message: 'Attendance already marked for this batch on this date' 
    });
  }

  const studentIds = students.map(s => typeof s === 'string' ? s : s.studentId);
  
  const validStudents = await Student.find({ _id: { $in: studentIds } });
  if (validStudents.length !== studentIds.length) {
    return res.status(400).json({ 
      message: 'One or more student IDs are invalid' 
    });
  }

  const batchStudentIds = batch.students.map(s => s._id.toString());
  const invalidStudents = studentIds.filter(sid => !batchStudentIds.includes(sid.toString()));
  
  if (invalidStudents.length > 0) {
    return res.status(400).json({ 
      message: `Students with IDs ${invalidStudents.join(', ')} are not in this batch` 
    });
  }

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

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    attendance
  });
});

export const getAttendanceByBatch = TryCatch(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.body;

  const batch = await Batch.findById(batchId);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  const filter = { batchId };
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const attendance = await Attendance.find(filter)
    .populate('batchId')
    .populate('students.studentId')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const getAttendanceByStudent = TryCatch(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
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

  const studentAttendance = attendance.map(record => {
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

  res.status(200).json({
    success: true,
    count: studentAttendance.length,
    attendance: studentAttendance
  });
});

export const getAttendanceByDate = TryCatch(async (req, res) => {
  const { date } = req.params;

  const attendance = await Attendance.find({ 
    date: new Date(date) 
  })
    .populate('batchId')
    .populate('students.studentId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const updateAttendance = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { students, subject } = req.body;

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }

  if (students && Array.isArray(students)) {
    // Handle both formats: array of strings or array of objects
    const studentIds = students.map(s => typeof s === 'string' ? s : s.studentId);
    
    // Check if all students exist
    const validStudents = await Student.find({ _id: { $in: studentIds } });
    if (validStudents.length !== studentIds.length) {
      return res.status(400).json({ 
        message: 'One or more student IDs are invalid' 
      });
    }

    // Check if all students are in the batch
    const batch = await Batch.findById(attendance.batchId).populate('students');
    const batchStudentIds = batch.students.map(s => s._id.toString());
    const invalidStudents = studentIds.filter(sid => !batchStudentIds.includes(sid.toString()));
    
    if (invalidStudents.length > 0) {
      return res.status(400).json({ 
        message: `Students with IDs ${invalidStudents.join(', ')} are not in this batch` 
      });
    }

    // Normalize students array to object format
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

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    attendance
  });
});

export const deleteAttendance = TryCatch(async (req, res) => {
  const { id } = req.params;

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }

  await Attendance.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

export const getAttendanceStats = TryCatch(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
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

  res.status(200).json({
    success: true,
    stats: {
      totalClasses,
      totalPresent,
      totalAbsent,
      attendancePercentage: parseFloat(attendancePercentage)
    }
  });
});

export const getAllAttendanceStatsByBatch = TryCatch(async (req, res) => {
    const { batchId } = req.params;
    const { startDate, endDate } = req.query;
    
    const batch = await Batch.findById(batchId).populate('students');
    if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
        }
    const filter = { batchId };
    
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const attendanceRecords = await Attendance.find(filter);
    
    const stats = batch.students.map(student => {
        let totalPresent = 0;
        let totalAbsent = 0;
        
        attendanceRecords.forEach(record => {
            const studentRecord = record.students.find(
                s => s.studentId.toString() === student._id.toString()
            );
            if (studentRecord) {
                if (studentRecord.status === 'Present') {
                    totalPresent++;
                }
                else {
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

    res.status(200).json({
        success: true,
        stats
    });
});