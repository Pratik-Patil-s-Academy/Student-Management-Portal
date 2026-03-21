import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Users } from 'lucide-react';
import CustomTooltip from './CustomTooltip';

const DashboardCharts = ({ charts, hasTrendData, hasFeeData, hasStdData, feeColors, stdColors }) => {
  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Admissions Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500 shrink-0" />
            Monthly Admissions (Last 6 Months)
          </h3>
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.admissionTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Admissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No admission data available yet
            </div>
          )}
        </div>

        {/* Fee Status Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-green-500 shrink-0" />
            Fee Collection Status
          </h3>
          {hasFeeData ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={charts.feeBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {charts.feeBreakdown.map((_, i) => (
                      <Cell key={i} fill={feeColors[i % feeColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {charts.feeBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: feeColors[i] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No fee data available yet
            </div>
          )}
        </div>
      </div>

      {/* Standard Distribution */}
      {hasStdData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-500 shrink-0" />
            Students by Standard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={charts.standardDistribution}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {charts.standardDistribution.map((_, i) => (
                    <Cell key={i} fill={stdColors[i % stdColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {charts.standardDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ background: stdColors[i] }} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{d.name}</span>
                      <span className="text-sm font-bold text-gray-800">{d.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round((d.value / (charts.standardDistribution.reduce((s, x) => s + x.value, 0) || 1)) * 100)}%`,
                          background: stdColors[i]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
