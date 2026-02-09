import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { admin } = useAuth();

  return (
    <div>
        <h2 className="text-2xl font-bold mb-4 text-[#2C3E50]">Dashboard Overview</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome back, {admin?.name || 'Admin'}!</p>
          <p className="mt-2 text-gray-500">Select an option from the sidebar to manage the portal.</p>
        </div>
    </div>
  );
};

export default Dashboard;
