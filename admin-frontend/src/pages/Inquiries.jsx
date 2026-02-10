import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllInquiries, getInquiryStats } from '../services/inquiryService';
import { FaSearch, FaFilter, FaSort, FaEye } from 'react-icons/fa';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL Params for persistance
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const sortBy = searchParams.get('sort') || 'date_desc';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inquiriesData, statsData] = await Promise.all([
        getAllInquiries(),
        getInquiryStats()
      ]);
      if (inquiriesData.success) {
        setInquiries(inquiriesData.inquiries);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for updating URL params
  const updateFilter = (key, value) => {
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        return newParams;
    });
  };

  // Filtering and Sorting Logic
  const filteredInquiries = inquiries
    .filter(inquiry => {
      const matchesSearch = 
        inquiry.studentDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.contact?.parentMobile?.includes(searchTerm) || 
        inquiry.contact?.studentMobile?.includes(searchTerm);
      
      const matchesStatus = statusFilter ? inquiry.status === statusFilter : true;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.inquiryDate) - new Date(a.inquiryDate);
      if (sortBy === 'date_asc') return new Date(a.inquiryDate) - new Date(b.inquiryDate);
      if (sortBy === 'name_asc') return a.studentDetails.fullName.localeCompare(b.studentDetails.fullName);
      if (sortBy === 'name_desc') return b.studentDetails.fullName.localeCompare(a.studentDetails.fullName);
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Follow Up Required': return 'bg-orange-100 text-orange-800';
      case 'Converted': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading inquiries...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Inquiries</h1>
        <div className="text-sm text-gray-500">
          Total: <span className="font-bold text-[#2C3E50]">{filteredInquiries.length}</span> / {inquiries.length}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => updateFilter('status', '')}
            className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${!statusFilter ? 'ring-2 ring-blue-500' : ''}`}
          >
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Inquiries</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
          </div>
          <div 
            onClick={() => updateFilter('status', 'In Progress')}
            className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${statusFilter === 'In Progress' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">In Progress</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.byStatus['In Progress'] || 0}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
          </div>
          <div 
             onClick={() => updateFilter('status', 'Converted')}
            className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${statusFilter === 'Converted' ? 'ring-2 ring-green-500' : ''}`}
          >
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Converted</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.byStatus['Converted'] || 0}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
          </div>
          <div 
             onClick={() => updateFilter('status', 'Follow Up Required')}
            className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${statusFilter === 'Follow Up Required' ? 'ring-2 ring-red-500' : ''}`}
          >
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Action Required</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {(stats.byStatus['New'] || 0) + (stats.byStatus['Follow Up Required'] || 0)}
            </p>
            <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-red-300 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name or Mobile..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300"
            value={searchTerm}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-1/2 md:w-auto">
            <select
              className="w-full appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer"
              value={statusFilter}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Follow Up Required">Follow Up Required</option>
              <option value="Converted">Converted</option>
              <option value="Closed">Closed</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-1/2 md:w-auto">
            <select
              className="w-full appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer"
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
            <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Responsive List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Standard</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-blue-50 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {new Date(inquiry.inquiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {inquiry.studentDetails?.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {inquiry.contact?.parentMobile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2C3E50]">
                    {inquiry.standard}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/inquiries/${inquiry._id}`} 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all group-hover:gap-3"
                    >
                      <FaEye /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredInquiries.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="text-3xl text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold">No inquiries found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4 bg-gray-50">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{inquiry.studentDetails?.fullName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{new Date(inquiry.inquiryDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                <p><span className="font-semibold text-gray-800">Mobile:</span> {inquiry.contact?.parentMobile}</p>
                <p><span className="font-semibold text-gray-800">Standard:</span> <span className="text-[#2C3E50] font-bold">{inquiry.standard}</span></p>
              </div>
              <Link 
                to={`/inquiries/${inquiry._id}`} 
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md"
              >
                <FaEye /> View Details
              </Link>
            </div>
          ))}
          {filteredInquiries.length === 0 && (
            <div className="text-center text-gray-500 py-12 bg-white rounded-xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <p className="text-lg font-semibold">No inquiries found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inquiries;
