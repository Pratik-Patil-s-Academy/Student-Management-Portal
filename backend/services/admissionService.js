import { Admission } from '../models/admissionModel.js';
import { Student } from '../models/studentModel.js';
import getDataUrl from '../utils/urlgenerator.js';
import cloudinary from '../utils/cloudinary.js';

export const validateAdmissionData = (data) => {
  const { fullName, parentMobile, studentMobile, email, gender } = data;

  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Full name is required (min 2 characters)');
  }

  if (!parentMobile || !/^[0-9]{10}$/.test(parentMobile)) {
    throw new Error('Valid 10-digit parent mobile number is required');
  }

  if (studentMobile && !/^[0-9]{10}$/.test(studentMobile)) {
    throw new Error('Student mobile must be 10 digits');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email address is required');
  }

  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    throw new Error('Gender must be Male, Female, or Other');
  }
};

export const checkRollNumberAvailability = async (rollno) => {
  if (!rollno) return;

  const existingAdmission = await Admission.findOne({ rollno: Number(rollno) });
  if (existingAdmission) {
    throw new Error('Roll number already exists');
  }

  const existingStudent = await Student.findOne({ rollno: Number(rollno) });
  if (existingStudent) {
    throw new Error('Roll number already assigned to a student');
  }
};

export const uploadStudentPhoto = async (file) => {
  if (!file) return '';

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

export const createAdmissionRecord = async (data, photoUrl) => {
  const {
    fullName, address, dob, gender, caste,
    fatherName, fatherOccupation, motherName, motherOccupation,
    parentMobile, studentMobile, email,
    sscBoard, sscSchoolName, sscPercentageOrCGPA, sscMathsMarks,
    hscBoard, hscCollegeName, hscPercentageOrCGPA, hscMathsMarks,
    reference, admissionDate, targetExamination, batch, rollno
  } = data;

  const admissionData = {
    personalDetails: {
      fullName: fullName.trim(),
      address: address?.trim() || '',
      dob: dob || null,
      gender: gender || null,
      caste: caste?.trim() || '',
      photoUrl
    },
    parents: {
      father: {
        name: fatherName?.trim() || '',
        occupation: fatherOccupation?.trim() || ''
      },
      mother: {
        name: motherName?.trim() || '',
        occupation: motherOccupation?.trim() || ''
      }
    },
    contact: {
      parentMobile,
      studentMobile: studentMobile || '',
      email: email?.trim() || ''
    },
    academics: {
      ssc: {
        board: sscBoard || null,
        schoolName: sscSchoolName?.trim() || '',
        percentageOrCGPA: sscPercentageOrCGPA ? Number(sscPercentageOrCGPA) : null,
        mathsMarks: sscMathsMarks ? Number(sscMathsMarks) : null
      },
      hsc: {
        board: hscBoard || null,
        collegeName: hscCollegeName?.trim() || '',
        percentageOrCGPA: hscPercentageOrCGPA ? Number(hscPercentageOrCGPA) : null,
        mathsMarks: hscMathsMarks ? Number(hscMathsMarks) : null
      }
    },
    admission: {
      reference: reference?.trim() || '',
      admissionDate: admissionDate || null,
      targetExamination: targetExamination?.trim() || ''
    },
    batch: batch || null,
    rollno: rollno ? Number(rollno) : null,
    status: 'Pending'
  };

  return await Admission.create(admissionData);
};

export const fetchPendingAdmissions = async () => {
  return await Admission.find({ status: 'Pending' })
    .populate('batch')
    .sort({ createdAt: -1 });
};

export const fetchAdmissionById = async (id) => {
  const admission = await Admission.findById(id).populate('batch');
  
  if (!admission) {
    throw new Error('Admission not found');
  }
  
  return admission;
};

export const approveAdmission = async (admissionId) => {
  const admission = await Admission.findById(admissionId);

  if (!admission) {
    throw new Error('Admission not found');
  }

  if (admission.status !== 'Pending') {
    throw new Error(`Admission already ${admission.status.toLowerCase()}`);
  }

  const studentData = {
    personalDetails: admission.personalDetails,
    parents: admission.parents,
    contact: admission.contact,
    academics: admission.academics,
    admission: admission.admission,
    batch: admission.batch,
    rollno: admission.rollno,
    status: 'Admitted'
  };

  const student = await Student.create(studentData);
  await Admission.findByIdAndDelete(admissionId);

  return student;
};

export const rejectAdmission = async (admissionId) => {
  const admission = await Admission.findById(admissionId);

  if (!admission) {
    throw new Error('Admission not found');
  }

  if (admission.status !== 'Pending') {
    throw new Error(`Admission already ${admission.status.toLowerCase()}`);
  }

  await Admission.findByIdAndDelete(admissionId);
};

export const fetchAllAdmissions = async (status) => {
  const filter = status ? { status } : {};
  return await Admission.find(filter)
    .populate('batch')
    .sort({ createdAt: -1 });
};
