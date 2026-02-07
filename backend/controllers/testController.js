import Test from '../models/testModel.js';
import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as testService from '../services/testService.js';

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
export const createTest = TryCatch(async (req, res) => {
  testService.validateTestData(req.body);
  
  await testService.validateBatches(req.body.applicableBatches);
  
  const test = await testService.createTestRecord(req.body);

  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    test
  });
});

export const addOrUpdateScores = TryCatch(async (req, res) => {
  const test = await testService.validateScores(req.params.testId, req.body.scores);
  
  const updatedTest = await testService.updateTestScores(test, req.body.scores);

  res.status(200).json({
    success: true,
    message: 'Scores updated successfully',
    test: updatedTest
  });
});

export const getTestById = TryCatch(async (req, res) => {
  const test = await testService.fetchTestById(req.params.testId);

  res.status(200).json({
    success: true,
    test
  });
});

export const getAllTests = TryCatch(async (req, res) => {
  const tests = await testService.fetchAllTests(req.query);

  res.status(200).json({
    success: true,
    count: tests.length,
    tests
  });
});

export const getStudentTestHistory = TryCatch(async (req, res) => {
  const result = await testService.fetchStudentTestHistory(req.params.studentId);

  res.status(200).json({
    success: true,
    studentName: result.studentName,
    rollNumber: result.rollNumber,
    totalTests: result.tests.length,
    tests: result.tests
  });
});

export const deleteTest = TryCatch(async (req, res) => {
  await testService.deleteTestById(req.params.testId);

  res.status(200).json({
    success: true,
    message: 'Test deleted successfully'
  });
});

export const getTestStatistics = TryCatch(async (req, res) => {
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