import {Batch} from '../models/batchModel.js';
import { Student } from '../models/studentModel.js';
import TryCatch from '../utils/TryCatch.js';

export const createBatch = TryCatch(async (req, res) => {
  const { name, standard, startTime, endTime, days, studentIds } = req.body;

  if (!name || !standard || !startTime || !endTime) {
    return res.status(400).json({ 
      message: 'Name, standard, start time, and end time are required' 
    });
  }

  if (!['11', '12', 'Others'].includes(standard)) {
    return res.status(400).json({ 
      message: 'Standard must be 11, 12, or Others' 
    });
  }

  const existingBatch = await Batch.findOne({ name: name.trim() });
  if (existingBatch) {
    return res.status(400).json({ 
      message: 'Batch name already exists. Please choose a different name.' 
    });
  }

  if (!days || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ 
      message: 'At least one day is required' 
    });
  }

  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const invalidDays = days.filter(day => !validDays.includes(day));
  if (invalidDays.length > 0) {
    return res.status(400).json({ 
      message: `Invalid days: ${invalidDays.join(', ')}` 
    });
  }

  const overlappingBatches = await Batch.find({
    days: { $in: days },
    $or: [
      {
        'time.startTime': { $lte: endTime },
        'time.endTime': { $gte: startTime }
      }
    ]
  });

  if (overlappingBatches.length > 0) {
    return res.status(400).json({ 
      message: `Time conflict detected with batch: ${overlappingBatches[0].name}. Please choose different time or days.` 
    });
  }

  if (studentIds && studentIds.length > 0) {
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({ 
        message: 'One or more student IDs are invalid' 
      });
    }
  }

  const batch = await Batch.create({
    name: name.trim(),
    standard,
    time: { startTime, endTime },
    days,
    students: studentIds || []
  });

  if (studentIds && studentIds.length > 0) {
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { batch: batch._id } }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Batch created successfully',
    batch
  });
});

export const addStudentsToBatch = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body;

  if (!studentIds || studentIds.length === 0) {
    return res.status(400).json({ message: 'Student IDs are required' });
  }

  const batch = await Batch.findById(id);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }


  const students = await Student.find({ _id: { $in: studentIds } });
  if (students.length !== studentIds.length) {
    return res.status(400).json({ 
      message: 'One or more student IDs are invalid' 
    });
  }

  
  const newStudents = studentIds.filter(sid => !batch.students.includes(sid));
  batch.students.push(...newStudents);
  await batch.save();


  await Student.updateMany(
    { _id: { $in: studentIds } },
    { $set: { batch: batch._id } }
  );

  res.status(200).json({
    success: true,
    message: 'Students added to batch successfully',
    batch
  });
});


export const removeStudentsFromBatch = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body;

  const batch = await Batch.findById(id);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }


  batch.students = batch.students.filter(
    sid => !studentIds.includes(sid.toString())
  );
  await batch.save();

  
  await Student.updateMany(
    { _id: { $in: studentIds } },
    { $unset: { batch: "" } }
  );

  res.status(200).json({
    success: true,
    message: 'Students removed from batch successfully',
    batch
  });
});


export const getAllBatches = TryCatch(async (req, res) => {
  const batches = await Batch.find().populate('students');

  res.status(200).json({
    success: true,
    count: batches.length,
    batches
  });
});


export const getBatchById = TryCatch(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findById(id).populate('students');

  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  res.status(200).json({
    success: true,
    batch
  });
});

export const updateBatch = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, standard, startTime, endTime, days } = req.body;

  const batch = await Batch.findById(id);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  if (name && name.trim() !== batch.name) {
    const existingBatch = await Batch.findOne({ name: name.trim() });
    if (existingBatch) {
      return res.status(400).json({ 
        message: 'Batch name already exists. Please choose a different name.' 
      });
    }
  }

  if (standard && !['11', '12', 'Others'].includes(standard)) {
    return res.status(400).json({ 
      message: 'Standard must be 11, 12, or Others' 
    });
  }

  if (days && Array.isArray(days)) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const invalidDays = days.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      return res.status(400).json({ 
        message: `Invalid days: ${invalidDays.join(', ')}` 
      });
    }
  }

  const checkDays = days || batch.days;
  const checkStartTime = startTime || batch.time.startTime;
  const checkEndTime = endTime || batch.time.endTime;

  const overlappingBatches = await Batch.find({
    _id: { $ne: id },
    days: { $in: checkDays },
    $or: [
      {
        'time.startTime': { $lte: checkEndTime },
        'time.endTime': { $gte: checkStartTime }
      }
    ]
  });

  if (overlappingBatches.length > 0) {
    return res.status(400).json({ 
      message: `Time conflict detected with batch: ${overlappingBatches[0].name}` 
    });
  }

  if (name) batch.name = name.trim();
  if (standard) batch.standard = standard;
  if (startTime) batch.time.startTime = startTime;
  if (endTime) batch.time.endTime = endTime;
  if (days) batch.days = days;

  await batch.save();

  res.status(200).json({
    success: true,
    message: 'Batch updated successfully',
    batch
  });
});

export const deleteBatch = TryCatch(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findById(id);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  await Student.updateMany(
    { batch: id },
    { $unset: { batch: "" } }
  );

  await Batch.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Batch deleted successfully'
  });
});
