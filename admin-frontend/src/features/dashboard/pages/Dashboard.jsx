import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../config/api';
import {
  Users, FileText, Clock, BookOpen, Calendar, BarChart3, TrendingUp, DollarSign
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CustomTooltip from '../components/CustomTooltip';

const DashboardCharts = React.lazy(() => import('../components/DashboardCharts'));

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
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm md:text-base text-gray-500 mt-0.5 md:mt-1">Welcome back, {admin?.name || 'Admin'}!</p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 bg-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm border border-gray-100 self-start md:self-auto">
          <Calendar size={16} className="shrink-0" />
          <span className="truncate">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 md:p-4 rounded-lg border border-red-100 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
      <React.Suspense fallback={
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-pulse flex space-y-4 flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-48 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      }>
        <DashboardCharts
          charts={charts}
          hasTrendData={hasTrendData}
          hasFeeData={hasFeeData}
          hasStdData={hasStdData}
          feeColors={FEE_COLORS}
          stdColors={STD_COLORS}
        />
      </React.Suspense>
    </div>
  );
};

export default Dashboard;
