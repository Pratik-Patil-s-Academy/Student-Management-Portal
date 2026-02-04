const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    // Example: "Morning Batch A", "Remedial Batch 1"
  },
  standard: {
    type: String,
    required: true,
    trim: true,
    // Example: "10th", "12th Science", "11th Commerce"
  },
  time: {
    startTime: {
      type: String,
      required: true,
      // Format: "09:00 AM"
    },
    endTime: {
      type: String,
      required: true,
      // Format: "11:00 AM"
    }
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});


module.exports = mongoose.model('Batch', batchSchema);
