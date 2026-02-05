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

const router = express.Router();

router.post('/create', uploadFile, createAdmission);

router.get('/pending', isAuth, getPendingAdmissions);
router.get('/all', isAuth, getAllAdmissions);
router.get('/:id', isAuth, getAdmissionById);
router.put('/:id/decision', isAuth, handleAdmissionDecision);

export default router;
