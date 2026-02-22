import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendanceById, updateAttendance, deleteAttendance } from '../services/attendanceService';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaSave, FaTrash, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const AttendanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceById(id);

      if (data.success) {
        setAttendance(data.attendance);
        setSubject(data.attendance.subject || 'Maths');
        setStudents(data.attendance.students.map(s => ({
          studentId: s.studentId._id,
          name: s.studentId.personalDetails?.fullName || 'Unknown',
          rollno: s.studentId.rollno,
          status: s.status
        })));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance record');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (studentId, status) => {
    setStudents(prev => prev.map(student =>
      student.studentId === studentId
        ? { ...student, status }
        : student
    ));
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const updateData = {
        students: students.map(s => ({
          studentId: s.studentId,
          status: s.status
        })),
        subject: subject
      };

      await updateAttendance(id, updateData);
      setSuccess(true);

      setTimeout(() => {
        navigate('/attendance');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      await deleteAttendance(id);
      navigate('/attendance');
    } catch (err) {
      setError(err.message || 'Failed to delete attendance');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading attendance details...</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Updated Successfully!</h2>
        <p className="text-gray-600">Redirecting to attendance list...</p>
      </div>
    </div>
  );

  if (error && !attendance) return (
    <div className="p-8 text-center">
      <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200">
        <p className="font-semibold mb-2">Error loading attendance</p>
        <p>{error}</p>
        <button
          onClick={() => navigate('/attendance')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Attendance List
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/attendance')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-xl text-gray-600" />
          </button>
          <h1 className="text-4xl font-bold text-[#2C3E50]">Attendance Details</h1>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          <FaTrash /> Delete
        </button>
      </div>

      {/* Attendance Info */}
      {attendance && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Batch</label>
              <p className="text-lg font-semibold text-gray-800">
                {attendance.batchId?.name || 'Unknown Batch'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                <p className="text-lg font-semibold text-gray-800">{formatDate(attendance.date)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(attendance.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Students ({students.length})
          </h2>
        </div>

        {/* Students Table - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(student => (
                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{student.rollno || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.name}</td>
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
            <div className="text-center">
              <p className="text-sm text-gray-600">Attendance %</p>
              <p className="text-2xl font-bold text-blue-600">
                {students.length > 0
                  ? ((students.filter(s => s.status === 'Present').length / students.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/attendance')}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave /> {submitting ? 'Updating...' : 'Update Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceDetail;
