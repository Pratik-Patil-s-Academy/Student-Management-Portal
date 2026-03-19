import { Student } from '../models/student.model.js';
import { Batch } from '../models/batch.model.js';
import { Admission } from '../models/admission.model.js';
import getDataUrl from '../utils/urlGenerator.js';
import cloudinary from '../config/cloudinary.js';

export const validateStudentCreate = async (data) => {
  const { fullName, parentMobile, standard } = data;

  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Full name is required (minimum 2 characters)');
  }

  if (!parentMobile || !/^[0-9]{10}$/.test(parentMobile)) {
    throw new Error('Valid 10-digit parent mobile number is required');
  }

  if (!standard || !['11', '12', 'Others'].includes(standard)) {
    throw new Error('Standard must be 11, 12, or Others');
  }

  // Check duplicate parent mobile
  const existingByMobile = await Student.findOne({ 'contact.parentMobile': parentMobile });
  if (existingByMobile) {
    throw new Error('A student with this parent mobile number already exists');
  }
};

export const createStudentRecord = async (data, file) => {
  const {
    fullName, address, dob, gender, caste,
    fatherName, fatherOccupation, motherName, motherOccupation,
    parentMobile, studentMobile, email,
    sscBoard, sscSchoolName, sscPercentageOrCGPA, sscMathsMarks,
    hscBoard, hscCollegeName, hscPercentageOrCGPA, hscMathsMarks,
    reference, admissionDate, targetExamination,
    standard, batch, rollno, status
  } = data;

  // Optional photo upload
  let photoUrl = '';
  if (file) {
    if (file.size > 1048576) throw new Error('Image size must be less than 1MB');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) throw new Error('Only JPG, JPEG, and PNG images are allowed');
    const fileUrl = getDataUrl(file);
    const cloudRes = await cloudinary.uploader.upload(fileUrl.content, {
      folder: 'student_photos',
      resource_type: 'image'
    });
    photoUrl = cloudRes.secure_url;
  }

  const studentData = {
    personalDetails: {
      fullName: fullName.trim(),
      address: address?.trim() || '',
      dob: dob || null,
      gender: gender || undefined,
      caste: caste?.trim() || '',
      photoUrl
    },
    parents: {
      father: { name: fatherName?.trim() || '', occupation: fatherOccupation?.trim() || '' },
      mother: { name: motherName?.trim() || '', occupation: motherOccupation?.trim() || '' }
    },
    contact: {
      parentMobile,
      studentMobile: studentMobile || '',
      email: email?.trim() || ''
    },
    academics: {
      ssc: {
        board: sscBoard || undefined,
        schoolName: sscSchoolName?.trim() || '',
        percentageOrCGPA: sscPercentageOrCGPA ? Number(sscPercentageOrCGPA) : undefined,
        mathsMarks: sscMathsMarks ? Number(sscMathsMarks) : undefined
      },
      hsc: {
        board: hscBoard || undefined,
        collegeName: hscCollegeName?.trim() || '',
        percentageOrCGPA: hscPercentageOrCGPA ? Number(hscPercentageOrCGPA) : undefined,
        mathsMarks: hscMathsMarks ? Number(hscMathsMarks) : undefined
      }
    },
    admission: {
      reference: reference?.trim() || '',
      admissionDate: admissionDate || null,
      targetExamination: targetExamination?.trim() || ''
    },
    standard,
    batch: batch || null,
    rollno: rollno ? Number(rollno) : undefined,
    status: status || 'Admitted'
  };

  const student = await Student.create(studentData);

  // If a batch was provided, add student to batch's students array
  if (batch) {
    await Batch.findByIdAndUpdate(batch, { $addToSet: { students: student._id } });
  }

  return await student.populate('batch');
};

export const fetchAllStudents = async () => {
  return await Student.find()
    .populate('batch')
    .sort({ createdAt: -1 });
};

export const fetchStudentById = async (studentId) => {
  const student = await Student.findById(studentId).populate('batch');

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};

export const fetchStudentByRollNo = async (rollno) => {
  const student = await Student.findOne({ rollno: Number(rollno) }).populate('batch');

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};

