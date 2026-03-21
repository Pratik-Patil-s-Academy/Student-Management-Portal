import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllAttendance, getAttendanceByBatch, getAttendanceByDate, deleteAttendance } from '../services/attendanceService';
import { getAllBatches } from '../../batch/services/batchService';
import { FaPlus, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import AttendanceFilters from '../components/AttendanceFilters';
import AttendanceRecordCard from '../components/AttendanceRecordCard';

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
        // Fetch all attendance records
        data = await getAllAttendance(startDate, endDate);
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
  };

  useEffect(() => {
    if (!selectedBatch && !selectedDate && !startDate && !endDate && !loading) {
      // Only trigger fetch if we cleared everything
      // But we already have the initial load. 
      // Actually, we should trigger fetchAttendance whenever filters change for better UX
    }
  }, [selectedBatch, selectedDate, startDate, endDate]);

  // Better: update fetchAttendance to run when filters change or manually
  useEffect(() => {
    fetchAttendance();
  }, [selectedBatch, selectedDate, startDate, endDate]);

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
        <h1 className="text-3xl md:text-4xl font-bold text-[#2C3E50]">Attendance</h1>
        <div className="flex flex-row flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/attendance/stats')}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg shadow-md transition-all text-sm md:text-base whitespace-nowrap"
          >
            <FaChartBar /> View Statistics
          </button>
          <button
            onClick={() => navigate('/attendance/mark')}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-[#2C3E50] hover:bg-[#34495E] text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg shadow-md transition-all text-sm md:text-base whitespace-nowrap"
          >
            <FaPlus /> Mark Attendance
          </button>
        </div>
      </div>

      <AttendanceFilters
        batches={batches}
        selectedBatch={selectedBatch}
        onBatchChange={setSelectedBatch}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onApply={fetchAttendance}
        onClear={handleClearFilters}
      />

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
          attendanceRecords.map(record => (
            <AttendanceRecordCard
              key={record._id}
              record={record}
              onDelete={handleDelete}
              formatDate={formatDate}
              calculateStats={calculateStats}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Attendance;
