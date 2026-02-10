import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  personalDetails: {
    fullName: { type: String, required: true },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    caste: { type: String },
    photoUrl: { type: String }
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
  // ===== Contact =====
  contact: {
    parentMobile: { type: String, required: true },
    studentMobile: { type: String },
    email: { type: String }
  },
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
    hsc: {
      board: {
        type: String,
        enum: ["State Board", "CBSE", "ICSE"]
      },
      collegeName: String,
      percentageOrCGPA: Number,
      mathsMarks: Number
    }
  },
  admission: {
    reference: String,
    admissionDate: Date,
    targetExamination: String,
  },
  standard: {
    type: String,
    required: true,
    enum: ['11', '12', 'Others']
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
  },
  rollno: {
    type: Number,
 
  },
  status: {
    type: String,
    enum: ["Admitted", "Not Admitted", "Dropped"],
    default: "Admitted"
  }
}, { timestamps: true });

export const Student = mongoose.model("Student", studentSchema);
