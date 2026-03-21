import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
    <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
      <div className={`p-2.5 md:p-3 rounded-lg shrink-0 ${color.bg} ${color.text}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      {subtext && (
        <span className="text-[10px] md:text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full text-right leading-tight max-w-[60%] line-clamp-2">
          {subtext}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs md:text-sm text-gray-500 font-medium mb-0.5 md:mb-1">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default StatCard;
