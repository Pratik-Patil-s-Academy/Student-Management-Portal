import express from 'express';
import {
  getAllStudents,
  getStudentById,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  assignBatchToStudent,
  removeBatchFromStudent,
  getStudentsWithNoBatch
} from '../controllers/studentController.js';
import { isAuth } from '../middlewares/isAuth.js';
import uploadFile from '../middlewares/multer.js';
import { getAttendanceByBatch } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/all', isAuth, getAllStudents);
router.get('/nobatch', isAuth, getStudentsWithNoBatch);
router.get('/:id', isAuth, getStudentById);
router.get('/rollno/:rollno', isAuth, getStudentByRollNo);
router.put('/:id', isAuth, uploadFile, updateStudent);
router.delete('/:id', isAuth, deleteStudent);
router.patch('/:id/status', isAuth, updateStudentStatus);
router.put('/:id/assign-batch', isAuth, assignBatchToStudent);
router.put('/:id/remove-batch', isAuth, removeBatchFromStudent);
router.get('/getAttendanceByBatch/:batchId', isAuth, getAttendanceByBatch); 


export default router;
