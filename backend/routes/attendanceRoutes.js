import express from 'express';
import {
  markAttendance,
  getAttendanceByBatch,
  getAttendanceByStudent,
  getAttendanceByDate,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         batchId:
 *           type: string
 *         subject:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         students:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Present, Absent]
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Mark attendance for students
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - students
 *               - date
 *             properties:
 *               batchId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [present, absent]
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       500:
 *         description: Internal server error
 */
router.post('/mark', markAttendance);


/**
 * @swagger
 * /api/attendance/batch/{batchId}:
 *   get:
 *     summary: Get attendance by batch
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     responses:
 *       200:
 *         description: Attendance list for the batch
 *       500:
 *         description: Internal server error
 */
router.get('/batch/:batchId', getAttendanceByBatch);

/**
 * @swagger
 * /api/attendance/student/{studentId}:
 *   get:
 *     summary: Get attendance by student
 *     tags: [Attendance]
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
 *         description: Attendance list for the student
 *       500:
 *         description: Internal server error
 */
router.get('/student/:studentId', getAttendanceByStudent);

/**
 * @swagger
 * /api/attendance/student/{studentId}/stats:
 *   get:
 *     summary: Get attendance stats for a student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalDays:
 *                       type: number
 *                     presentDays:
 *                       type: number
 *                     absentDays:
 *                       type: number
 *                     attendancePercentage:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/student/:studentId/stats', getAttendanceStats);


/**
 * @swagger
 * /api/attendance/date/{date}:
 *   get:
 *     summary: Get attendance for a specific date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Attendance list for the date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 attendance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Internal server error
 */
router.get('/date/:date', getAttendanceByDate);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The attendance ID
 *     responses:
 *       200:
 *         description: Attendance record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getAttendanceById);


/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The attendance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Present, Absent]
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateAttendance);


/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The attendance ID
 *     responses:
 *       200:
 *         description: Attendance deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteAttendance);

export default router;
