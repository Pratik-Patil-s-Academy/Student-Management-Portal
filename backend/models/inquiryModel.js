import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({

  inquiryDate: {
    type: Date,
    default: Date.now
  },

  studentDetails: {
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: String
  },

  parents: {
    father: {
      name: String,
      occupation: String
    },
    mother: {
      name: String,
      occupation: String
    }
  },

  contact: {
    parentMobile: { type: String, required: true },
    studentMobile: String,
    email: String
  },

  reference: String,

  interestedStudentNote: String,

  academics: {
    ssc: {
      board: {
        type: String,
        enum: ["State Board", "CBSE", "ICSE"]
      },
      schoolName: String,
      percentageOrCGPA: Number,
      mathsMarks: Number
    },

    eleventh: {
      board: {
        type: String,
        enum: ["State Board", "CBSE", "ICSE"]
      },
      collegeName: String,
      percentageOrCGPA: Number,
      mathsMarks: Number
    }
  },

  specialRequirement: String,

  status: {
    type: String,
    enum: ["New", "In Progress", "Follow Up Required", "Converted", "Closed"],
    default: "New"
  }

}, { timestamps: true });

export const Inquiry = mongoose.model("Inquiry", inquirySchema);
