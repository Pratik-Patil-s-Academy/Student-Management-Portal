import Test from '../models/test.model.js';
import { Student } from '../models/student.model.js';
import { Batch } from '../models/batch.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as testService from '../services/test.service.js';


/**
 * CREATE TEST
 * Creates a new test for selected batches
 * Initially creates test without scores - scores are added later
 * 
 * Route: POST /api/test/create
 * Access: Protected (Teacher/Admin)
 * 
 * Expected Body:
 * {
 *   title: "Unit Test 1",
 *   topic: "Calculus",
 *   classLevel: "11th",
 *   subject: "Maths",
 *   testDate: "2024-02-15",
 *   maxMarks: 100,
 *   applicableBatches: ["batchId1", "batchId2"]
 * }
 */
export const createTest = asyncHandler(async (req, res) => {
  testService.validateTestData(req.body);

  await testService.validateBatches(req.body.applicableBatches);

  const test = await testService.createTestRecord(req.body);

  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    test
  });
});

export const addOrUpdateScores = asyncHandler(async (req, res) => {
  const test = await testService.validateScores(req.params.testId, req.body.scores);

  const updatedTest = await testService.updateTestScores(test, req.body.scores);

  res.status(200).json({
    success: true,
    message: 'Scores updated successfully',
    test: updatedTest
  });
});

export const getTestById = asyncHandler(async (req, res) => {
  const test = await testService.fetchTestById(req.params.testId);

  res.status(200).json({
    success: true,
    test
  });
});

export const getAllTests = asyncHandler(async (req, res) => {
  const tests = await testService.fetchAllTests(req.query);

  res.status(200).json({
    success: true,
    count: tests.length,
    tests
  });
});

export const getStudentTestHistory = asyncHandler(async (req, res) => {
  const result = await testService.fetchStudentTestHistory(req.params.studentId);

  res.status(200).json({
    success: true,
    studentName: result.studentName,
    rollNumber: result.rollNumber,
    totalTests: result.tests.length,
    tests: result.tests
  });
});

export const deleteTest = asyncHandler(async (req, res) => {
  await testService.deleteTestById(req.params.testId);

  res.status(200).json({
    success: true,
    message: 'Test deleted successfully'
  });
});

export const getTestStatistics = asyncHandler(async (req, res) => {
  const result = await testService.calculateTestStatistics(req.params.testId);

  if (result.message) {
    return res.status(200).json({
      success: true,
      message: result.message,
      statistics: result.statistics
    });
  }

  res.status(200).json({
    success: true,
    statistics: result.statistics
  });
});

export const getOverallPerformance = asyncHandler(async (req, res) => {
  const { limit = 10, classLevel, batchId } = req.query;
  const result = await testService.getOverallPerformance({ limit, classLevel, batchId });

  res.status(200).json({
    success: true,
    ...result
  });
});