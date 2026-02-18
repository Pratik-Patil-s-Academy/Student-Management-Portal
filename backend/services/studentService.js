import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';
import { Admission } from '../models/admissionModel.js';
import getDataUrl from '../utils/urlgenerator.js';
import cloudinary from '../utils/cloudinary.js';

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
  const { Installment } = await import('../models/installmentModel.js');
  const { FeeReceipt } = await import('../models/FeeReceiptModel.js');

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
 * - Resets fee records (Installment + FeeReceipt) for promoted students.
 * - Removes them from their current batches.
 * @param {string[]} studentIds - IDs of students to promote
 */
export const promoteStudentsToNextStandard = async (studentIds) => {
  const { Installment } = await import('../models/installmentModel.js');
  const { FeeReceipt } = await import('../models/FeeReceiptModel.js');

  if (!studentIds || studentIds.length === 0) {
    throw new Error('No students selected for promotion');
  }

  // Verify all selected students are actually Standard 11
  const students = await Student.find({ _id: { $in: studentIds }, standard: '11' }).select('_id batch');
  if (students.length === 0) {
    return { promoted: 0, message: 'No valid Standard 11 students found in selection' };
  }

  const validIds = students.map(s => s._id);
  const batchIds = [...new Set(students.filter(s => s.batch).map(s => s.batch.toString()))];

  // 1. Reset fee records — delete installments and receipts for promoted students
  await Installment.deleteMany({ student: { $in: validIds } });
  await FeeReceipt.deleteMany({ studentId: { $in: validIds } });

  // 2. Bulk update: set standard to '12', clear batch
  await Student.updateMany(
    { _id: { $in: validIds } },
    { $set: { standard: '12' }, $unset: { batch: '' } }
  );

  // 3. Remove these students from their old batches
  if (batchIds.length > 0) {
    await Batch.updateMany(
      { _id: { $in: batchIds } },
      { $pull: { students: { $in: validIds } } }
    );
  }

  return { promoted: validIds.length };
};

