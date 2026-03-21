import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';

const AttendanceRecordCard = ({
  record,
  onDelete,
  formatDate,
  calculateStats
}) => {
  const stats = calculateStats(record.students);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
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
                    <span className={`text-sm font-bold ${stats.percentage >= 75 ? 'text-green-600' :
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium text-center justify-center whitespace-nowrap"
            >
              <FaEdit /> Edit
            </Link>
            <button
              onClick={() => onDelete(record._id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium text-center justify-center whitespace-nowrap"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecordCard;
