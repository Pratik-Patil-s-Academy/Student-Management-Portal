import { Installment } from '../models/installmentModel.js';
import { FeeReceipt } from '../models/FeeReceiptModel.js';
import { Student } from '../models/studentModel.js';
import TryCatch from '../utils/TryCatch.js';
import * as feeService from '../services/feeService.js';
import { sendInstallmentReceiptEmail, sendBulkInstallmentReceipts } from '../services/emailService.js';

// Get all fee structures (one per standard)
export const getFeeStructures = TryCatch(async (req, res) => {
  const structures = await feeService.getFeeStructures();
  res.status(200).json({ success: true, structures });
});

// Create or update fee structure for a standard
export const upsertFeeStructure = TryCatch(async (req, res) => {
  const { standard, totalFee, description, academicYear } = req.body;
  const structure = await feeService.upsertFeeStructure(
    standard, totalFee, description, academicYear, req.user._id
  );
  res.status(200).json({ success: true, structure, message: `Fee structure for Standard ${standard} saved` });
});

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

// Send email for specific installment
export const sendInstallmentEmail = TryCatch(async (req, res) => {
  const { installmentId } = req.params;

  // Get installment with student details
  const installment = await Installment.findById(installmentId)
    .populate('student');

  if (!installment) {
    return res.status(404).json({
      success: false,
      message: 'Installment not found'
    });
  }

  // Get all payments for this student to calculate total paid
  const allPayments = await Installment.find({ student: installment.student._id })
    .sort({ paymentNumber: 1 });

  const totalPaidSoFar = allPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Get receipt to find remaining amount
  const receipt = await FeeReceipt.findOne({ studentId: installment.student._id });
  const remainingAmount = receipt ? receipt.remainingAmount : 0;

  const emailResult = await sendInstallmentReceiptEmail(
    installment.student,
    installment,
    totalPaidSoFar,
    remainingAmount
  );

  if (emailResult.success) {
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      emailResult
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: emailResult.message
    });
  }
});

// Send emails for all installments of a student
export const sendStudentAllEmails = TryCatch(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const installments = await Installment.find({ student: studentId })
    .sort({ paymentNumber: 1 });

  if (installments.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No installments found for this student'
    });
  }

  const receipt = await FeeReceipt.findOne({ studentId });
  const results = [];

  for (let i = 0; i < installments.length; i++) {
    const installment = installments[i];
    const totalPaidSoFar = installments
      .slice(0, i + 1)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const emailResult = await sendInstallmentReceiptEmail(
      student,
      installment,
      totalPaidSoFar,
      receipt ? receipt.remainingAmount : 0
    );

    results.push({
      installmentNumber: installment.paymentNumber,
      receiptNumber: installment.installmentReceiptNumber,
      ...emailResult
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bulk email process completed',
    results
  });
});

// Get all students with fee status summary
export const getAllStudentsWithFeeStatus = TryCatch(async (req, res) => {
  const students = await Student.find().select('personalDetails rollno standard contact').lean();

  const studentsWithFeeStatus = await Promise.all(
    students.map(async (student) => {
      const receipt = await FeeReceipt.findOne({ studentId: student._id }).lean();

      return {
        ...student,
        feeInfo: receipt ? {
          totalFees: receipt.totalAmount + receipt.remainingAmount,
          totalPaid: receipt.totalAmount,
          remainingAmount: receipt.remainingAmount,
          feeStatus: receipt.feeStatus || (receipt.remainingAmount === 0 ? 'Paid' : 'Partially Paid'),
          hasPayments: true
        } : {
          totalFees: 0,
          totalPaid: 0,
          remainingAmount: 0,
          feeStatus: 'Pending',
          hasPayments: false
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    students: studentsWithFeeStatus
  });
});