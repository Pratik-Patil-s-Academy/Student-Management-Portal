import express from 'express';
import {
  markAttendance,
  getAttendanceByBatch,
  getAttendanceByStudent,
  getAttendanceByDate,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';

const router = express.Router();


router.post('/mark', markAttendance);


router.get('/batch/:batchId', getAttendanceByBatch);

router.get('/student/:studentId', getAttendanceByStudent);

router.get('/student/:studentId/stats', getAttendanceStats);


router.get('/date/:date', getAttendanceByDate);


router.put('/:id', updateAttendance);


router.delete('/:id', deleteAttendance);

export default router;
