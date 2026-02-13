import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/', isAuth, getDashboardStats);

export default router;
