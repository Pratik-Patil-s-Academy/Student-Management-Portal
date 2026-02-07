import express from 'express';
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  updateInquiry,
  deleteInquiry,
  getInquiriesByStatus,
  getInquiryStats
} from '../controllers/inquiryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inquiries
 *   description: Inquiry management
 */

/**
 * @swagger
 * /api/inquiries/create:
 *   post:
 *     summary: Create a new inquiry
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inquiry created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/create', createInquiry);

/**
 * @swagger
 * /api/inquiries/:
 *   get:
 *     summary: Get all inquiries
 *     tags: [Inquiries]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, In Progress, Follow Up Required, Converted, Closed]
 *     responses:
 *       200:
 *         description: List of all inquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 inquiries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inquiry'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllInquiries);

/**
 * @swagger
 * /api/inquiries/stats:
 *   get:
 *     summary: Get inquiry statistics
 *     tags: [Inquiries]
 *     responses:
 *       200:
 *         description: Inquiry statistics
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
 *                     total:
 *                       type: number
 *                     byStatus:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get('/stats', getInquiryStats);

/**
 * @swagger
 * /api/inquiries/status/{status}:
 *   get:
 *     summary: Get inquiries by status
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, In Progress, Follow Up Required, Converted, Closed]
 *         required: true
 *         description: The inquiry status
 *     responses:
 *       200:
 *         description: List of inquiries by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 inquiries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inquiry'
 *       500:
 *         description: Internal server error
 */
router.get('/status/:status', getInquiriesByStatus);

/**
 * @swagger
 * /api/inquiries/{id}:
 *   get:
 *     summary: Get inquiry by ID
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 inquiry:
 *                   $ref: '#/components/schemas/Inquiry'
 *       404:
 *         description: Inquiry not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getInquiryById);

/**
 * @swagger
 * /api/inquiries/{id}/status:
 *   patch:
 *     summary: Update inquiry status
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The inquiry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [New, In Progress, Follow Up Required, Converted, Closed]
 *     responses:
 *       200:
 *         description: Inquiry status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 inquiry:
 *                   $ref: '#/components/schemas/Inquiry'
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/status', updateInquiryStatus);

/**
 * @swagger
 * /api/inquiries/{id}:
 *   put:
 *     summary: Update an inquiry
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The inquiry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               address:
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
 *               reference:
 *                 type: string
 *               interestedStudentNote:
 *                 type: string
 *               sscBoard:
 *                 type: string
 *               sscSchoolName:
 *                 type: string
 *               sscPercentageOrCGPA:
 *                 type: number
 *               sscMathsMarks:
 *                 type: number
 *               eleventhBoard:
 *                 type: string
 *               eleventhCollegeName:
 *                 type: string
 *               eleventhPercentageOrCGPA:
 *                 type: number
 *               eleventhMathsMarks:
 *                 type: number
 *               specialRequirement:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [New, In Progress, Follow Up Required, Converted, Closed]
 *     responses:
 *       200:
 *         description: Inquiry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 inquiry:
 *                   $ref: '#/components/schemas/Inquiry'
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateInquiry);

/**
 * @swagger
 * /api/inquiries/{id}:
 *   delete:
 *     summary: Delete an inquiry
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteInquiry);

export default router;
