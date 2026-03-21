import React from 'react';
import { FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const FeeCharts = ({
  students,
  getFeeStatus,
  feeColors
}) => {
  if (students.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fee Status Donut */}
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" /> Fee Status Breakdown
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Paid', value: students.filter(s => getFeeStatus(s) === 'Paid').length },
                  { name: 'Partially Paid', value: students.filter(s => getFeeStatus(s) === 'Partially Paid').length },
                  { name: 'Pending', value: students.filter(s => getFeeStatus(s) === 'Pending').length },
                ]}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {feeColors.map((color, i) => <Cell key={i} fill={color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3 min-w-[140px]">
            {[
              { label: 'Paid', color: feeColors[0], count: students.filter(s => getFeeStatus(s) === 'Paid').length },
              { label: 'Partially Paid', color: feeColors[1], count: students.filter(s => getFeeStatus(s) === 'Partially Paid').length },
              { label: 'Pending', color: feeColors[2], count: students.filter(s => getFeeStatus(s) === 'Pending').length },
            ].map(d => (
              <div key={d.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-sm text-gray-600">{d.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{d.count}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-800">{students.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Standard Bar Chart */}
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaFilter className="text-blue-500" /> Fee Collection by Standard
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={['11', '12', 'Others'].map(std => {
              const stdStudents = students.filter(s => s.standard === std);
              const collected = stdStudents.reduce((sum, s) => sum + (s.feeInfo?.totalPaid || 0), 0);
              const outstanding = stdStudents.reduce((sum, s) => sum + (s.feeInfo?.remainingAmount || 0), 0);
              return { std: `Std ${std}`, collected, outstanding };
            })}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="std" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
            <Tooltip formatter={(v, n) => [`₹${v.toLocaleString('en-IN')}`, n === 'collected' ? 'Collected' : 'Outstanding']} />
            <Legend formatter={n => n === 'collected' ? 'Collected' : 'Outstanding'} />
            <Bar dataKey="collected" name="collected" fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey="outstanding" name="outstanding" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeeCharts;
