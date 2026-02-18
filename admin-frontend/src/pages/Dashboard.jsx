import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
  Users, FileText, CheckCircle, Clock, BookOpen, Calendar, BarChart3, TrendingUp, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const FEE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const STD_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4'];

const Dashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalAdmissions: 0, pendingAdmissions: 0, totalBatches: 0,
    totalStudents: 0, scheduledTests: 0, totalInquiries: 0,
    totalCollected: 0, totalOutstanding: 0,
  });
  const [charts, setCharts] = useState({
    standardDistribution: [], feeBreakdown: [], admissionTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
          setCharts(response.data.charts || {});
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color.bg} ${color.text}`}>
          <Icon size={24} />
        </div>
        {subtext && <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">{subtext}</span>}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm">
          {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || p.fill }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasFeeData = charts.feeBreakdown?.some(d => d.value > 0);
  const hasStdData = charts.standardDistribution?.some(d => d.value > 0);
  const hasTrendData = charts.admissionTrend?.some(d => d.count > 0);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Welcome back, {admin?.name || 'Admin'}!</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Admissions" value={stats.totalAdmissions} icon={FileText} color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} />
        <StatCard title="Pending Approvals" value={stats.pendingAdmissions} icon={Clock} color={{ bg: 'bg-amber-50', text: 'text-amber-600' }} subtext="Action Required" />
        <StatCard title="Active Batches" value={stats.totalBatches} icon={BookOpen} color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} />
        <StatCard title="Total Students in Batches" value={stats.totalStudents} icon={Users} color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} />
        <StatCard title="Scheduled Tests" value={stats.scheduledTests} icon={BarChart3} color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} subtext="Upcoming" />
        <StatCard title="Inquiry Forms" value={stats.totalInquiries} icon={Users} color={{ bg: 'bg-rose-50', text: 'text-rose-600' }} />
      </div>

      {/* Fee Collection Summary */}
      {(stats.totalCollected > 0 || stats.totalOutstanding > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-green-700">Total Collected</p>
            </div>
            <p className="text-3xl font-bold text-green-800">₹{stats.totalCollected?.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-red-600" />
              <p className="text-sm font-semibold text-red-700">Total Outstanding</p>
            </div>
            <p className="text-3xl font-bold text-red-800">₹{stats.totalOutstanding?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Admissions Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-green-500" />
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
                      <Cell key={i} fill={FEE_COLORS[i % FEE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {charts.feeBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: FEE_COLORS[i] }} />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
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
                    <Cell key={i} fill={STD_COLORS[i % STD_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {charts.standardDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ background: STD_COLORS[i] }} />
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
                          background: STD_COLORS[i]
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

export default Dashboard;
