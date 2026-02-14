import { Batch } from '../models/batchModel.js';
import { Student } from '../models/studentModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as batchService from '../services/batchService.js';

export const createBatch = TryCatch(async (req, res) => {
  const { name, standard, startTime, endTime, days, studentIds } = req.body;

  await batchService.validateBatchData(name, standard, startTime, endTime, days);

  await batchService.checkTimeConflict(days, startTime, endTime);

  await batchService.validateStudents(studentIds);

  const batch = await batchService.createBatchRecord(name, standard, startTime, endTime, days, studentIds);

  res.status(201).json({
    success: true,
    message: 'Batch created successfully',
    batch
  });
});

export const addStudentsToBatch = TryCatch(async (req, res) => {
  const batch = await batchService.addStudentsToBatchRecord(req.params.id, req.body.studentIds);

  res.status(200).json({
    success: true,
    message: 'Students added to batch successfully',
    batch
  });
});

export const removeStudentsFromBatch = TryCatch(async (req, res) => {
  const batch = await batchService.removeStudentsFromBatchRecord(req.params.id, req.body.studentIds);

  res.status(200).json({
    success: true,
    message: 'Students removed from batch successfully',
    batch
  });
});

export const getAllBatches = TryCatch(async (req, res) => {
  const batches = await batchService.fetchAllBatches();

  res.status(200).json({
    success: true,
    count: batches.length,
    batches
  });
});

export const getBatchById = TryCatch(async (req, res) => {
  const batch = await batchService.fetchBatchById(req.params.id);

  res.status(200).json({
    success: true,
    batch
  });
});

export const updateBatch = TryCatch(async (req, res) => {
  const batch = await batchService.updateBatchRecord(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Batch updated successfully',
    batch
  });
});

export const deleteBatch = TryCatch(async (req, res) => {
  await batchService.deleteBatchRecord(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Batch deleted successfully'
  });
});
