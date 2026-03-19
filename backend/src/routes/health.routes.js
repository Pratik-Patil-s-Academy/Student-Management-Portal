import express from 'express';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoint
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API is healthy
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'API is healthy' });
});

export default router;
