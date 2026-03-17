import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpeg'; 
import { 
  FaHome, 
  FaUserPlus, 
  FaUserGraduate, 
  FaUsers, 
  FaCalendarCheck, 
  FaClipboardList, 
  FaQuestionCircle,
  FaSignOutAlt,
  FaMoneyBillWave
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FaHome },
    { name: 'Admissions', path: '/admissions', icon: FaUserPlus },
    { name: 'Students', path: '/students', icon: FaUserGraduate },
    { name: 'Batches', path: '/batches', icon: FaUsers },
    { name: 'Attendance', path: '/attendance', icon: FaCalendarCheck },
    { name: 'Fee Management', path: '/fees', icon: FaMoneyBillWave },
    { name: 'Tests', path: '/tests', icon: FaClipboardList },
    { name: 'Inquiries', path: '/inquiries', icon: FaQuestionCircle },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2C3E50] text-white transition-transform duration-300 ease-in-out transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:inset-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
            {/* Close Button (Mobile Only) */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded transition-colors duration-200 ${
                        isActive 
                          ? 'bg-[#34495E] text-white font-semibold' 
                          : 'text-gray-300 hover:bg-[#34495E] hover:text-white'
                      }`
                    }
                    onClick={() => {
                        // Close sidebar on mobile when a link is clicked
                        if (window.innerWidth < 768) {
                            toggleSidebar();
                        }
                    }}
                  >
                    <item.icon className="text-xl" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-600">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 text-white rounded hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
