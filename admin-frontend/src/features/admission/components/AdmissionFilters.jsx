import React from 'react';
import { FaSearch, FaSort } from 'react-icons/fa';

const AdmissionFilters = ({
  searchTerm,
  sortBy,
  onFilterChange
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-1/2">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Name or Mobile..."
          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300"
          value={searchTerm}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      <div className="relative w-full md:w-auto min-w-[200px]">
        <select
          className="w-full appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer"
          value={sortBy}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="date_desc">Date (Newest)</option>
          <option value="date_asc">Date (Oldest)</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
        </select>
        <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default AdmissionFilters;
