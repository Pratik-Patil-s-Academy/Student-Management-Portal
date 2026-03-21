import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaClock, FaCalendarAlt, FaUsers, FaGraduationCap } from 'react-icons/fa';

const BatchCard = ({
  batch,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm md:shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="pr-2 truncate">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors truncate" title={batch.name}>
              {batch.name}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <FaGraduationCap /> Class {batch.standard}
            </span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(batch)} className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50" title="Edit">
              <FaEdit className="text-sm md:text-base" />
            </button>
            <button onClick={() => onDelete(batch._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50" title="Delete">
              <FaTrash className="text-sm md:text-base" />
            </button>
          </div>
        </div>

        <div className="space-y-2.5 md:space-y-3 mb-5 md:mb-6">
          <div className="flex items-center gap-2.5 md:gap-3 text-gray-600 text-xs md:text-sm">
            <FaClock className="text-blue-400 flex-shrink-0 text-sm md:text-base" />
            <span className="font-medium text-gray-700">{batch.time.startTime} - {batch.time.endTime}</span>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 text-gray-600 text-xs md:text-sm">
            <FaCalendarAlt className="text-green-500 flex-shrink-0 text-sm md:text-base" />
            <span className="font-medium text-gray-700 truncate" title={batch.days.join(', ')}>
              {batch.days.map(d => d.slice(0, 3)).join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2.5 md:gap-3 text-gray-600 text-xs md:text-sm">
            <FaUsers className="text-purple-400 flex-shrink-0 text-sm md:text-base" />
            <span><span className="font-bold text-gray-800">{batch.students?.length || 0}</span> Students</span>
          </div>
        </div>

        <Link
          to={`/batches/${batch._id}`}
          className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 text-sm md:text-base rounded-lg transition-colors border border-gray-200"
        >
          Manage
        </Link>
      </div>
    </div>
  );
};

export default BatchCard;
