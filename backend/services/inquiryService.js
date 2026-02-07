import { Inquiry } from '../models/inquiryModel.js';

export const validateInquiryData = (data) => {
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

export const createInquiryRecord = async (data) => {
  const {
    fullName, gender, address, fatherName, fatherOccupation,
    motherName, motherOccupation, parentMobile, studentMobile, email,
    reference, interestedStudentNote, sscBoard, sscSchoolName,
    sscPercentageOrCGPA, sscMathsMarks, eleventhBoard, eleventhCollegeName,
    eleventhPercentageOrCGPA, eleventhMathsMarks, specialRequirement, inquiryDate
  } = data;

  const inquiryData = {
    inquiryDate: inquiryDate || Date.now(),
    studentDetails: {
      fullName: fullName.trim(),
      gender: gender || null,
      address: address?.trim() || ''
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
    reference: reference?.trim() || '',
    interestedStudentNote: interestedStudentNote?.trim() || '',
    academics: {
      ssc: {
        board: sscBoard || null,
        schoolName: sscSchoolName?.trim() || '',
        percentageOrCGPA: sscPercentageOrCGPA ? Number(sscPercentageOrCGPA) : null,
        mathsMarks: sscMathsMarks ? Number(sscMathsMarks) : null
      },
      eleventh: {
        board: eleventhBoard || null,
        collegeName: eleventhCollegeName?.trim() || '',
        percentageOrCGPA: eleventhPercentageOrCGPA ? Number(eleventhPercentageOrCGPA) : null,
        mathsMarks: eleventhMathsMarks ? Number(eleventhMathsMarks) : null
      }
    },
    specialRequirement: specialRequirement?.trim() || '',
    status: 'New'
  };

  return await Inquiry.create(inquiryData);
};

export const fetchAllInquiries = async (status) => {
  const filter = status ? { status } : {};
  return await Inquiry.find(filter).sort({ createdAt: -1 });
};

export const fetchInquiryById = async (inquiryId) => {
  const inquiry = await Inquiry.findById(inquiryId);

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  return inquiry;
};

export const updateInquiryStatusRecord = async (inquiryId, status) => {
  const validStatuses = ['New', 'In Progress', 'Follow Up Required', 'Converted', 'Closed'];
  
  if (!status || !validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    inquiryId,
    { status },
    { new: true }
  );

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  return inquiry;
};

export const validateInquiryUpdateData = (data) => {
  const { parentMobile, studentMobile, email } = data;

  if (parentMobile && !/^[0-9]{10}$/.test(parentMobile)) {
    throw new Error('Valid 10-digit parent mobile number is required');
  }

  if (studentMobile && !/^[0-9]{10}$/.test(studentMobile)) {
    throw new Error('Student mobile must be 10 digits');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email address is required');
  }
};

export const updateInquiryRecord = async (inquiryId, updateData) => {
  const inquiry = await Inquiry.findById(inquiryId);

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  const {
    fullName, gender, address, fatherName, fatherOccupation,
    motherName, motherOccupation, parentMobile, studentMobile, email,
    reference, interestedStudentNote, sscBoard, sscSchoolName,
    sscPercentageOrCGPA, sscMathsMarks, eleventhBoard, eleventhCollegeName,
    eleventhPercentageOrCGPA, eleventhMathsMarks, specialRequirement, status
  } = updateData;

  if (fullName) inquiry.studentDetails.fullName = fullName.trim();
  if (gender) inquiry.studentDetails.gender = gender;
  if (address !== undefined) inquiry.studentDetails.address = address.trim();

  if (fatherName !== undefined) inquiry.parents.father.name = fatherName.trim();
  if (fatherOccupation !== undefined) inquiry.parents.father.occupation = fatherOccupation.trim();
  if (motherName !== undefined) inquiry.parents.mother.name = motherName.trim();
  if (motherOccupation !== undefined) inquiry.parents.mother.occupation = motherOccupation.trim();

  if (parentMobile) inquiry.contact.parentMobile = parentMobile;
  if (studentMobile !== undefined) inquiry.contact.studentMobile = studentMobile;
  if (email !== undefined) inquiry.contact.email = email.trim();

  if (reference !== undefined) inquiry.reference = reference.trim();
  if (interestedStudentNote !== undefined) inquiry.interestedStudentNote = interestedStudentNote.trim();
  if (specialRequirement !== undefined) inquiry.specialRequirement = specialRequirement.trim();

  if (sscBoard !== undefined) inquiry.academics.ssc.board = sscBoard;
  if (sscSchoolName !== undefined) inquiry.academics.ssc.schoolName = sscSchoolName.trim();
  if (sscPercentageOrCGPA !== undefined) inquiry.academics.ssc.percentageOrCGPA = Number(sscPercentageOrCGPA);
  if (sscMathsMarks !== undefined) inquiry.academics.ssc.mathsMarks = Number(sscMathsMarks);

  if (eleventhBoard !== undefined) inquiry.academics.eleventh.board = eleventhBoard;
  if (eleventhCollegeName !== undefined) inquiry.academics.eleventh.collegeName = eleventhCollegeName.trim();
  if (eleventhPercentageOrCGPA !== undefined) inquiry.academics.eleventh.percentageOrCGPA = Number(eleventhPercentageOrCGPA);
  if (eleventhMathsMarks !== undefined) inquiry.academics.eleventh.mathsMarks = Number(eleventhMathsMarks);

  if (status) {
    const validStatuses = ['New', 'In Progress', 'Follow Up Required', 'Converted', 'Closed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    inquiry.status = status;
  }

  await inquiry.save();
  return inquiry;
};

export const deleteInquiryRecord = async (inquiryId) => {
  const inquiry = await Inquiry.findById(inquiryId);

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  await Inquiry.findByIdAndDelete(inquiryId);
};

export const fetchInquiriesByStatus = async (status) => {
  const validStatuses = ['New', 'In Progress', 'Follow Up Required', 'Converted', 'Closed'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return await Inquiry.find({ status }).sort({ createdAt: -1 });
};

export const calculateInquiryStats = async () => {
  const stats = await Inquiry.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalInquiries = await Inquiry.countDocuments();

  const formattedStats = {
    total: totalInquiries,
    byStatus: {}
  };

  stats.forEach(stat => {
    formattedStats.byStatus[stat._id] = stat.count;
  });

  return formattedStats;
};
