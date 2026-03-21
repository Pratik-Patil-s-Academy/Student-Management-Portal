import React from 'react';

const InquiryStats = ({
  stats,
  statusFilter,
  onFilterChange
}) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        onClick={() => onFilterChange('status', '')}
        className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${!statusFilter ? 'ring-2 ring-blue-500' : ''}`}
      >
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Inquiries</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
      </div>
      <div
        onClick={() => onFilterChange('status', 'In Progress')}
        className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${statusFilter === 'In Progress' ? 'ring-2 ring-yellow-500' : ''}`}
      >
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">In Progress</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.byStatus['In Progress'] || 0}</p>
        <div className="mt-2 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
      </div>
      <div
        onClick={() => onFilterChange('status', 'Converted')}
        className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${statusFilter === 'Converted' ? 'ring-2 ring-green-500' : ''}`}
      >
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Converted</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.byStatus['Converted'] || 0}</p>
        <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
      </div>
      <div
        onClick={() => onFilterChange('status', 'Follow Up Required')}
        className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${statusFilter === 'Follow Up Required' ? 'ring-2 ring-red-500' : ''}`}
      >
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Action Required</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          {(stats.byStatus['New'] || 0) + (stats.byStatus['Follow Up Required'] || 0)}
        </p>
        <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-red-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default InquiryStats;
