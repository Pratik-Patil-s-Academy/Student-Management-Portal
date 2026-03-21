import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { FaUserGraduate, FaUsers } from 'react-icons/fa';

const AttendanceCharts = ({ 
  stats, selectedStudent, students, pieColors, 
  batchStats, selectedBatch, batches 
}) => {
  return (
    <div className="space-y-6">
      {/* Individual Student Stats Chart */}
      {stats && selectedStudent && stats.totalClasses > 0 && (
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-600 mb-2">Attendance Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Present', value: stats.totalPresent },
                  { name: 'Absent', value: stats.totalAbsent },
                ]}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                dataKey="value"
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {[0, 1].map(i => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1">
            {[{ label: 'Present', color: pieColors[0] }, { label: 'Absent', color: pieColors[1] }].map(d => (
              <div key={d.label} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-gray-600">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch-wise Bar Chart */}
      {batchStats.length > 0 && selectedBatch && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Attendance % per Student</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, batchStats.length * 36)}>
            <BarChart
              layout="vertical"
              data={[...batchStats]
                .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
                .map(s => ({
                  name: s.name.split(' ')[0],
                  pct: parseFloat(s.attendancePercentage),
                }))}
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
              <ReferenceLine x={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '75%', position: 'top', fontSize: 10, fill: '#f59e0b' }} />
              <Bar dataKey="pct" name="Attendance %" radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 10, formatter: (v) => `${v}%` }}
                fill="#6366f1"
                background={{ fill: '#f3f4f6', radius: [0, 4, 4, 0] }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AttendanceCharts;
