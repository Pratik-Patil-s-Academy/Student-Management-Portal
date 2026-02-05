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

router.post('/create', isAuth, createBatch);
router.put('/:id', isAuth, updateBatch);
router.delete('/:id', isAuth, deleteBatch);
router.post('/:id/add-students', isAuth, addStudentsToBatch);
router.post('/:id/remove-students', isAuth, removeStudentsFromBatch);
router.get('/all', isAuth, getAllBatches);
router.get('/:id', isAuth, getBatchById);

export default router;
