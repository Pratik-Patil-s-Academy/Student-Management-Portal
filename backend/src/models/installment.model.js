import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  paymentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Paid'],
    default: 'Paid'
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'UPI', 'Card', 'Bank Transfer'],
    required: true
  },
  transactionId: {
    type: String
  },
  remarks: {
    type: String
  },
  installmentReceiptNumber: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Index for faster queries
installmentSchema.index({ student: 1 });
installmentSchema.index({ status: 1, paymentDate: 1 });
installmentSchema.index({ installmentReceiptNumber: 1 });

// Pre-save hook for validation (async to work with transactions)
installmentSchema.pre('save', async function() {
  // Validate installment receipt number format
  if (this.installmentReceiptNumber && !this.installmentReceiptNumber.match(/^RCP\d{8}-\d+$/)) {
    throw new Error('Invalid installment receipt number format');
  }
});

export const Installment = mongoose.model('Installment', installmentSchema);
