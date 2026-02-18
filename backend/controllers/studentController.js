import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';
import { Admission } from '../models/admissionModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as studentService from '../services/studentService.js';

export const createStudent = TryCatch(async (req, res) => {
  await studentService.validateStudentCreate(req.body);
  const student = await studentService.createStudentRecord(req.body, req.file);

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    student
  });
});

export const getAllStudents = TryCatch(async (req, res) => {
  const students = await studentService.fetchAllStudents();

  res.status(200).json({
    success: true,
    count: students.length,
    students
  });
});

export const getStudentById = TryCatch(async (req, res) => {
  const student = await studentService.fetchStudentById(req.params.id);

  res.status(200).json({
    success: true,
    student
  });
});

export const getStudentByRollNo = TryCatch(async (req, res) => {
  const student = await studentService.fetchStudentByRollNo(req.params.rollno);

  res.status(200).json({
    success: true,
    student
  });
});

export const updateStudent = TryCatch(async (req, res) => {
  const { id } = req.params;

  await studentService.validateStudentUpdate(id, req.body.rollno, req.body.parentMobile, req.body.studentMobile, req.body.email);

  const student = await studentService.fetchStudentById(id);
  const photoUrl = await studentService.uploadStudentPhotoUpdate(req.file, student.personalDetails.photoUrl);

  const updatedStudent = await studentService.updateStudentRecord(id, req.body, photoUrl);

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    student: updatedStudent
  });
});

export const deleteStudent = TryCatch(async (req, res) => {
  await studentService.deleteStudentRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully'
  });
});

export const updateStudentStatus = TryCatch(async (req, res) => {
  const student = await studentService.updateStudentStatusRecord(req.params.id, req.body.status);

  res.status(200).json({
    success: true,
    message: 'Student status updated successfully',
    student
  });
});

export const assignBatchToStudent = TryCatch(async (req, res) => {
  const student = await studentService.assignBatchToStudentRecord(req.params.id, req.body.batchId);

  res.status(200).json({
    success: true,
    message: 'Batch assigned to student successfully',
    student
  });
});

export const removeBatchFromStudent = TryCatch(async (req, res) => {
  const student = await studentService.removeBatchFromStudentRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Batch removed from student successfully',
    student
  });
});

export const getStudentsWithNoBatch = TryCatch(async (req, res) => {
  const students = await studentService.fetchStudentsWithNoBatch();

  res.status(200).json({
    success: true,
    count: students.length,
    students
  });
});

// Get all Standard 11 students with fee status for promotion preview
export const getStudentsForPromotion = TryCatch(async (req, res) => {
  const students = await studentService.getStudentsForPromotion();
  res.status(200).json({ success: true, students });
});

// Promote selected students from 11th to 12th (resets fees, clears batch)
export const promoteStudents = TryCatch(async (req, res) => {
  const { studentIds } = req.body;
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ success: false, message: 'studentIds array is required' });
  }
  const result = await studentService.promoteStudentsToNextStandard(studentIds);
  res.status(200).json({
    success: true,
    message: result.message || `${result.promoted} student(s) promoted from Standard 11 to Standard 12. Fee records reset.`,
    promoted: result.promoted
  });
});