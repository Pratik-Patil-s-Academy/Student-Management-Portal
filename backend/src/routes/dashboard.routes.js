import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', isAuth, getDashboardStats);

export default router;
