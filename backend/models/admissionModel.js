import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({
  // ===== Personal Details =====
  personalDetails: {
    fullName: { type: String, required: true },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    caste: { type: String },
    photoUrl: { type: String }
  },

  // ===== Parent Details =====
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

  // ===== Academic Details (Embedded) =====
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

  // ===== Admission (Office Use) =====
  admission: {
    reference: String,
    admissionDate: Date,
    targetExamination: String,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
  },
  rollno: {
    type: Number
  },


  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }

}, { timestamps: true });

export const Admission = mongoose.model("Admission", admissionSchema);
