import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  assignBatchToStudent,
  removeBatchFromStudent,
  getStudentsWithNoBatch,
  promoteStudents,
  getStudentsForPromotion
} from '../controllers/studentController.js';
import { isAuth } from '../middlewares/isAuth.js';
import uploadFile from '../middlewares/multer.js';
import { getAttendanceByBatch } from '../controllers/attendanceController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         personalDetails:
 *           type: object
 *           properties:
 *             fullName:
 *               type: string
 *             address:
 *               type: string
 *             dob:
 *               type: string
 *               format: date
 *             gender:
 *               type: string
 *               enum: [Male, Female, Other]
 *             caste:
 *               type: string
 *             photoUrl:
 *               type: string
 *         parents:
 *           type: object
 *           properties:
 *             father:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 occupation:
 *                   type: string
 *             mother:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 occupation:
 *                   type: string
 *         contact:
 *           type: object
 *           properties:
 *             parentMobile:
 *               type: string
 *             studentMobile:
 *               type: string
 *             email:
 *               type: string
 *         academics:
 *           type: object
 *           properties:
 *             ssc:
 *               type: object
 *               properties:
 *                 board:
 *                   type: string
 *                   enum: [State Board, CBSE, ICSE]
 *                 schoolName:
 *                   type: string
 *                 percentageOrCGPA:
 *                   type: number
 *                 mathsMarks:
 *                   type: number
 *             hsc:
 *               type: object
 *               properties:
 *                 board:
 *                   type: string
 *                   enum: [State Board, CBSE, ICSE]
 *                 collegeName:
 *                   type: string
 *                 percentageOrCGPA:
 *                   type: number
 *                 mathsMarks:
 *                   type: number
 *         admission:
 *           type: object
 *           properties:
 *             reference:
 *               type: string
 *             admissionDate:
 *               type: string
 *               format: date
 *             targetExamination:
 *               type: string
 *         batch:
 *           type: string
 *         rollno:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Admitted, Not Admitted, Dropped]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/students/all:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       500:
 *         description: Internal server error
 */
router.post('/create', isAuth, uploadFile, createStudent);
router.get('/promote', isAuth, getStudentsForPromotion);
router.post('/promote', isAuth, promoteStudents);
router.get('/all', isAuth, getAllStudents);

/**
 * @swagger
 * /api/students/nobatch:
 *   get:
 *     summary: Returns the list of students with no batch assigned
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of students with no batch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       500:
 *         description: Internal server error
 */
router.get('/nobatch', isAuth, getStudentsWithNoBatch);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get the student by id
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: The student description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', isAuth, getStudentById);

/**
 * @swagger
 * /api/students/rollno/{rollno}:
 *   get:
 *     summary: Get the student by roll number
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rollno
 *         schema:
 *           type: string
 *         required: true
 *         description: The student roll number
 *     responses:
 *       200:
 *         description: The student description by roll number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Internal server error
 */
router.get('/rollno/:rollno', isAuth, getStudentByRollNo);


/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update the student by the id
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               parentMobile:
 *                 type: string
 *               studentMobile:
 *                 type: string
 *               email:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               rollno:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               fatherOccupation:
 *                 type: string
 *               motherName:
 *                 type: string
 *               motherOccupation:
 *                 type: string
 *               address:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               caste:
 *                 type: string
 *               sscBoard:
 *                 type: string
 *               sscSchoolName:
 *                 type: string
 *               sscPercentageOrCGPA:
 *                 type: number
 *               sscMathsMarks:
 *                 type: number
 *               hscBoard:
 *                 type: string
 *               hscCollegeName:
 *                 type: string
 *               hscPercentageOrCGPA:
 *                 type: number
 *               hscMathsMarks:
 *                 type: number
 *               reference:
 *                 type: string
 *               admissionDate:
 *                 type: string
 *                 format: date
 *               targetExamination:
 *                 type: string
 *     responses:
 *       200:
 *         description: The student was updated
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Some error happened
 */
router.put('/:id', isAuth, uploadFile, updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Remove the student by id
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: The student was deleted
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Some error happened
 */
router.delete('/:id', isAuth, deleteStudent);

/**
 * @swagger
 * /api/students/{id}/status:
 *   patch:
 *     summary: Update the student status
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Admitted, Not Admitted, Dropped]
 *     responses:
 *       200:
 *         description: The student status was updated
 *       500:
 *         description: Some error happened
 */
router.patch('/:id/status', isAuth, updateStudentStatus);

/**
 * @swagger
 * /api/students/{id}/assign-batch:
 *   put:
 *     summary: Assign a batch to a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *             properties:
 *               batchId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Batch assigned successfully
 *       500:
 *         description: Some error happened
 */
router.put('/:id/assign-batch', isAuth, assignBatchToStudent);

/**
 * @swagger
 * /api/students/{id}/remove-batch:
 *   put:
 *     summary: Remove a batch from a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: Batch removed successfully
 *       500:
 *         description: Some error happened
 */
router.put('/:id/remove-batch', isAuth, removeBatchFromStudent);

/**
 * @swagger
 * /api/students/getAttendanceByBatch/{batchId}:
 *   get:
 *     summary: Get attendance by batch for students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch id
 *     responses:
 *       200:
 *         description: Attendance list
 *       500:
 *         description: Some error happened
 */
router.get('/getAttendanceByBatch/:batchId', isAuth, getAttendanceByBatch);


export default router;
