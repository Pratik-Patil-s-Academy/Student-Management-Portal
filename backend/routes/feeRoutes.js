import express from 'express';
import { 
  getStudentFeeDetails, 
  makeFeePayment, 
  getStudentReceipt,
  getReceiptById 
} from '../controllers/feeController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

// Get all fee details for a student
router.get('/student/:studentId', isAuth, getStudentFeeDetails);

// Make a fee payment (flexible amount)
router.post('/make-payment', isAuth, makeFeePayment);

// Get student's receipt
router.get('/receipt/student/:studentId', isAuth, getStudentReceipt);

// Get receipt by ID
router.get('/receipt/:receiptId', isAuth, getReceiptById);

export default router;