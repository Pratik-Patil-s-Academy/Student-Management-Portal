import { Batch } from '../models/batchModel.js';
import { Student } from '../models/studentModel.js';

export const validateBatchData = async (name, standard, startTime, endTime, days, batchId = null) => {
  if (!name || !standard || !startTime || !endTime) {
    throw new Error('Name, standard, start time, and end time are required');
  }

  if (!['11', '12', 'Others'].includes(standard)) {
    throw new Error('Standard must be 11, 12, or Others');
  }

  const query = { name: name.trim() };
  if (batchId) {
    query._id = { $ne: batchId };
  }

  const existingBatch = await Batch.findOne(query);
  if (existingBatch) {
    throw new Error('Batch name already exists. Please choose a different name.');
  }

  if (!days || !Array.isArray(days) || days.length === 0) {
    throw new Error('At least one day is required');
  }

  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const invalidDays = days.filter(day => !validDays.includes(day));
  if (invalidDays.length > 0) {
    throw new Error(`Invalid days: ${invalidDays.join(', ')}`);
  }
};

export const checkTimeConflict = async (days, startTime, endTime, batchId = null) => {
  const query = {
    days: { $in: days },
    $or: [
      {
        'time.startTime': { $lte: endTime },
        'time.endTime': { $gte: startTime }
      }
    ]
  };

  if (batchId) {
    query._id = { $ne: batchId };
  }

  const overlappingBatches = await Batch.find(query);

  if (overlappingBatches.length > 0) {
    throw new Error(`Time conflict detected with batch: ${overlappingBatches[0].name}. Please choose different time or days.`);
  }
};

export const validateStudents = async (studentIds) => {
  if (studentIds && studentIds.length > 0) {
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      throw new Error('One or more student IDs are invalid');
    }
  }
};

export const createBatchRecord = async (name, standard, startTime, endTime, days, studentIds) => {
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

  return batch;
};

export const addStudentsToBatchRecord = async (batchId, studentIds) => {
  if (!studentIds || studentIds.length === 0) {
    throw new Error('Student IDs are required');
  }

  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  const students = await Student.find({ _id: { $in: studentIds } });
  if (students.length !== studentIds.length) {
    throw new Error('One or more student IDs are invalid');
  }

  // Collect old batch IDs for students that are already assigned elsewhere
  const oldBatchIds = [...new Set(
    students
      .filter(s => s.batch && s.batch.toString() !== batchId.toString())
      .map(s => s.batch.toString())
  )];

  // Remove these students from their old batches
  if (oldBatchIds.length > 0) {
    await Batch.updateMany(
      { _id: { $in: oldBatchIds } },
      { $pull: { students: { $in: students.map(s => s._id) } } }
    );
  }

  // Add to new batch (avoid duplicates using string comparison)
  const enrolledIds = batch.students.map(id => id.toString());
  const toAdd = studentIds.filter(sid => !enrolledIds.includes(sid.toString()));
  batch.students.push(...toAdd);
  await batch.save();

  // Update each student's batch reference
  await Student.updateMany(
    { _id: { $in: studentIds } },
    { $set: { batch: batch._id } }
  );

  return batch;
};

export const removeStudentsFromBatchRecord = async (batchId, studentIds) => {
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  batch.students = batch.students.filter(
    sid => !studentIds.includes(sid.toString())
  );
  await batch.save();

  await Student.updateMany(
    { _id: { $in: studentIds } },
    { $unset: { batch: "" } }
  );

  return batch;
};

export const fetchAllBatches = async () => {
  return await Batch.find().populate('students');
};

export const fetchBatchById = async (batchId) => {
  const batch = await Batch.findById(batchId).populate('students');

  if (!batch) {
    throw new Error('Batch not found');
  }

  return batch;
};

export const updateBatchRecord = async (batchId, updateData) => {
  const { name, standard, startTime, endTime, days } = updateData;

  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  if (name && name.trim() !== batch.name) {
    await validateBatchData(name, standard || batch.standard, startTime || batch.time.startTime, endTime || batch.time.endTime, days || batch.days, batchId);
  }

  if (standard && !['11', '12', 'Others'].includes(standard)) {
    throw new Error('Standard must be 11, 12, or Others');
  }

  if (days && Array.isArray(days)) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const invalidDays = days.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      throw new Error(`Invalid days: ${invalidDays.join(', ')}`);
    }
  }

  const checkDays = days || batch.days;
  const checkStartTime = startTime || batch.time.startTime;
  const checkEndTime = endTime || batch.time.endTime;

  await checkTimeConflict(checkDays, checkStartTime, checkEndTime, batchId);

  if (name) batch.name = name.trim();
  if (standard) batch.standard = standard;
  if (startTime) batch.time.startTime = startTime;
  if (endTime) batch.time.endTime = endTime;
  if (days) batch.days = days;

  await batch.save();
  return batch;
};

export const deleteBatchRecord = async (batchId) => {
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  await Student.updateMany(
    { batch: batchId },
    { $unset: { batch: "" } }
  );

  await Batch.findByIdAndDelete(batchId);
};
