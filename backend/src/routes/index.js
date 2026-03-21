import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import admissionRoutes from './admission.routes.js';
import batchRoutes from './batch.routes.js';
import studentRoutes from './student.routes.js';
import attendanceRoutes from './attendance.routes.js';
import testRoutes from './test.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import feeRoutes from './fee.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);
router.use('/admissions', admissionRoutes);
router.use('/students', studentRoutes);
router.use('/batches', batchRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/tests', testRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/fees', feeRoutes);

// 404 Handler for undefined routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`
  });
});

export default router;