export const validateStudentUpdate = async (studentId, rollno, parentMobile, studentMobile, email) => {
  if (parentMobile && !/^[0-9]{10}$/.test(parentMobile)) {
    throw new Error('Valid 10-digit parent mobile number is required');
  }

  if (studentMobile && !/^[0-9]{10}$/.test(studentMobile)) {
    throw new Error('Student mobile must be 10 digits');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email address is required');
  }

  if (rollno !== undefined && rollno !== null && rollno !== '') {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const rollNumber = Number(rollno);
    if (rollNumber !== student.rollno) {
      const existingStudent = await Student.findOne({ rollno: rollNumber });
      if (existingStudent) {
        throw new Error('Roll number already assigned to another student');
      }

      const existingAdmission = await Admission.findOne({ rollno: rollNumber });
      if (existingAdmission) {
        throw new Error('Roll number already exists in admissions');
      }
    }
  }
};

export const uploadStudentPhotoUpdate = async (file, currentPhotoUrl) => {
  if (!file) return currentPhotoUrl;

  if (file.size > 1048576) {
    throw new Error('Image size must be less than 1MB');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Only JPG, JPEG, and PNG images are allowed');
  }

  const fileUrl = getDataUrl(file);
  const cloudinaryResponse = await cloudinary.uploader.upload(fileUrl.content, {
    folder: 'student_photos',
    resource_type: 'image'
  });

  return cloudinaryResponse.secure_url;
};

export const updateStudentRecord = async (studentId, updateData, photoUrl) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error('Student not found');
  }

  const {
    fullName, address, dob, gender, caste,
    fatherName, fatherOccupation, motherName, motherOccupation,
    parentMobile, studentMobile, email,
    sscBoard, sscSchoolName, sscPercentageOrCGPA, sscMathsMarks,
    hscBoard, hscCollegeName, hscPercentageOrCGPA, hscMathsMarks,
    reference, admissionDate, targetExamination, standard, batch, rollno, status
  } = updateData;

  if (fullName) student.personalDetails.fullName = fullName.trim();
  if (address !== undefined) student.personalDetails.address = address.trim();
  if (dob) student.personalDetails.dob = dob;
  if (gender) student.personalDetails.gender = gender;
  if (caste !== undefined) student.personalDetails.caste = caste.trim();
  student.personalDetails.photoUrl = photoUrl;

  if (fatherName !== undefined) student.parents.father.name = fatherName.trim();
  if (fatherOccupation !== undefined) student.parents.father.occupation = fatherOccupation.trim();
  if (motherName !== undefined) student.parents.mother.name = motherName.trim();
  if (motherOccupation !== undefined) student.parents.mother.occupation = motherOccupation.trim();

  if (parentMobile) student.contact.parentMobile = parentMobile;
  if (studentMobile !== undefined) student.contact.studentMobile = studentMobile;
  if (email !== undefined) student.contact.email = email.trim();

  if (sscBoard !== undefined) student.academics.ssc.board = sscBoard;
  if (sscSchoolName !== undefined) student.academics.ssc.schoolName = sscSchoolName.trim();
  if (sscPercentageOrCGPA !== undefined) student.academics.ssc.percentageOrCGPA = Number(sscPercentageOrCGPA);
  if (sscMathsMarks !== undefined) student.academics.ssc.mathsMarks = Number(sscMathsMarks);

  if (hscBoard !== undefined) student.academics.hsc.board = hscBoard;
  if (hscCollegeName !== undefined) student.academics.hsc.collegeName = hscCollegeName.trim();
  if (hscPercentageOrCGPA !== undefined) student.academics.hsc.percentageOrCGPA = Number(hscPercentageOrCGPA);
  if (hscMathsMarks !== undefined) student.academics.hsc.mathsMarks = Number(hscMathsMarks);

  if (reference !== undefined) student.admission.reference = reference.trim();
  if (admissionDate) student.admission.admissionDate = admissionDate;
  if (targetExamination !== undefined) student.admission.targetExamination = targetExamination.trim();

  if (standard) student.standard = standard;
  if (batch !== undefined) student.batch = batch;
  if (rollno !== undefined) student.rollno = rollno ? Number(rollno) : null;
  if (status) student.status = status;

  await student.save();
  return student;
};

