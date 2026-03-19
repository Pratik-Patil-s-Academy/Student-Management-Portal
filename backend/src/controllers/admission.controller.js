import { Admission } from '../models/admission.model.js';
import { Student } from '../models/student.model.js';
import { Batch } from '../models/batch.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as admissionService from '../services/admission.service.js';

export const createAdmission = asyncHandler(async (req, res) => {
  console.log('Create Admission Request Body:', req.body);
  console.log('Create Admission File:', req.file);

  admissionService.validateAdmissionData(req.body);

  await admissionService.checkRollNumberAvailability(req.body.rollno);

  const photoUrl = await admissionService.uploadStudentPhoto(req.file);
  console.log('Uploaded Photo URL:', photoUrl);

  const admission = await admissionService.createAdmissionRecord(req.body, photoUrl);

  res.status(201).json({
    success: true,
    message: 'Admission request created successfully',
    admission
  });
});

export const getPendingAdmissions = asyncHandler(async (req, res) => {
  const admissions = await admissionService.fetchPendingAdmissions();

  res.status(200).json({
    success: true,
    count: admissions.length,
    admissions
  });
});

export const getAdmissionById = asyncHandler(async (req, res) => {
  const admission = await admissionService.fetchAdmissionById(req.params.id);

  res.status(200).json({
    success: true,
    admission
  });
});

export const handleAdmissionDecision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      message: 'Action must be either "approve" or "reject"'
    });
  }

  if (action === 'approve') {
    const student = await admissionService.approveAdmission(id);

    return res.status(200).json({
      success: true,
      message: 'Admission approved successfully',
      student
    });
  } else {
    await admissionService.rejectAdmission(id);

    return res.status(200).json({
      success: true,
      message: 'Admission rejected and deleted successfully'
    });
  }
});

export const getAllAdmissions = asyncHandler(async (req, res) => {
  const admissions = await admissionService.fetchAllAdmissions(req.query.status);

  res.status(200).json({
    success: true,
    count: admissions.length,
    admissions
  });
});
