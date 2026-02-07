import express from 'express';
import { getAdminProfile, loginAdmin, logOutUser } from '../controllers/adminController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login for admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: Logout for admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
router.post('/logout', logOutUser);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/profile', isAuth, getAdminProfile);
export default router;
