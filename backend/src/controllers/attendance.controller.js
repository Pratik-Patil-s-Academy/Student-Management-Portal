import { Batch } from '../models/batch.model.js';
import { Student } from '../models/student.model.js';
import { Attendance } from '../models/attendence.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as attendanceService from '../services/attendance.service.js';

export const markAttendance = asyncHandler(async (req, res) => {
  const { batchId, date, students, subject } = req.body;

  const batch = await attendanceService.validateAttendanceData(batchId, date, students);

  await attendanceService.validateStudentsInBatch(batch, students);

  let attendance;
  const existingRecord = await Attendance.findOne({
    batchId,
    date: new Date(date)
  });

  if (existingRecord) {
    // Update existing record
    attendance = await attendanceService.updateAttendanceRecord(existingRecord._id, students, subject);
  } else {
    // Create new record
    attendance = await attendanceService.createAttendanceRecord(batchId, date, students, subject);
  }

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    attendance
  });
});

export const getAttendanceByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.query;

  const attendance = await attendanceService.fetchAttendanceByBatch(batchId, startDate, endDate);

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const getAttendanceByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const studentAttendance = await attendanceService.fetchAttendanceByStudent(studentId, startDate, endDate);

  res.status(200).json({
    success: true,
    count: studentAttendance.length,
    attendance: studentAttendance
  });
});

export const getAttendanceByDate = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.fetchAttendanceByDate(req.params.date);

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { students, subject } = req.body;

  const attendance = await attendanceService.updateAttendanceRecord(id, students, subject);

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    attendance
  });
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  await attendanceService.deleteAttendanceRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await attendanceService.fetchAttendanceById(id);

  res.status(200).json({
    success: true,
    attendance
  });
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const stats = await attendanceService.calculateAttendanceStats(studentId, startDate, endDate);

  res.status(200).json({
    success: true,
    stats
  });
});

export const getAllAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const attendance = await attendanceService.fetchAllAttendance(startDate, endDate);

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance
  });
});

export const getAllAttendanceStatsByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.query;

  const stats = await attendanceService.calculateBatchAttendanceStats(batchId, startDate, endDate);

  res.status(200).json({
    success: true,
    stats
  });
});