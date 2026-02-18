import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  standard: {
    type: String,
    required: true,
    enum: ['11', '12', 'Others']
  },
  time: {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    }
  },
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

/**
 * Pre-save hook: flag whether `standard` was modified so the
 * post-save hook knows whether to cascade the update.
 * Using async (no next) for Mongoose 7+ compatibility.
 */
batchSchema.pre('save', async function () {
  this._standardChanged = this.isModified('standard');
});

/**
 * Post-save hook: if a batch's `standard` was changed,
 * bulk-update all enrolled students to match the new standard.
 */
batchSchema.post('save', async function (doc) {
  if (doc._standardChanged) {
    try {
      const Student = mongoose.model('Student');
      await Student.updateMany(
        { batch: doc._id },
        { $set: { standard: doc.standard } }
      );
    } catch (err) {
      console.error('Failed to sync student standards after batch update:', err);
    }
  }
});

export const Batch = mongoose.model("Batch", batchSchema);

