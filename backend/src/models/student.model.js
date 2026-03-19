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

/**
 * Pre-save middleware: whenever a student is saved with a batch assigned,
 * automatically sync their `standard` from the Batch document.
 * This ensures Student.standard always matches Batch.standard.
 */
studentSchema.pre('save', async function () {
  if (this.batch && (this.isNew || this.isModified('batch'))) {
    const Batch = mongoose.model('Batch');
    const batch = await Batch.findById(this.batch).select('standard');
    if (batch) {
      this.standard = batch.standard;
    }
  }
});

export const Student = mongoose.model("Student", studentSchema);
