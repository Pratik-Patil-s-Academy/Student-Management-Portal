import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentAttendanceStats, getAttendanceByBatch } from '../services/attendanceService';
import { getAllBatches } from '../services/batchService';
import { getAllStudents } from '../services/studentService';
import { FaArrowLeft, FaChartBar, FaFilter, FaUsers, FaUserGraduate } from 'react-icons/fa';

const AttendanceStats = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState(null);
  const [batchStats, setBatchStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleFetchStats = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setBatchStats([]);

    try {
      if (selectedStudent) {
        // Fetch individual student stats
        const data = await getStudentAttendanceStats(selectedStudent, startDate, endDate);
        if (data.success) {
          setStats(data.stats);
        }
      } else if (selectedBatch) {
        // Fetch batch-wise stats - we'll calculate from attendance records
        const attendanceData = await getAttendanceByBatch(selectedBatch, startDate, endDate);
        if (attendanceData.success) {
          calculateBatchStats(attendanceData.attendance);
        }
      } else {
        setError('Please select either a batch or a student');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculateBatchStats = (attendanceRecords) => {
    const batch = batches.find(b => b._id === selectedBatch);
    if (!batch || !batch.students) return;

    const studentStatsMap = {};

    // Initialize stats for all students in batch
    batch.students.forEach(student => {
      studentStatsMap[student._id] = {
        studentId: student._id,
        name: student.personalDetails?.fullName || 'Unknown',
        rollno: student.rollno,
        totalClasses: 0,
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
      };
    });

    // Calculate stats from attendance records
    attendanceRecords.forEach(record => {
      record.students.forEach(s => {
        const studentId = s.studentId._id || s.studentId;
        if (studentStatsMap[studentId]) {
          studentStatsMap[studentId].totalClasses++;
          if (s.status === 'Present') {
            studentStatsMap[studentId].totalPresent++;
          } else {
            studentStatsMap[studentId].totalAbsent++;
          }
        }
      });
    });

    // Calculate percentages
    Object.values(studentStatsMap).forEach(stat => {
      if (stat.totalClasses > 0) {
        stat.attendancePercentage = ((stat.totalPresent / stat.totalClasses) * 100).toFixed(1);
      }
    });

    setBatchStats(Object.values(studentStatsMap));
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceBadgeColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/attendance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-xl text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <FaChartBar className="text-3xl text-[#2C3E50]" />
          <h1 className="text-4xl font-bold text-[#2C3E50]">Attendance Statistics</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select 
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSelectedStudent(''); // Clear student selection
              }}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Batch</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select 
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setSelectedBatch(''); // Clear batch selection
              }}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.personalDetails?.fullName || 'Unknown'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <button 
            onClick={handleFetchStats}
            disabled={loading || (!selectedBatch && !selectedStudent)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get Statistics'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Individual Student Stats */}
      {stats && selectedStudent && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <FaUserGraduate className="text-2xl text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              {students.find(s => s._id === selectedStudent)?.personalDetails?.fullName || 'Student'} Statistics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-2">Total Classes</p>
              <p className="text-4xl font-bold text-blue-700">{stats.totalClasses}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-2">Present</p>
              <p className="text-4xl font-bold text-green-700">{stats.totalPresent}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <p className="text-sm text-red-600 font-medium mb-2">Absent</p>
              <p className="text-4xl font-bold text-red-700">{stats.totalAbsent}</p>
            </div>

            <div className={`bg-gradient-to-br rounded-xl p-6 border ${
              stats.attendancePercentage >= 75 ? 'from-green-50 to-green-100 border-green-200' :
              stats.attendancePercentage >= 60 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
              'from-red-50 to-red-100 border-red-200'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                stats.attendancePercentage >= 75 ? 'text-green-600' :
                stats.attendancePercentage >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>Attendance %</p>
              <p className={`text-4xl font-bold ${
                stats.attendancePercentage >= 75 ? 'text-green-700' :
                stats.attendancePercentage >= 60 ? 'text-yellow-700' :
                'text-red-700'
              }`}>{stats.attendancePercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch-wise Stats */}
      {batchStats.length > 0 && selectedBatch && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <FaUsers className="text-2xl text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              {batches.find(b => b._id === selectedBatch)?.name || 'Batch'} - Student-wise Statistics
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Classes</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Present</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Absent</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batchStats
                  .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
                  .map(stat => (
                    <tr key={stat.studentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{stat.rollno || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{stat.name}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{stat.totalClasses}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">{stat.totalPresent}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-red-600">{stat.totalAbsent}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-sm ${getAttendanceColor(stat.attendancePercentage)}`}>
                          <span className={`w-2 h-2 rounded-full ${getAttendanceBadgeColor(stat.attendancePercentage)}`}></span>
                          {stat.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {batchStats
              .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
              .map(stat => (
                <div key={stat.studentId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{stat.name}</p>
                      <p className="text-sm text-gray-600">Roll No: {stat.rollno || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${getAttendanceColor(stat.attendancePercentage)}`}>
                      {stat.attendancePercentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-bold text-gray-800">{stat.totalClasses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Present</p>
                      <p className="font-bold text-green-600">{stat.totalPresent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Absent</p>
                      <p className="font-bold text-red-600">{stat.totalAbsent}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !stats && batchStats.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FaChartBar className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Select a batch or student and click "Get Statistics" to view attendance data</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceStats;