export const deleteStudentRecord = async (studentId) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error('Student not found');
  }

  if (student.batch) {
    await Batch.findByIdAndUpdate(
      student.batch,
      { $pull: { students: student._id } }
    );
  }

  await Student.findByIdAndDelete(studentId);
};

export const updateStudentStatusRecord = async (studentId, status) => {
  if (!status || !['Admitted', 'Not Admitted', 'Dropped'].includes(status)) {
    throw new Error('Status must be Admitted, Not Admitted, or Dropped');
  }

  const student = await Student.findByIdAndUpdate(
    studentId,
    { status },
    { new: true }
  ).populate('batch');

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};

export const assignBatchToStudentRecord = async (studentId, batchId) => {
  if (!batchId) {
    throw new Error('Batch ID is required');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  if (student.batch) {
    await Batch.findByIdAndUpdate(
      student.batch,
      { $pull: { students: student._id } }
    );
  }

  student.batch = batchId;
  await student.save();

  if (!batch.students.includes(student._id)) {
    batch.students.push(student._id);
    await batch.save();
  }

  return await student.populate('batch');
};

export const removeBatchFromStudentRecord = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  if (student.batch) {
    await Batch.findByIdAndUpdate(
      student.batch,
      { $pull: { students: student._id } }
    );
  }

  student.batch = null;
  await student.save();

  return student;
};

export const fetchStudentsWithNoBatch = async () => {
  return await Student.find({
    $or: [
      { batch: { $exists: false } },
      { batch: null }
    ]
  });
};

/**
 * Get all Standard 11 students with their fee status for the promote preview.
 */
export const getStudentsForPromotion = async () => {
  const { Installment } = await import('../models/installment.model.js');
  const { FeeReceipt } = await import('../models/feeReceipt.model.js');

  const students = await Student.find({ standard: '11' })
    .select('_id personalDetails rollno contact batch')
    .populate('batch', 'name');

  const studentsWithFees = await Promise.all(students.map(async (s) => {
    const receipt = await FeeReceipt.findOne({ studentId: s._id }).lean();
    const feeStatus = receipt
      ? { totalFees: receipt.totalAmount + receipt.remainingAmount, paid: receipt.totalAmount, remaining: receipt.remainingAmount, status: receipt.feeStatus }
      : { totalFees: 0, paid: 0, remaining: 0, status: 'No Fees' };
    return { ...s.toObject(), feeStatus };
  }));

  return studentsWithFees;
};

/**
 * Promote selected students from standard '11' to '12'.
 * - Carries forward outstanding dues to the next standard.
 * - Removes them from their current batches.
 * @param {string[]} studentIds - IDs of students to promote
 * @param {string} adminId - ID of the admin performing promotion
 */
