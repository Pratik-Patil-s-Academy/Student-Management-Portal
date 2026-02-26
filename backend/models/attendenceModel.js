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

}, { timestamps: true });

// 🔒 Prevent duplicate attendance for same student + batch + date
attendanceSchema.index({ batchId: 1, studentId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);

// Sync indexes to automatically drop obsolete ones (e.g., batchId_1_date_1)
Attendance.syncIndexes().catch(console.error);
