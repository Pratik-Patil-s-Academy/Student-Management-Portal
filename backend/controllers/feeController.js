import { Installment } from '../models/installmentModel.js';
import { FeeReceipt } from '../models/FeeReceiptModel.js';
import { Student } from '../models/studentModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as feeService from '../services/feeService.js';

export const getStudentFeeDetails = TryCatch(async (req, res) => {
  const { studentId } = req.params;
  
  const feeDetails = await feeService.fetchStudentFeeDetails(studentId);

  res.status(200).json({
    success: true,
    feeDetails
  });
});

export const makeFeePayment = TryCatch(async (req, res) => {
  const { 
    studentId, 
    amount, 
    paymentMode, 
    transactionId, 
    remarks,
    totalFees
  } = req.body;

  const result = await feeService.processPayment(
    studentId,
    amount,
    paymentMode,
    transactionId,
    remarks,
    totalFees,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: result.isFirstPayment ? 'Payment processed and receipt created successfully' : 'Payment processed successfully',
    payment: result.payment,
    receipt: result.receipt,
    allPayments: result.allPayments,
    remainingAmount: result.remainingAmount
  });
});

export const getStudentReceipt = TryCatch(async (req, res) => {
  const { studentId } = req.params;
  
  const receipt = await feeService.fetchStudentReceipt(studentId);

  res.status(200).json({
    success: true,
    receipt
  });
});

export const getReceiptById = TryCatch(async (req, res) => {
  const { receiptId } = req.params;
  
  const receipt = await feeService.fetchReceiptById(receiptId);

  res.status(200).json({
    success: true,
    receipt
  });
});