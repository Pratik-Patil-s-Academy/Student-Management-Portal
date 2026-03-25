import { Student } from '../models/student.model.js';
import { Batch } from '../models/batch.model.js';
import { Admission } from '../models/admission.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as studentService from '../services/student.service.js';

export const createStudent = asyncHandler(async (req, res) => {
  await studentService.validateStudentCreate(req.body);
  const student = await studentService.createStudentRecord(req.body, req.file);

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    student
  });
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await studentService.fetchAllStudents();

  res.status(200).json({
    success: true,
    count: students.length,
    students
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.fetchStudentById(req.params.id);

  res.status(200).json({
    success: true,
    student
  });
});

export const getStudentByRollNo = asyncHandler(async (req, res) => {
  const student = await studentService.fetchStudentByRollNo(req.params.rollno);

  res.status(200).json({
    success: true,
    student
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await studentService.validateStudentUpdate(id, req.body.rollno, req.body.parentMobile, req.body.whatsappNumber, req.body.studentMobile, req.body.email);

  const student = await studentService.fetchStudentById(id);
  const photoUrl = await studentService.uploadStudentPhotoUpdate(req.file, student.personalDetails.photoUrl);

  const updatedStudent = await studentService.updateStudentRecord(id, req.body, photoUrl);

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    student: updatedStudent
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudentRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully'
  });
});

export const updateStudentStatus = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudentStatusRecord(req.params.id, req.body.status);

  res.status(200).json({
    success: true,
    message: 'Student status updated successfully',
    student
  });
});

export const assignBatchToStudent = asyncHandler(async (req, res) => {
  const student = await studentService.assignBatchToStudentRecord(req.params.id, req.body.batchId);

  res.status(200).json({
    success: true,
    message: 'Batch assigned to student successfully',
    student
  });
});

export const removeBatchFromStudent = asyncHandler(async (req, res) => {
  const student = await studentService.removeBatchFromStudentRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Batch removed from student successfully',
    student
  });
});

export const getStudentsWithNoBatch = asyncHandler(async (req, res) => {
  const students = await studentService.fetchStudentsWithNoBatch();

  res.status(200).json({
    success: true,
    count: students.length,
    students
  });
});

// Get all Standard 11 students with fee status for promotion preview
export const getStudentsForPromotion = asyncHandler(async (req, res) => {
  const students = await studentService.getStudentsForPromotion();
  res.status(200).json({ success: true, students });
});

// Promote selected students from 11th to 12th (carries forward dues, clears batch)
export const promoteStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ success: false, message: 'studentIds array is required' });
  }
  const result = await studentService.promoteStudentsToNextStandard(studentIds, req.user?._id);
  res.status(200).json({
    success: true,
    message: result.message || `${result.promoted} student(s) promoted from Standard 11 to Standard 12. Fees carried forward.`,
    promoted: result.promoted
  });
});

export const reassignRollNumbers = asyncHandler(async (req, res) => {
  const { standard } = req.body;
  const result = await studentService.reassignRollNumbers(standard);

  res.status(200).json({
    success: true,
    message: result.message || `Roll numbers reassigned alphabetically for ${result.updated} student(s).`,
    updated: result.updated
  });
});

export const demoteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetStandard } = req.body;

  const student = await studentService.demoteStudent(id, targetStandard);

  res.status(200).json({
    success: true,
    message: `Student successfully demoted to Standard ${student.standard}`,
    student
  });
});