import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';
import { Admission } from '../models/admissionModel.js';
import TryCatch from '../utils/TryCatch.js';
import getDataUrl from '../utils/urlgenerator.js';
import cloudinary from '../utils/cloudinary.js';

export const getAllStudents = TryCatch(async (req, res) => {
  
  const students = await Student.find()
    .populate('batch')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    students
  });
});

export const getStudentById = TryCatch(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id).populate('batch');

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    student
  });
});

export const getStudentByRollNo = TryCatch(async (req, res) => {
  const { rollno } = req.params;

  const student = await Student.findOne({ rollno: Number(rollno) }).populate('batch');

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    student
  });
});

export const updateStudent = TryCatch(async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    address,
    dob,
    gender,
    caste,
    fatherName,
    fatherOccupation,
    motherName,
    motherOccupation,
    parentMobile,
    studentMobile,
    email,
    sscBoard,
    sscSchoolName,
    sscPercentageOrCGPA,
    sscMathsMarks,
    hscBoard,
    hscCollegeName,
    hscPercentageOrCGPA,
    hscMathsMarks,
    reference,
    admissionDate,
    targetExamination,
    batch,
    rollno,
    status
  } = req.body;

  const student = await Student.findById(id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (parentMobile && !/^[0-9]{10}$/.test(parentMobile)) {
    return res.status(400).json({ message: 'Valid 10-digit parent mobile number is required' });
  }

  if (studentMobile && !/^[0-9]{10}$/.test(studentMobile)) {
    return res.status(400).json({ message: 'Student mobile must be 10 digits' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email address is required' });
  }

  if (rollno !== undefined && rollno !== null && rollno !== '') {
    const rollNumber = Number(rollno);
    if (rollNumber !== student.rollno) {
      const existingStudent = await Student.findOne({ rollno: rollNumber });
      if (existingStudent) {
        return res.status(400).json({ message: 'Roll number already assigned to another student' });
      }
      
      const existingAdmission = await Admission.findOne({ rollno: rollNumber });
      if (existingAdmission) {
        return res.status(400).json({ message: 'Roll number already exists in admissions' });
      }
    }
  }

  let photoUrl = student.personalDetails.photoUrl;
  if (req.file) {
    if (req.file.size > 1048576) {
      return res.status(400).json({ message: 'Image size must be less than 1MB' });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPG, JPEG, and PNG images are allowed' });
    }

    const fileUrl = getDataUrl(req.file);
    const cloudinaryResponse = await cloudinary.uploader.upload(fileUrl.content, {
      folder: 'student_photos',
      resource_type: 'image'
    });

    photoUrl = cloudinaryResponse.secure_url;
  }

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

  if (batch !== undefined) student.batch = batch;
  if (rollno !== undefined) student.rollno = rollno ? Number(rollno) : null;
  if (status) student.status = status;

  await student.save();

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    student
  });
});

export const deleteStudent = TryCatch(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (student.batch) {
    await Batch.findByIdAndUpdate(
      student.batch,
      { $pull: { students: student._id } }
    );
  }

  await Student.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully'
  });
});

export const updateStudentStatus = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Admitted', 'Not Admitted', 'Dropped'].includes(status)) {
    return res.status(400).json({ 
      message: 'Status must be Admitted, Not Admitted, or Dropped' 
    });
  }

  const student = await Student.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate('batch');

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Student status updated successfully',
    student
  });
});

export const assignBatchToStudent = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ message: 'Batch ID is required' });
  }

  const student = await Student.findById(id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const batch = await Batch.findById(batchId);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
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

  res.status(200).json({
    success: true,
    message: 'Batch assigned to student successfully',
    student
  });
});

export const removeBatchFromStudent = TryCatch(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (student.batch) {
    await Batch.findByIdAndUpdate(
      student.batch,
      { $pull: { students: student._id } }
    );
  }

  student.batch = null;
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Batch removed from student successfully',
    student
  });
});

export const getStudentsWithNoBatch = TryCatch(async (req, res) => {
    const students = await Student.find({ batch: { $exists: false } });
    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
});