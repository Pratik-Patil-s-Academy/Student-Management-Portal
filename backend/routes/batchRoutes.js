import express from 'express';
import {
  createBatch,
  addStudentsToBatch,
  removeStudentsFromBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch
} from '../controllers/batchController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: Batch management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Batch:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         standard:
 *           type: string
 *           enum: ['11', '12', 'Others']
 *         time:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *             endTime:
 *               type: string
 *         days:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *         students:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/batches/create:
 *   post:
 *     summary: Create a new batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - standard
 *               - startTime
 *               - endTime
 *               - days
 *             properties:
 *               name:
 *                 type: string
 *               standard:
 *                 type: string
 *                 enum: ['11', '12', 'Others']
 *               startTime:
 *                 type: string
 *                 example: "10:00 AM"
 *               endTime:
 *                 type: string
 *                 example: "12:00 PM"
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Internal server error
 */
router.post('/create', isAuth, createBatch);

/**
 * @swagger
 * /api/batches/{id}:
 *   put:
 *     summary: Update a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               standard:
 *                 type: string
 *                 enum: ['11', '12', 'Others']
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *     responses:
 *       200:
 *         description: Batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Internal server error
 */
router.put('/:id', isAuth, updateBatch);

/**
 * @swagger
 * /api/batches/{id}:
 *   delete:
 *     summary: Delete a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     responses:
 *       200:
 *         description: Batch deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', isAuth, deleteBatch);

/**
 * @swagger
 * /api/batches/{id}/add-students:
 *   post:
 *     summary: Add students to a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Students added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Internal server error
 */
router.post('/:id/add-students', isAuth, addStudentsToBatch);

/**
 * @swagger
 * /api/batches/{id}/remove-students:
 *   post:
 *     summary: Remove students from a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Students removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Internal server error
 */
router.post('/:id/remove-students', isAuth, removeStudentsFromBatch);

/**
 * @swagger
 * /api/batches/all:
 *   get:
 *     summary: Get all batches
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all batches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 batches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Internal server error
 */
router.get('/all', isAuth, getAllBatches);

/**
 * @swagger
 * /api/batches/{id}:
 *   get:
 *     summary: Get batch by ID
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     responses:
 *       200:
 *         description: Batch details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', isAuth, getBatchById);

export default router;
