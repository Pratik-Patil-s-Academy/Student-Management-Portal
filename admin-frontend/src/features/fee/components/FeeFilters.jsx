import React from 'react';
import { FaSearch } from 'react-icons/fa';

const FeeFilters = ({
  searchTerm,
  standardFilter,
  statusFilter,
  onFilterChange
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:col-span-1 lg:col-span-2 md:w-auto">
          <select
            value={standardFilter}
            onChange={(e) => onFilterChange('standard', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent text-sm"
          >
            <option value="">All Standards</option>
            <option value="11">Standard 11</option>
            <option value="12">Standard 12</option>
            <option value="Others">Others</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FeeFilters;
