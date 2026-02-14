import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  Calendar,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    pendingAdmissions: 0,
    totalBatches: 0,
    totalStudents: 0,
    scheduledTests: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
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
        {/* Admissions */}
        <StatCard
          title="Total Admissions"
          value={stats.totalAdmissions}
          icon={FileText}
          color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingAdmissions}
          icon={Clock}
          color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
          subtext="Action Required"
        />

        {/* Students & Batches */}
        <StatCard
          title="Active Batches"
          value={stats.totalBatches}
          icon={BookOpen}
          color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
        />
        <StatCard
          title="Total Students in Batches"
          value={stats.totalStudents}
          icon={Users}
          color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
        />

        {/* Tests & Inquiries */}
        <StatCard
          title="Scheduled Tests"
          value={stats.scheduledTests}
          icon={BarChart3}
          color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
          subtext="Upcoming"
        />
        <StatCard
          title="Inquiry Forms"
          value={stats.totalInquiries}
          icon={Users}
          color={{ bg: 'bg-rose-50', text: 'text-rose-600' }}
        />
      </div>

      {/* Quick Actions or Charts could go here later */}
    </div>
  );
};

export default Dashboard;
