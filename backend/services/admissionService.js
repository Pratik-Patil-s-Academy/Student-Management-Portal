import { Admission } from '../models/admissionModel.js';
import { Student } from '../models/studentModel.js';
import getDataUrl from '../utils/urlgenerator.js';
import cloudinary from '../utils/cloudinary.js';

export const validateAdmissionData = (data) => {
  // Handle both nested and flat structures
  const fullName = data.personalDetails?.fullName || data.fullName;
  const parentMobile = data.contact?.parentMobile || data.parentMobile;
  const studentMobile = data.contact?.studentMobile || data.studentMobile;
  const email = data.contact?.email || data.email;
  const gender = data.personalDetails?.gender || data.gender;
  const standard = data.standard;

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

  if (!standard) {
    throw new Error('Standard is required');
  }

  if (!['11', '12', 'Others'].includes(standard)) {
    throw new Error('Standard must be 11, 12, or Others');
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
  if (!file) {
    throw new Error('Photo is required');
  }

  if (file.size > 1048576) {
    throw new Error('Image size must be less than 1MB');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Only JPG, JPEG, and PNG images are allowed');
  }

  const fileUrl = getDataUrl(file);
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(fileUrl.content, {
      folder: 'student_photos',
      resource_type: 'image'
    });
    console.log('Cloudinary Response:', cloudinaryResponse);
    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

export const createAdmissionRecord = async (data, photoUrl) => {
  // Handle both nested and flat structures
  let admissionData;

  // Check if data is already in nested format (from frontend)
  if (data.personalDetails || data.parents || data.academics || data.contact || data.admission) {
    admissionData = {
      personalDetails: {
        fullName: data.personalDetails?.fullName?.trim() || '',
        address: data.personalDetails?.address?.trim() || '',
        dob: data.personalDetails?.dob || null,
        gender: data.personalDetails?.gender || null,
        caste: data.personalDetails?.caste?.trim() || '',
        photoUrl: photoUrl || data.personalDetails?.photoUrl || ''
      },
      parents: {
        father: {
          name: data.parents?.father?.name?.trim() || '',
          occupation: data.parents?.father?.occupation?.trim() || ''
        },
        mother: {
          name: data.parents?.mother?.name?.trim() || '',
          occupation: data.parents?.mother?.occupation?.trim() || ''
        }
      },
      contact: {
        parentMobile: data.contact?.parentMobile || '',
        studentMobile: data.contact?.studentMobile || '',
        email: data.contact?.email?.trim() || ''
      },
      academics: {
        ssc: {
          board: data.academics?.ssc?.board || null,
          schoolName: data.academics?.ssc?.schoolName?.trim() || '',
          percentageOrCGPA: data.academics?.ssc?.percentageOrCGPA ? Number(data.academics.ssc.percentageOrCGPA) : null,
          mathsMarks: data.academics?.ssc?.mathsMarks ? Number(data.academics.ssc.mathsMarks) : null
        },
        hsc: {
          board: data.academics?.hsc?.board || null,
          collegeName: data.academics?.hsc?.collegeName?.trim() || '',
          percentageOrCGPA: data.academics?.hsc?.percentageOrCGPA ? Number(data.academics.hsc.percentageOrCGPA) : null,
          mathsMarks: data.academics?.hsc?.mathsMarks ? Number(data.academics.hsc.mathsMarks) : null
        }
      },
      admission: {
        reference: data.admission?.reference?.trim() || '',
        admissionDate: data.admission?.admissionDate || null,
        targetExamination: data.admission?.targetExamination?.trim() || ''
      },
      standard: data.standard,
      batch: data.batch || null,
      rollno: data.rollno ? Number(data.rollno) : null,
      status: data.status || 'Pending'
    };
  } else {
    // Handle flat structure (backward compatibility)
    const {
      fullName, address, dob, gender, caste,
      fatherName, fatherOccupation, motherName, motherOccupation,
      parentMobile, studentMobile, email,
      sscBoard, sscSchoolName, sscPercentageOrCGPA, sscMathsMarks,
      hscBoard, hscCollegeName, hscPercentageOrCGPA, hscMathsMarks,
      reference, admissionDate, targetExamination, standard, batch, rollno
    } = data;

    admissionData = {
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
      standard,
      batch: batch || null,
      rollno: rollno ? Number(rollno) : null,
      status: 'Pending'
    };
  }

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
    standard: admission.standard,
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