export const promoteStudentsToNextStandard = async (studentIds, adminId) => {
  const mongoose = (await import('mongoose')).default;
  const FeeReceipt = mongoose.model('FeeReceipt');
  const FeeStructure = mongoose.model('FeeStructure');
  const Batch = mongoose.model('Batch');
  const { generateReceiptNumber } = await import('./fee.service.js');

  if (!studentIds || studentIds.length === 0) {
    throw new Error('No students selected for promotion');
  }

  // 1. Fetch Standard 11 and Standard 12 fee structure
  const fee11 = await FeeStructure.findOne({ standard: '11' });
  const fee12 = await FeeStructure.findOne({ standard: '12' });

  if (!fee12) {
    throw new Error('Fee structure for Standard 12 not found. Please set it up first.');
  }

  // 2. Verify all selected students are actually Standard 11
  const students = await Student.find({ _id: { $in: studentIds }, standard: '11' }).select('_id batch personalDetails');
  if (students.length === 0) {
    return { promoted: 0, message: 'No valid Standard 11 students found in selection' };
  }

  const validIds = students.map(s => s._id);
  const batchIds = [...new Set(students.filter(s => s.batch).map(s => s.batch.toString()))];

  console.log(`Starting promotion for ${students.length} students. Carry forward fee: ${fee12.totalFee}`);

  // 3. Process fee receipts — carry forward dues
  for (const student of students) {
    // Exact match for ObjectId
    let receipt = await FeeReceipt.findOne({ studentId: student._id });

    if (receipt) {
      const oldRemaining = receipt.remainingAmount;
      receipt.remainingAmount += fee12.totalFee;
      receipt.feeStatus = 'Partially Paid';
      await receipt.save();
      console.log(`Updated receipt for ${student.personalDetails.fullName}: ${oldRemaining} -> ${receipt.remainingAmount}`);
    } else {
      // Create a new receipt with Standard 11 + Standard 12 fees
      const previousDues = fee11 ? fee11.totalFee : 0;
      const combinedRemaining = previousDues + fee12.totalFee;

      const mainReceiptNumber = await generateReceiptNumber();
      receipt = new FeeReceipt({
        studentId: student._id,
        installmentIds: [],
        receiptNumber: mainReceiptNumber,
        receivedFrom: student.personalDetails.fullName,
        totalAmount: 0,
        remainingAmount: combinedRemaining,
        paymentMode: 'Cash',
        feeStatus: 'Partially Paid',
        createdBy: adminId
      });
      await receipt.save();
      console.log(`Created new receipt for ${student.personalDetails.fullName} with combined fee ${combinedRemaining} (11th: ${previousDues}, 12th: ${fee12.totalFee})`);
    }
  }

  // 4. Bulk update students: set standard to '12', clear batch
  await Student.updateMany(
    { _id: { $in: validIds } },
    { $set: { standard: '12' }, $unset: { batch: '' } }
  );

  // 5. Remove these students from their old batches
  if (batchIds.length > 0) {
    await Batch.updateMany(
      { _id: { $in: batchIds } },
      { $pull: { students: { $in: validIds } } }
    );
  }

  return { promoted: validIds.length };
};

/**
 * Reassign roll numbers to students alphabetically by their full name.
 * Can be filtered by standard.
 * @param {string} standard - Optional standard to filter by
 */
export const reassignRollNumbers = async (standard) => {
  const query = {};
  if (standard && ['11', '12', 'Others'].includes(standard)) {
    query.standard = standard;
  }

  // Fetch students, sort alphabetically by full name
  const students = await Student.find(query).sort({ 'personalDetails.fullName': 1 });

  if (students.length === 0) {
    return { updated: 0, message: 'No students found to reassign roll numbers.' };
  }

  // Sequential update
  const bulkOps = students.map((student, index) => ({
    updateOne: {
      filter: { _id: student._id },
      update: { $set: { rollno: index + 1 } }
    }
  }));

  await Student.bulkWrite(bulkOps);

  return { updated: students.length };
};

/**
 * Demote a student who was accidentally promoted (e.g., from 12th back to 11th).
 * - Changes standard to targetStandard.
 * - Clears batch.
 * - Deducts 12th standard fee from outstanding dues if applicable.
 */
export const demoteStudent = async (studentId, targetStandard = '11') => {
  const mongoose = (await import('mongoose')).default;
  const FeeReceipt = mongoose.model('FeeReceipt');
  const FeeStructure = mongoose.model('FeeStructure');

  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  if (student.standard === targetStandard) {
    throw new Error(`Student is already in Standard ${targetStandard}`);
  }

  // If coming from 12th, try to deduct the 12th standard fees
  if (student.standard === '12') {
    const fee12 = await FeeStructure.findOne({ standard: '12' });
    if (fee12) {
      const receipt = await FeeReceipt.findOne({ studentId });
      if (receipt) {
        // Prevent negative remaining amount
        const deductAmount = Math.min(fee12.totalFee, receipt.remainingAmount);
        if (deductAmount > 0) {
          receipt.remainingAmount -= deductAmount;
          // Update status
          if (receipt.remainingAmount === 0 && receipt.totalAmount > 0) {
            receipt.feeStatus = 'Paid';
          } else if (receipt.remainingAmount === 0 && receipt.totalAmount === 0) {
            receipt.feeStatus = 'Pending';
          } else {
            receipt.feeStatus = 'Partially Paid';
          }
          await receipt.save();
        }
      }
    }
  }

  // Clear batch if needed securely
  if (student.batch) {
    const Batch = mongoose.model('Batch');
    await Batch.findByIdAndUpdate(student.batch, { $pull: { students: student._id } });
  }

  student.standard = targetStandard;
  student.batch = null;
  await student.save();

  return student;
};

