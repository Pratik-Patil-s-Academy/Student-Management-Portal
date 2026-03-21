import React from 'react';
import { FaFilter } from 'react-icons/fa';

const AttendanceFilters = ({
  batches,
  selectedBatch,
  onBatchChange,
  selectedDate,
  onDateChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onApply,
  onClear
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-gray-600 text-sm md:text-base" />
        <h2 className="text-base md:text-lg font-semibold text-gray-800">Filters</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => onBatchChange(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch._id} value={batch._id}>{batch.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Specific Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 md:gap-3 mt-4">
        <button
          onClick={onApply}
          className="flex-1 lg:flex-none lg:px-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium text-sm md:text-base"
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="flex-1 lg:flex-none lg:px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors font-medium text-sm md:text-base"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilters;
