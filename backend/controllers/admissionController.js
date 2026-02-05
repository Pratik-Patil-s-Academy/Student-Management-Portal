import { Admission } from '../models/admissionModel.js';
import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';
import TryCatch from '../utils/TryCatch.js';
import getDataUrl from '../utils/urlgenerator.js';
import cloudinary from '../utils/cloudinary.js';

export const createAdmission = TryCatch(async (req, res) => {
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
    rollno
  } = req.body;

  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ message: 'Full name is required (min 2 characters)' });
  }

  if (!parentMobile || !/^[0-9]{10}$/.test(parentMobile)) {
    return res.status(400).json({ message: 'Valid 10-digit parent mobile number is required' });
  }

  if (studentMobile && !/^[0-9]{10}$/.test(studentMobile)) {
    return res.status(400).json({ message: 'Student mobile must be 10 digits' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email address is required' });
  }

  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    return res.status(400).json({ message: 'Gender must be Male, Female, or Other' });
  }

  if (rollno) {
    const existingAdmission = await Admission.findOne({ rollno: Number(rollno) });
    if (existingAdmission) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    const existingStudent = await Student.findOne({ rollno: Number(rollno) });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number already assigned to a student' });
    }
  }

  let photoUrl = '';
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

  const admission = await Admission.create(admissionData);

  res.status(201).json({
    success: true,
    message: 'Admission request created successfully',
    admission
  });
});

export const getPendingAdmissions = TryCatch(async (req, res) => {
  const admissions = await Admission.find({ status: 'Pending' })
    .populate('batch')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: admissions.length,
    admissions
  });
});

export const getAdmissionById = TryCatch(async (req, res) => {
  const { id } = req.params;

  const admission = await Admission.findById(id).populate('batch');

  if (!admission) {
    return res.status(404).json({ message: 'Admission not found' });
  }

  res.status(200).json({
    success: true,
    admission
  });
});

export const handleAdmissionDecision = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; 

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ 
      message: 'Action must be either "approve" or "reject"' 
    });
  }

  const admission = await Admission.findById(id);

  if (!admission) {
    return res.status(404).json({ message: 'Admission not found' });
  }

  if (admission.status !== 'Pending') {
    return res.status(400).json({ 
      message: `Admission already ${admission.status.toLowerCase()}` 
    });
  }

  if (action === 'approve') {
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

    await Admission.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Admission approved successfully',
      student
    });
  } else {
    await Admission.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Admission rejected and deleted successfully'
    });
  }
});

export const getAllAdmissions = TryCatch(async (req, res) => {
  const { status } = req.query;
  
  const filter = status ? { status } : {};
  const admissions = await Admission.find(filter)
    .populate('batch')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: admissions.length,
    admissions
  });
});
