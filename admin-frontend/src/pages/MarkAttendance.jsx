import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBatches } from '../services/batchService';
import { getAllStudents } from '../services/studentService';
import { markAttendance } from '../services/attendanceService';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaUsers, FaCalendarAlt } from 'react-icons/fa';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [markingMode, setMarkingMode] = useState('batch'); // 'batch' or 'class'
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('Maths');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchAllStudents();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await getAllBatches();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const data = await getAllStudents();
      if (data.success) {
        setAllStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleMarkingModeChange = (mode) => {
    setMarkingMode(mode);
    setSelectedBatch(null);
    setSelectedClass('');
    setStudents([]);
    setError(null);
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const batch = batches.find(b => b._id === batchId);
    setSelectedBatch(batch);

    if (batch && batch.students) {
      // Initialize all students as Present
      const studentAttendance = batch.students.map(student => ({
        studentId: student._id,
        name: student.personalDetails?.fullName || 'Unknown',
        rollno: student.rollno,
        status: 'Present'
      }));
      setStudents(studentAttendance);
    } else {
      setStudents([]);
    }
  };

  const handleClassChange = (e) => {
    const standard = e.target.value;
    setSelectedClass(standard);

    if (standard) {
      // Filter students by standard
      const classStudents = allStudents.filter(s => s.standard === standard);
      const studentAttendance = classStudents.map(student => ({
        studentId: student._id,
        name: student.personalDetails?.fullName || 'Unknown',
        rollno: student.rollno,
        batch: student.batch, // Store batch ID for grouping
        batchName: batches.find(b => b._id === student.batch)?.name || 'No Batch',
        status: 'Present'
      }));
      setStudents(studentAttendance);
    } else {
      setStudents([]);
    }
  };

  const updateStudentStatus = (studentId, status) => {
    setStudents(prev => prev.map(student =>
      student.studentId === studentId
        ? { ...student, status }
        : student
    ));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Present' })));
  };

  const markAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Absent' })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (markingMode === 'batch' && !selectedBatch) {
      setError('Please select a batch');
      setSubmitting(false);
      return;
    }

    if (markingMode === 'class' && !selectedClass) {
      setError('Please select a class');
      setSubmitting(false);
      return;
    }

    if (students.length === 0) {
      setError('No students found');
      setSubmitting(false);
      return;
    }

    try {
      if (markingMode === 'batch') {
        // Batch-wise marking - single attendance record
        const attendanceData = {
          batchId: selectedBatch._id,
          date: date,
          subject: subject,
          students: students.map(s => ({
            studentId: s.studentId,
            status: s.status
          }))
        };

        await markAttendance(attendanceData);
      } else {
        // Class-wise marking - create attendance record for each batch
        // Group students by batch
        const studentsByBatch = {};

        students.forEach(student => {
          const batch = batches.find(b => b._id === student.batch);
          if (batch) {
            if (!studentsByBatch[batch._id]) {
              studentsByBatch[batch._id] = {
                batchId: batch._id,
                batchName: batch.name,
                students: []
              };
            }
            studentsByBatch[batch._id].students.push({
              studentId: student.studentId,
              status: student.status
            });
          }
        });

        // Mark attendance for each batch using allSettled to handle partial failures
        const promises = Object.values(studentsByBatch).map(batchData =>
          markAttendance({
            batchId: batchData.batchId,
            date: date,
            subject: subject,
            students: batchData.students
          }).then(() => ({ success: true, batchName: batchData.batchName }))
            .catch(err => ({ success: false, batchName: batchData.batchName, error: err.message }))
        );

        const results = await Promise.all(promises);

        // Check results
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        if (failed.length > 0 && successful.length === 0) {
          // All failed
          const errorMsg = failed.map(f => `${f.batchName}: ${f.error}`).join('; ');
          throw new Error(`Failed to mark attendance: ${errorMsg}`);
        } else if (failed.length > 0) {
          // Partial success
          const failedBatches = failed.map(f => f.batchName).join(', ');
          setError(`Attendance marked for ${successful.length} batch(es), but failed for: ${failedBatches}`);
          // Still show success for the ones that worked
          setTimeout(() => {
            navigate('/attendance');
          }, 3000);
          return;
        }
        // All successful - continue to success screen
      }

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/attendance');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Marked Successfully!</h2>
        <p className="text-gray-600">Redirecting to attendance list...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/attendance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-xl text-gray-600" />
        </button>
        <h1 className="text-4xl font-bold text-[#2C3E50]">Mark Attendance</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marking Mode Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Marking Mode</h2>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="markingMode"
                value="batch"
                checked={markingMode === 'batch'}
                onChange={() => handleMarkingModeChange('batch')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 font-medium">Mark by Batch</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="markingMode"
                value="class"
                checked={markingMode === 'class'}
                onChange={() => handleMarkingModeChange('class')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 font-medium">Mark by Class/Standard</span>
            </label>
          </div>
        </div>

        {/* Batch and Date Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {markingMode === 'batch' ? 'Select Batch & Date' : 'Select Class & Date'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {markingMode === 'batch' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBatch?._id || ''}
                  onChange={handleBatchChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select a batch</option>
                  {batches.map(batch => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - Class {batch.standard}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class/Standard <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={handleClassChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select a class</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Maths"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Students List */}
        {((markingMode === 'batch' && selectedBatch) || (markingMode === 'class' && selectedClass)) && students.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaUsers className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Students ({students.length})
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={markAllAbsent}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Students Table - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    {markingMode === 'class' && (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                    )}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(student => (
                    <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{student.rollno || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.name}</td>
                      {markingMode === 'class' && (
                        <td className="px-4 py-3 text-sm text-gray-600">{student.batchName}</td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateStudentStatus(student.studentId, 'Present')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${student.status === 'Present'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                          >
                            <FaCheckCircle className="inline mr-1" /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStudentStatus(student.studentId, 'Absent')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${student.status === 'Absent'
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                          >
                            <FaTimesCircle className="inline mr-1" /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Students Cards - Mobile */}
            <div className="md:hidden space-y-3">
              {students.map(student => (
                <div key={student.studentId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">Roll No: {student.rollno || 'N/A'}</p>
                      {markingMode === 'class' && (
                        <p className="text-sm text-blue-600">Batch: {student.batchName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateStudentStatus(student.studentId, 'Present')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${student.status === 'Present'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      <FaCheckCircle className="inline mr-1" /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStudentStatus(student.studentId, 'Absent')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${student.status === 'Absent'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      <FaTimesCircle className="inline mr-1" /> Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.status === 'Present').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {students.filter(s => s.status === 'Absent').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {((markingMode === 'batch' && selectedBatch) || (markingMode === 'class' && selectedClass)) && students.length > 0 && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Mark Attendance'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MarkAttendance;
