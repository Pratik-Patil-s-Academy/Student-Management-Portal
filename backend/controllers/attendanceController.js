import { Batch } from '../models/batchModel.js';
import { Student } from '../models/studentModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as attendanceService from '../services/attendanceService.js';

export const markAttendance = TryCatch(async (req, res) => {
  const { batchId, date, students, subject } = req.body;

  const batch = await attendanceService.validateAttendanceData(batchId, date, students);

  await attendanceService.validateStudentsInBatch(batch, students);

  const attendance = await attendanceService.createAttendanceRecord(batchId, date, students, subject);

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    attendance
  });
});

export const getAttendanceByBatch = TryCatch(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.query;

  const attendance = await attendanceService.fetchAttendanceByBatch(batchId, startDate, endDate);

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const getAttendanceByStudent = TryCatch(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const studentAttendance = await attendanceService.fetchAttendanceByStudent(studentId, startDate, endDate);

  res.status(200).json({
    success: true,
    count: studentAttendance.length,
    attendance: studentAttendance
  });
});

export const getAttendanceByDate = TryCatch(async (req, res) => {
  const attendance = await attendanceService.fetchAttendanceByDate(req.params.date);

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const updateAttendance = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { students, subject } = req.body;

  const attendance = await attendanceService.updateAttendanceRecord(id, students, subject);

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    attendance
  });
});

export const deleteAttendance = TryCatch(async (req, res) => {
  await attendanceService.deleteAttendanceRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

export const getAttendanceById = TryCatch(async (req, res) => {
  const { id } = req.params;

  const attendance = await attendanceService.fetchAttendanceById(id);

  res.status(200).json({
    success: true,
    attendance
  });
});

export const getAttendanceStats = TryCatch(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const stats = await attendanceService.calculateAttendanceStats(studentId, startDate, endDate);

  res.status(200).json({
    success: true,
    stats
  });
});

export const getAllAttendanceStatsByBatch = TryCatch(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.query;

  const stats = await attendanceService.calculateBatchAttendanceStats(batchId, startDate, endDate);

  res.status(200).json({
    success: true,
    stats
  });
});