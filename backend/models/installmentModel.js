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
  }
}, {
  timestamps: true
});

// Index for faster queries
installmentSchema.index({ student: 1 });
installmentSchema.index({ status: 1, dueDate: 1 });

// Pre-save hook to update status
installmentSchema.pre('save', function(next) {
  if (this.status === 'pending' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  next();
});

export const Installment = mongoose.model('Installment', installmentSchema);
