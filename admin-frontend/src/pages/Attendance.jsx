import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAttendanceByBatch, getAttendanceByDate, deleteAttendance } from '../services/attendanceService';
import { getAllBatches } from '../services/batchService';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaChartBar, FaFilter } from 'react-icons/fa';

const Attendance = () => {
  const navigate = useNavigate();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchBatches();
    fetchAttendance();
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

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      
      if (selectedBatch) {
        // Fetch by batch with optional date range
        data = await getAttendanceByBatch(selectedBatch, startDate, endDate);
      } else if (selectedDate) {
        // Fetch by specific date
        data = await getAttendanceByDate(selectedDate);
      } else {
        // Fetch all - we'll get all batches and combine
        const allRecords = [];
        for (const batch of batches) {
          const batchData = await getAttendanceByBatch(batch._id, startDate, endDate);
          if (batchData.success) {
            allRecords.push(...batchData.attendance);
          }
        }
        data = { success: true, attendance: allRecords };
      }
      
      if (data.success) {
        setAttendanceRecords(data.attendance);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAttendance();
  };

  const handleClearFilters = () => {
    setSelectedBatch('');
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchAttendance(), 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await deleteAttendance(id);
      fetchAttendance();
    } catch (err) {
      alert(err.message || 'Failed to delete attendance record');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateStats = (students) => {
    const total = students.length;
    const present = students.filter(s => s.status === 'Present').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage };
  };

  if (loading && attendanceRecords.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading attendance records...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Attendance</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/attendance/stats')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
          >
            <FaChartBar /> View Statistics
          </button>
          <button 
            onClick={() => navigate('/attendance/mark')}
            className="bg-[#2C3E50] hover:bg-[#34495E] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
          >
            <FaPlus /> Mark Attendance
          </button>
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
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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

        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button 
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          Error: {error}
        </div>
      )}

      {/* Attendance Records */}
      <div className="grid grid-cols-1 gap-4">
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No attendance records found.</p>
            <button 
              onClick={() => navigate('/attendance/mark')}
              className="text-blue-600 hover:underline mt-2 text-sm font-semibold"
            >
              Mark your first attendance
            </button>
          </div>
        ) : (
          attendanceRecords.map(record => {
            const stats = calculateStats(record.students);
            return (
              <div 
                key={record._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left Section - Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {record.batchId?.name || 'Unknown Batch'}
                          </h3>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-blue-500" />
                              <span className="font-medium">{formatDate(record.date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded font-semibold text-xs">
                                {record.subject || 'Maths'}
                              </span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <FaUsers className="text-gray-400" />
                              <span className="text-sm">
                                <span className="font-bold text-gray-800">{stats.total}</span> Students
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm">
                                <span className="font-bold text-green-700">{stats.present}</span> Present
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm">
                                <span className="font-bold text-red-700">{stats.absent}</span> Absent
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${
                                stats.percentage >= 75 ? 'text-green-600' : 
                                stats.percentage >= 60 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {stats.percentage}% Attendance
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Link
                        to={`/attendance/${record._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Attendance;
