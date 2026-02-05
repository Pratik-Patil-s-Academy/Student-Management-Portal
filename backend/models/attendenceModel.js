import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({

  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  subject: {
    type: String,
    default: "Maths"
  },

  date: {
    type: Date,
    required: true
  },

  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
      },

      status: {
        type: String,
        enum: ["Present", "Absent"],
        default: "Present"
      }
    }
  ]

}, { timestamps: true });

// 🔒 Prevent duplicate attendance for same batch + date
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);

