const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  installmentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },


  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'UPI', 'Card', 'Bank Transfer']
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

module.exports = mongoose.model('Installment', installmentSchema);
