import express from 'express';
import {
  getStudentFeeDetails,
  makeFeePayment,
  getStudentReceipt,
  getReceiptById,
  sendInstallmentEmail,
  sendStudentAllEmails,
  getAllStudentsWithFeeStatus,
  getFeeStructures,
  upsertFeeStructure
} from '../controllers/feeController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

// Fee Structure routes
router.get('/structure', isAuth, getFeeStructures);
router.post('/structure', isAuth, upsertFeeStructure);

// Get all students with fee status
router.get('/students', isAuth, getAllStudentsWithFeeStatus);

// Get all fee details for a student
router.get('/student/:studentId', isAuth, getStudentFeeDetails);

// Make a fee payment (flexible amount)
router.post('/make-payment', isAuth, makeFeePayment);

// Get student's receipt
router.get('/receipt/student/:studentId', isAuth, getStudentReceipt);

// Get receipt by ID
router.get('/receipt/:receiptId', isAuth, getReceiptById);

// Send email for specific installment
router.post('/email/installment/:installmentId', isAuth, sendInstallmentEmail);

// Send emails for all installments of a student
router.post('/email/student/:studentId/all', isAuth, sendStudentAllEmails);

export default router;