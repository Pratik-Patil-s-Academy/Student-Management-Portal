import { Installment } from '../models/installmentModel.js';
import { FeeReceipt } from '../models/FeeReceiptModel.js';
import { Student } from '../models/studentModel.js';
import mongoose from 'mongoose';

export const fetchStudentFeeDetails = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const payments = await Installment.find({ student: studentId })
    .populate('student', 'personalDetails.fullName rollno')
    .sort({ paymentNumber: 1 });
  
  const receipt = await FeeReceipt.findOne({ studentId })
    .populate('installmentIds');

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    student: {
      _id: student._id,
      fullName: student.personalDetails.fullName,
      rollno: student.rollno
    },
    payments,
    receipt,
    totalPaid,
    hasPayments: payments.length > 0
  };
};

export const processPayment = async (
  studentId, 
  amount, 
  paymentMode, 
  transactionId, 
  remarks, 
  totalFees, 
  adminId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate basic requirements
    if (!amount || amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (!paymentMode) {
      throw new Error('Payment mode is required');
    }

    const student = await Student.findById(studentId).session(session);
    if (!student) {
      throw new Error('Student not found');
    }

    // Get existing payments
    const existingPayments = await Installment.find({ student: studentId }).session(session);
    const totalPaidSoFar = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    let isFirstPayment = existingPayments.length === 0;
    
    // If first payment, need totalFees
    if (isFirstPayment && !totalFees) {
      throw new Error('Total fees required for first payment');
    }

    // Check if payment exceeds remaining amount
    if (!isFirstPayment) {
      const receipt = await FeeReceipt.findOne({ studentId }).session(session);
      const remainingAmount = receipt ? receipt.remainingAmount : 0;
      if (amount > remainingAmount) {
        throw new Error('Payment amount exceeds remaining fees');
      }
    }

    // Create new payment record
    const paymentNumber = existingPayments.length + 1;
    
    const payment = new Installment({
      student: studentId,
      paymentNumber,
      amount,
      paymentMode,
      transactionId,
      remarks,
      status: 'Paid'
    });
    
    await payment.save({ session });

    // Handle receipt creation/update
    let receipt = await FeeReceipt.findOne({ studentId }).session(session);
    
    if (!receipt) {
      // First payment - create new receipt
      const receiptNumber = await generateReceiptNumber();
      
      receipt = new FeeReceipt({
        studentId,
        installmentIds: [payment._id],
        receiptNumber,
        receivedFrom: student.personalDetails.fullName,
        totalAmount: amount,
        remainingAmount: totalFees - amount,
        paymentMode,
        transactionId,
        remarks,
        createdBy: adminId
      });
    } else {
      // Subsequent payment - add to existing receipt
      receipt.installmentIds.push(payment._id);
      receipt.totalAmount += amount;
      receipt.remainingAmount -= amount;
      receipt.paymentMode = paymentMode;
      receipt.transactionId = transactionId;
    }

    await receipt.save({ session });
    
    // Get all payments for response
    const allPayments = await Installment.find({ student: studentId })
      .populate('student', 'personalDetails.fullName rollno')
      .sort({ paymentNumber: 1 })
      .session(session);
    
    await session.commitTransaction();
    
    return { 
      payment, 
      receipt, 
      allPayments,
      isFirstPayment,
      remainingAmount: receipt.remainingAmount
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const fetchStudentReceipt = async (studentId) => {
  const receipt = await FeeReceipt.findOne({ studentId })
    .populate('studentId', 'personalDetails.fullName rollno')
    .populate('installmentIds');
  
  if (!receipt) {
    throw new Error('No receipt found for this student');
  }

  return receipt;
};

export const fetchReceiptById = async (receiptId) => {
  const receipt = await FeeReceipt.findById(receiptId)
    .populate('studentId', 'personalDetails.fullName rollno')
    .populate('installmentIds');
  
  if (!receipt) {
    throw new Error('Receipt not found');
  }

  return receipt;
};

const generateReceiptNumber = async () => {
  const count = await FeeReceipt.countDocuments();
  const currentYear = new Date().getFullYear();
  return `RCP${currentYear}${(count + 1).toString().padStart(4, '0')}`;
};