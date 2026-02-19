import Test from '../models/testModel.js';
import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';

export const validateTestData = (data) => {
  const { title, classLevel, testDate, maxMarks, applicableBatches } = data;

  if (!title || title.trim().length < 3) {
    throw new Error('Test title is required (minimum 3 characters)');
  }

  if (!classLevel || !['11th', '12th'].includes(classLevel)) {
    throw new Error('Class level must be either "11th" or "12th"');
  }

  if (!testDate) {
    throw new Error('Test date is required');
  }

  const parsedTestDate = new Date(testDate);
  if (isNaN(parsedTestDate.getTime())) {
    throw new Error('Invalid test date format');
  }

  if (!maxMarks || maxMarks <= 0) {
    throw new Error('Maximum marks must be greater than 0');
  }

  if (maxMarks > 1000) {
    throw new Error('Maximum marks cannot exceed 1000');
  }

  if (!applicableBatches || !Array.isArray(applicableBatches) || applicableBatches.length === 0) {
    throw new Error('At least one batch must be selected');
  }

  return parsedTestDate;
};

export const validateBatches = async (batchIds) => {
  const batches = await Batch.find({ _id: { $in: batchIds } });
  if (batches.length !== batchIds.length) {
    throw new Error('One or more batches not found');
  }
};

export const createTestRecord = async (data) => {
  const { title, topic, classLevel, subject, testDate, maxMarks, applicableBatches } = data;

  const testData = {
    title: title.trim(),
    topic: topic?.trim() || '',
    classLevel,
    subject: subject || 'Maths',
    testDate: new Date(testDate),
    maxMarks: Number(maxMarks),
    applicableBatches,
    scores: []
  };

  return await Test.create(testData);
};

export const validateScores = async (testId, scores) => {
  const test = await Test.findById(testId);
  if (!test) {
    throw new Error('Test not found');
  }

  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    throw new Error('Scores array is required and cannot be empty');
  }

  for (const score of scores) {
    if (!score.studentId) {
      throw new Error('Student ID is required for all score entries');
    }

    if (score.marksObtained === undefined || score.marksObtained === null) {
      throw new Error('Marks obtained is required for all score entries');
    }

    if (score.marksObtained < 0 || score.marksObtained > test.maxMarks) {
      throw new Error(`Marks must be between 0 and ${test.maxMarks}`);
    }

    if (score.attendanceStatus && !['Present', 'Absent'].includes(score.attendanceStatus)) {
      throw new Error('Attendance status must be either "Present" or "Absent"');
    }

    const student = await Student.findById(score.studentId);
    if (!student) {
      throw new Error(`Student with ID ${score.studentId} not found`);
    }

    if (!test.applicableBatches.some(batchId => batchId.toString() === student.batch?.toString())) {
      throw new Error(`Student ${student.personalDetails.fullName} is not in any of the applicable batches for this test`);
    }
  }

  return test;
};

export const updateTestScores = async (test, scores) => {
  for (const scoreData of scores) {
    const existingScoreIndex = test.scores.findIndex(
      s => s.studentId.toString() === scoreData.studentId
    );

    const scoreEntry = {
      studentId: scoreData.studentId,
      marksObtained: Number(scoreData.marksObtained),
      attendanceStatus: scoreData.attendanceStatus || 'Present',
      remark: scoreData.remark?.trim() || ''
    };

    if (existingScoreIndex !== -1) {
      test.scores[existingScoreIndex] = scoreEntry;
    } else {
      test.scores.push(scoreEntry);
    }
  }

  await test.save();
  return test;
};

export const fetchTestById = async (testId) => {
  const test = await Test.findById(testId)
    .populate('applicableBatches', 'name standard')
    .populate('scores.studentId', 'personalDetails.fullName rollno batch');

  if (!test) {
    throw new Error('Test not found');
  }

  return test;
};

export const fetchAllTests = async (filters) => {
  const { classLevel, subject, batchId } = filters;
  const filter = {};

  if (classLevel) {
    if (!['11th', '12th'].includes(classLevel)) {
      throw new Error('Invalid class level. Must be "11th" or "12th"');
    }
    filter.classLevel = classLevel;
  }

  if (subject) {
    filter.subject = subject;
  }

  if (batchId) {
    filter.applicableBatches = batchId;
  }

  return await Test.find(filter)
    .populate('applicableBatches', 'name standard')
    .sort({ testDate: -1 });
};

