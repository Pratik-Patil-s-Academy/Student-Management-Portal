import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import {
  createTest,
  addOrUpdateScores,
  getTestById,
  getAllTests,
  getStudentTestHistory,
  deleteTest,
  getTestStatistics,
  getOverallPerformance
} from '../controllers/testController.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tests
 *   description: Test management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Test:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         topic:
 *           type: string
 *         classLevel:
 *           type: string
 *           enum: [11th, 12th]
 *         subject:
 *           type: string
 *         testDate:
 *           type: string
 *           format: date
 *         maxMarks:
 *           type: number
 *         applicableBatches:
 *           type: array
 *           items:
 *             type: string
 *         scores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               marksObtained:
 *                 type: number
 *               attendanceStatus:
 *                 type: string
 *                 enum: [Present, Absent]
 *               remark:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tests/create:
 *   post:
 *     summary: Create a new test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - classLevel
 *               - testDate
 *               - maxMarks
 *             properties:
 *               title:
 *                 type: string
 *               topic:
 *                 type: string
 *               classLevel:
 *                 type: string
 *                 enum: [11th, 12th]
 *               subject:
 *                 type: string
 *               testDate:
 *                 type: string
 *                 format: date
 *               maxMarks:
 *                 type: number
 *               applicableBatches:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *       500:
 *         description: Internal server error
 */
router.post('/create', isAuth, createTest);

/**
 * @swagger
 * /api/tests/all:
 *   get:
 *     summary: Get all tests
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classLevel
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all tests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 tests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 *       500:
 *         description: Internal server error
 */
router.get('/all', isAuth, getAllTests);

// Overall performance across last N tests - must be BEFORE /:testId
router.get('/performance/overall', isAuth, getOverallPerformance);

/**
 * @swagger
 * /api/tests/student/{studentId}:
 *   get:
 *     summary: Get test history for a student
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student test history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 studentName:
 *                   type: string
 *                 rollNumber:
 *                   type: number
 *                 totalTests:
 *                   type: number
 *                 tests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       testId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       marksObtained:
 *                         type: number
 *                       maxMarks:
 *                         type: number
 *                       percentage:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get('/student/:studentId', isAuth, getStudentTestHistory);

/**
 * @swagger
 * /api/tests/{testId}/scores:
 *   put:
 *     summary: Add or update scores for a test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: The test ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scores
 *             properties:
 *               scores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - marksObtained
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     marksObtained:
 *                       type: number
 *                     attendanceStatus:
 *                       type: string
 *                       enum: [Present, Absent]
 *                     remark:
 *                       type: string
 *     responses:
 *       200:
 *         description: Scores updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *       500:
 *         description: Internal server error
 */
router.put('/:testId/scores', isAuth, addOrUpdateScores);

/**
 * @swagger
 * /api/tests/{testId}:
 *   get:
 *     summary: Get test by ID
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: The test ID
 *     responses:
 *       200:
 *         description: Test details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *       404:
 *         description: Test not found
 *       500:
 *         description: Internal server error
 */
router.get('/:testId', isAuth, getTestById);

/**
 * @swagger
 * /api/tests/{testId}/statistics:
 *   get:
 *     summary: Get statistics for a test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: The test ID
 *     responses:
 *       200:
 *         description: Test statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     averageMarks:
 *                       type: number
 *                     highestMarks:
 *                       type: number
 *                     lowestMarks:
 *                       type: number
 *                     passPercentage:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/:testId/statistics', isAuth, getTestStatistics);


/**
 * @swagger
 * /api/tests/{testId}:
 *   delete:
 *     summary: Delete a test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: The test ID
 *     responses:
 *       200:
 *         description: Test deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:testId', isAuth, deleteTest);

export default router;