import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import {
  createTest,
  addOrUpdateScores,
  getTestById,
  getAllTests,
  getStudentTestHistory,
  deleteTest,
  getTestStatistics
} from '../controllers/testController.js';

const router = express.Router();

router.post('/create', isAuth, createTest);
router.get('/all', isAuth, getAllTests);
router.get('/student/:studentId', isAuth, getStudentTestHistory);
router.put('/:testId/scores', isAuth, addOrUpdateScores);
router.get('/:testId', isAuth, getTestById);
router.get('/:testId/statistics', isAuth, getTestStatistics);
router.delete('/:testId', isAuth, deleteTest);

export default router;