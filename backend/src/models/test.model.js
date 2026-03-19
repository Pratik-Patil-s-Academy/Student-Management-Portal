import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true 
  },

  topic: {
    type: String 
  },

  classLevel: {
    type: String,
    enum: ["11th", "12th"],
    required: true
  },

  subject: {
    type: String,
    default: "Maths"
  },

  testDate: {
    type: Date,
    required: true
  },

  maxMarks: {
    type: Number,
    required: true
  },

  applicableBatches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch"
    }
  ],

  
  scores: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
      },

      marksObtained: {
        type: Number,
        required: true
      },

      attendanceStatus: {
        type: String,
        enum: ["Present", "Absent"],
        default: "Present"
      },

      remark: String
    }
  ]

}, { timestamps: true });

export default mongoose.model("Test", testSchema);
