import express from 'express';
import {
  createAdmission,
  getPendingAdmissions,
  getAdmissionById,
  handleAdmissionDecision,
  getAllAdmissions
} from '../controllers/admissionController.js';
import { isAuth } from '../middlewares/isAuth.js';
import uploadFile from '../middlewares/multer.js';
import { createLimiter, uploadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admissions
 *   description: Admission management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Admission:
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
 *             caste:
 *               type: string
 *             photoUrl:
 *               type: string
 *         parents:
 *           type: object
 *           properties:
 *             father:
 *               type: object
 *             mother:
 *               type: object
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
 *         admission:
 *           type: object
 *         batch:
 *           type: string
 *         rollno:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/admissions/create:
 *   post:
 *     summary: Create a new admission inquiry
 *     tags: [Admissions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - parentMobile
 *             properties:
 *               fullName:
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
 *               fatherName:
 *                 type: string
 *               fatherOccupation:
 *                 type: string
 *               motherName:
 *                 type: string
 *               motherOccupation:
 *                 type: string
 *               parentMobile:
 *                 type: string
 *               studentMobile:
 *                 type: string
 *               email:
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
 *               file:
 *                 type: string
 *                 format: binary
 *               rollno:
 *                 type: number
 *     responses:
 *       201:
 *         description: Admission created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/create', uploadFile, createAdmission);

/**
 * @swagger
 * /api/admissions/pending:
 *   get:
 *     summary: Get all pending admissions
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending admissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 admissions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admission'
 *       500:
 *         description: Internal server error
 */
router.get('/pending', isAuth, getPendingAdmissions);

/**
 * @swagger
 * /api/admissions/all:
 *   get:
 *     summary: Get all admissions
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of all admissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 admissions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admission'
 *       500:
 *         description: Internal server error
 */
router.get('/all', isAuth, getAllAdmissions);

/**
 * @swagger
 * /api/admissions/{id}:
 *   get:
 *     summary: Get admission by ID
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The admission ID
 *     responses:
 *       200:
 *         description: Admission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 admission:
 *                   $ref: '#/components/schemas/Admission'
 *       404:
 *         description: Admission not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', isAuth, getAdmissionById);

/**
 * @swagger
 * /api/admissions/{id}/decision:
 *   put:
 *     summary: Handle admission decision (approve/reject)
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The admission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *     responses:
 *       200:
 *         description: Decision recorded successfully
 *       500:
 *         description: Internal server error
 */
router.put('/:id/decision', isAuth, handleAdmissionDecision);

export default router;
