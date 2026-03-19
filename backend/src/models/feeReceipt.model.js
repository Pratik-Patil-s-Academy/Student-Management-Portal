import mongoose from "mongoose";

const feeReceiptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  installmentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Installment",
    required: true
  }],

  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },

  receiptDate: {
    type: Date,
    default: Date.now
  },

  receivedFrom: {
    type: String,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },

  amountInWords: {
    type: String
  },

  paymentMode: {
    type: String,
    enum: ["Cash", "Online", "UPI", "Card", "Bank Transfer"],
    required: true
  },

  transactionId: {
    type: String
  },

  remarks: {
    type: String
  },

  feeStatus: {
    type: String,
    enum: ["Pending", "Partially Paid", "Paid"],
    default: "Pending"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }

}, { timestamps: true });

export const FeeReceipt = mongoose.model("FeeReceipt", feeReceiptSchema);