export const fetchStudentTestHistory = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const tests = await Test.find({
    'scores.studentId': studentId
  })
    .populate('applicableBatches', 'name standard')
    .sort({ testDate: -1 });

  const studentTestHistory = tests.map(test => {
    const studentScore = test.scores.find(
      score => score.studentId.toString() === studentId
    );

    return {
      testId: test._id,
      title: test.title,
      topic: test.topic,
      classLevel: test.classLevel,
      subject: test.subject,
      testDate: test.testDate,
      maxMarks: test.maxMarks,
      marksObtained: studentScore.marksObtained,
      attendanceStatus: studentScore.attendanceStatus,
      remark: studentScore.remark,
      percentage: ((studentScore.marksObtained / test.maxMarks) * 100).toFixed(2),
      applicableBatches: test.applicableBatches,
      createdAt: test.createdAt
    };
  });

  return {
    studentName: student.personalDetails.fullName,
    rollNumber: student.rollno,
    tests: studentTestHistory
  };
};

export const getOverallPerformance = async ({ limit = 10, classLevel, batchId } = {}) => {
  const filter = {};
  if (classLevel) filter.classLevel = classLevel;
  if (batchId) filter.applicableBatches = batchId;

  // Get last N tests sorted by date desc
  const tests = await Test.find(filter)
    .populate('scores.studentId', 'personalDetails.fullName rollno')
    .sort({ testDate: -1 })
    .limit(Number(limit));

  if (tests.length === 0) return { tests: [], students: [] };

  // Aggregate per student
  const studentMap = new Map();
  for (const test of tests) {
    for (const score of test.scores) {
      if (!score.studentId) continue;
      const sid = score.studentId._id.toString();
      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          studentId: sid,
          name: score.studentId.personalDetails?.fullName || '—',
          rollno: score.studentId.rollno || '—',
          testsAppeared: 0,
          totalMarksObtained: 0,
          totalMaxMarks: 0,
          scores: [],
        });
      }
      const entry = studentMap.get(sid);
      if (score.attendanceStatus === 'Present') {
        entry.testsAppeared += 1;
        entry.totalMarksObtained += score.marksObtained;
        entry.totalMaxMarks += test.maxMarks;
      }
      entry.scores.push({
        testId: test._id,
        title: test.title,
        subject: test.subject,
        testDate: test.testDate,
        maxMarks: test.maxMarks,
        marksObtained: score.marksObtained,
        attendanceStatus: score.attendanceStatus,
      });
    }
  }

  const students = Array.from(studentMap.values()).map(s => ({
    ...s,
    percentage: s.totalMaxMarks > 0
      ? ((s.totalMarksObtained / s.totalMaxMarks) * 100).toFixed(2)
      : '0.00',
  }));

  // Rank by totalMarksObtained desc
  students.sort((a, b) => b.totalMarksObtained - a.totalMarksObtained);
  students.forEach((s, i) => { s.rank = i + 1; });

  return {
    tests: tests.map(t => ({ _id: t._id, title: t.title, subject: t.subject, testDate: t.testDate, maxMarks: t.maxMarks })),
    students,
  };
};

export const deleteTestById = async (testId) => {
  const test = await Test.findById(testId);

  if (!test) {
    throw new Error('Test not found');
  }

  await Test.findByIdAndDelete(testId);
};

export const calculateTestStatistics = async (testId) => {
  const test = await Test.findById(testId)
    .populate('scores.studentId', 'personalDetails.fullName rollno');

  if (!test) {
    throw new Error('Test not found');
  }

  if (test.scores.length === 0) {
    return { test, statistics: null, message: 'No scores available for this test' };
  }

  const presentScores = test.scores.filter(s => s.attendanceStatus === 'Present');

  if (presentScores.length === 0) {
    return { test, statistics: null, message: 'No students were present for this test' };
  }

  const marks = presentScores.map(s => s.marksObtained);
  const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
  const averageMarks = totalMarks / presentScores.length;
  const highestMarks = Math.max(...marks);
  const lowestMarks = Math.min(...marks);

  const passingMarks = test.maxMarks * 0.4;
  const passedStudents = presentScores.filter(s => s.marksObtained >= passingMarks).length;
  const passPercentage = (passedStudents / presentScores.length) * 100;

  const toppers = test.scores
    .filter(s => s.marksObtained === highestMarks && s.attendanceStatus === 'Present')
    .map(s => ({
      studentId: s.studentId._id,
      name: s.studentId.personalDetails.fullName,
      rollno: s.studentId.rollno,
      marks: s.marksObtained
    }));

  const statistics = {
    testInfo: {
      title: test.title,
      topic: test.topic,
      testDate: test.testDate,
      maxMarks: test.maxMarks
    },
    attendance: {
      totalStudents: test.scores.length,
      present: presentScores.length,
      absent: test.scores.filter(s => s.attendanceStatus === 'Absent').length
    },
    marksAnalysis: {
      average: averageMarks.toFixed(2),
      highest: highestMarks,
      lowest: lowestMarks,
      passingMarks: passingMarks,
      passPercentage: passPercentage.toFixed(2)
    },
    toppers: toppers
  };

  return { statistics };
};
