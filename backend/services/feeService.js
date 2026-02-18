import { Installment } from '../models/installmentModel.js';
import { FeeReceipt } from '../models/FeeReceiptModel.js';
import { Student } from '../models/studentModel.js';
import { FeeStructure } from '../models/feeStructureModel.js';
import { sendInstallmentReceiptEmail } from './emailService.js';
import mongoose from 'mongoose';

// ── Fee Structure ─────────────────────────────────────────────────────────────

export const getFeeStructures = async () => {
  return await FeeStructure.find().sort({ standard: 1 });
};

export const upsertFeeStructure = async (standard, totalFee, description, academicYear, adminId) => {
  if (!['11', '12', 'Others'].includes(standard)) {
    throw new Error('Standard must be 11, 12, or Others');
  }
  if (!totalFee || totalFee <= 0) {
    throw new Error('Total fee must be greater than 0');
  }

  return await FeeStructure.findOneAndUpdate(
    { standard },
    { standard, totalFee, description: description || '', academicYear, updatedBy: adminId },
    { upsert: true, new: true, runValidators: true }
  );
};


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

  // Fetch the fee structure for this student's standard
  const feeStructure = await FeeStructure.findOne({ standard: student.standard });

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    student: {
      _id: student._id,
      fullName: student.personalDetails.fullName,
      rollno: student.rollno,
      standard: student.standard
    },
    payments,
    receipt,
    totalPaid,
    hasPayments: payments.length > 0,
    feeStructure: feeStructure || null
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

    // If first payment, need totalFees — auto-lookup from FeeStructure if not provided
    if (isFirstPayment && !totalFees) {
      const feeStructure = await FeeStructure.findOne({ standard: student.standard }).session(session);
      if (feeStructure) {
        totalFees = feeStructure.totalFee;
      } else {
        throw new Error('Total fees required for first payment (no fee structure found for this standard)');
      }
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

    // Handle receipt creation/update to get receipt number for installment
    let receipt = await FeeReceipt.findOne({ studentId }).session(session);
    let mainReceiptNumber;

    if (!receipt) {
      // First payment - create new receipt
      mainReceiptNumber = await generateReceiptNumber();
      if (!mainReceiptNumber) {
        throw new Error('Failed to generate receipt number');
      }
    } else {
      // Use existing receipt number
      mainReceiptNumber = receipt.receiptNumber;
    }

    // Generate installment-specific receipt number
    const installmentReceiptNumber = `${mainReceiptNumber}-${paymentNumber}`;

    // Verify unique installment receipt number
    const existingInstallment = await Installment.findOne({
      installmentReceiptNumber
    }).session(session);

    if (existingInstallment) {
      throw new Error(`Installment receipt number ${installmentReceiptNumber} already exists`);
    }

    const payment = new Installment({
      student: studentId,
      paymentNumber,
      amount,
      paymentMode,
      transactionId,
      remarks,
      status: 'Paid',
      installmentReceiptNumber
    });

    await payment.save({ session });

    // Handle receipt creation/update
    if (!receipt) {
      // First payment - create new receipt
      const newRemainingAmount = totalFees - amount;
      receipt = new FeeReceipt({
        studentId,
        installmentIds: [payment._id],
        receiptNumber: mainReceiptNumber,
        receivedFrom: student.personalDetails.fullName,
        totalAmount: amount,
        remainingAmount: newRemainingAmount,
        paymentMode,
        transactionId,
        remarks,
        feeStatus: newRemainingAmount === 0 ? 'Paid' : 'Partially Paid',
        createdBy: adminId
      });
    } else {
      // Subsequent payment - add to existing receipt
      receipt.installmentIds.push(payment._id);
      receipt.totalAmount += amount;
      receipt.remainingAmount -= amount;
      receipt.paymentMode = paymentMode;
      receipt.transactionId = transactionId;
      // Update fee status based on remaining amount
      receipt.feeStatus = receipt.remainingAmount === 0 ? 'Paid' : 'Partially Paid';
    }

    await receipt.save({ session });

    // Get all payments for response
    const allPayments = await Installment.find({ student: studentId })
      .populate('student', 'personalDetails.fullName rollno')
      .sort({ paymentNumber: 1 })
      .session(session);

    await session.commitTransaction();

    // Send email notification asynchronously (after transaction commit)
    try {
      const totalPaidSoFar = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const emailResult = await sendInstallmentReceiptEmail(
        student,
        payment,
        totalPaidSoFar,
        receipt.remainingAmount
      );

      console.log('Email notification result:', emailResult);
    } catch (emailError) {
      // Log error but don't fail the payment process
      console.error('Email notification failed:', emailError);
    }

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