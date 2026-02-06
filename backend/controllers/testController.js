import Test from '../models/testModel.js';
import { Student } from '../models/studentModel.js';
import { Batch } from '../models/batchModel.js';
import TryCatch from '../utils/TryCatch.js';

/**
 * CREATE TEST
 * Creates a new test for selected batches
 * Initially creates test without scores - scores are added later
 * 
 * Route: POST /api/test/create
 * Access: Protected (Teacher/Admin)
 * 
 * Expected Body:
 * {
 *   title: "Unit Test 1",
 *   topic: "Calculus",
 *   classLevel: "11th",
 *   subject: "Maths",
 *   testDate: "2024-02-15",
 *   maxMarks: 100,
 *   applicableBatches: ["batchId1", "batchId2"]
 * }
 */
export const createTest = TryCatch(async (req, res) => {
  const {
    title,
    topic,
    classLevel,
    subject,
    testDate,
    maxMarks,
    applicableBatches
  } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ 
      message: 'Test title is required (minimum 3 characters)' 
    });
  }

  if (!classLevel || !['11th', '12th'].includes(classLevel)) {
    return res.status(400).json({ 
      message: 'Class level must be either "11th" or "12th"' 
    });
  }


  if (!testDate) {
    return res.status(400).json({ 
      message: 'Test date is required' 
    });
  }

  const parsedTestDate = new Date(testDate);
  if (isNaN(parsedTestDate.getTime())) {
    return res.status(400).json({ 
      message: 'Invalid test date format' 
    });
  }

  if (!maxMarks || maxMarks <= 0) {
    return res.status(400).json({ 
      message: 'Maximum marks must be greater than 0' 
    });
  }

  if (maxMarks > 1000) {
    return res.status(400).json({ 
      message: 'Maximum marks cannot exceed 1000' 
    });
  }


  if (!applicableBatches || !Array.isArray(applicableBatches) || applicableBatches.length === 0) {
    return res.status(400).json({ 
      message: 'At least one batch must be selected' 
    });
  }

  const batches = await Batch.find({ _id: { $in: applicableBatches } });
  if (batches.length !== applicableBatches.length) {
    return res.status(404).json({ 
      message: 'One or more batches not found' 
    });
  }


  const testData = {
    title: title.trim(),
    topic: topic?.trim() || '',
    classLevel,
    subject: subject || 'Maths',
    testDate: parsedTestDate,
    maxMarks: Number(maxMarks),
    applicableBatches,
    scores: [] 
  };

  const test = await Test.create(testData);

  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    test
  });
});


export const addOrUpdateScores = TryCatch(async (req, res) => {
  const { testId } = req.params;
  const { scores } = req.body;

  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ 
      message: 'Test not found' 
    });
  }

  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({ 
      message: 'Scores array is required and cannot be empty' 
    });
  }

  for (const score of scores) {

    if (!score.studentId) {
      return res.status(400).json({ 
        message: 'Student ID is required for all score entries' 
      });
    }

    if (score.marksObtained === undefined || score.marksObtained === null) {
      return res.status(400).json({ 
        message: 'Marks obtained is required for all score entries' 
      });
    }

    if (score.marksObtained < 0 || score.marksObtained > test.maxMarks) {
      return res.status(400).json({ 
        message: `Marks must be between 0 and ${test.maxMarks}` 
      });
    }

    if (score.attendanceStatus && !['Present', 'Absent'].includes(score.attendanceStatus)) {
      return res.status(400).json({ 
        message: 'Attendance status must be either "Present" or "Absent"' 
      });
    }

    const student = await Student.findById(score.studentId);
    if (!student) {
      return res.status(404).json({ 
        message: `Student with ID ${score.studentId} not found` 
      });
    }

    if (!test.applicableBatches.some(batchId => batchId.toString() === student.batch?.toString())) {
      return res.status(400).json({ 
        message: `Student ${student.personalDetails.fullName} is not in any of the applicable batches for this test` 
      });
    }
  }

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

  res.status(200).json({
    success: true,
    message: 'Scores updated successfully',
    test
  });
});


export const getTestById = TryCatch(async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId)
    .populate('applicableBatches', 'name standard')
    .populate('scores.studentId', 'personalDetails.fullName rollno batch');

  if (!test) {
    return res.status(404).json({ 
      message: 'Test not found' 
    });
  }

  res.status(200).json({
    success: true,
    test
  });
});

export const getAllTests = TryCatch(async (req, res) => {
  const { classLevel, subject, batchId } = req.query;

  const filter = {};

  if (classLevel) {
    if (!['11th', '12th'].includes(classLevel)) {
      return res.status(400).json({ 
        message: 'Invalid class level. Must be "11th" or "12th"' 
      });
    }
    filter.classLevel = classLevel;
  }

  if (subject) {
    filter.subject = subject;
  }

  if (batchId) {
    filter.applicableBatches = batchId;
  }

  const tests = await Test.find(filter)
    .populate('applicableBatches', 'name standard')
    .sort({ testDate: -1 });

  res.status(200).json({
    success: true,
    count: tests.length,
    tests
  });
});

export const getStudentTestHistory = TryCatch(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ 
      message: 'Student not found' 
    });
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

  res.status(200).json({
    success: true,
    studentName: student.personalDetails.fullName,
    rollNumber: student.rollno,
    totalTests: studentTestHistory.length,
    tests: studentTestHistory
  });
});

export const deleteTest = TryCatch(async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId);
  
  if (!test) {
    return res.status(404).json({ 
      message: 'Test not found' 
    });
  }

  await Test.findByIdAndDelete(testId);

  res.status(200).json({
    success: true,
    message: 'Test deleted successfully'
  });
});

export const getTestStatistics = TryCatch(async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId)
    .populate('scores.studentId', 'personalDetails.fullName rollno');

  if (!test) {
    return res.status(404).json({ 
      message: 'Test not found' 
    });
  }

  if (test.scores.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No scores available for this test',
      statistics: null
    });
  }

  const presentScores = test.scores.filter(s => s.attendanceStatus === 'Present');

  if (presentScores.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No students were present for this test',
      statistics: null
    });
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

  res.status(200).json({
    success: true,
    statistics
  });
});