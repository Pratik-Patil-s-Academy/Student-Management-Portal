import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllAdmissions } from '../services/admissionService';
import { FaSearch, FaSort, FaEye, FaUserGraduate } from 'react-icons/fa';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL Params for persistence
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'date_desc';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllAdmissions();
      if (data.success) {
        setAdmissions(data.admissions);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  };

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

  // Filter & Sort Logic
  const filteredAdmissions = admissions
    .filter(admission => {
      const nameMatch = admission.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const mobileMatch = admission.contact?.parentMobile?.includes(searchTerm) || admission.contact?.studentMobile?.includes(searchTerm);
      return nameMatch || mobileMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name_asc') return (a.personalDetails?.fullName || '').localeCompare(b.personalDetails?.fullName || '');
      if (sortBy === 'name_desc') return (b.personalDetails?.fullName || '').localeCompare(a.personalDetails?.fullName || '');
      return 0;
    });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading admissions...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Admissions Queue</h1>
        <div className="text-sm text-gray-500">
          Pending: <span className="font-bold text-[#2C3E50]">{filteredAdmissions.length}</span>
        </div>
      </div>

       {/* Banner Note */}
       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Only <strong>Pending</strong> admissions appear here. Approving a student moves them to the Students list. Rejecting deletes the request.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name or Mobile..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300"
            value={searchTerm}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-auto min-w-[200px]">
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

      {/* List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Standard</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmissions.map((admission) => (
                <tr key={admission._id} className="hover:bg-blue-50 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {new Date(admission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {admission.personalDetails?.photoUrl ? (
                        <img src={admission.personalDetails.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <FaUserGraduate />
                        </div>
                    )}
                    {admission.personalDetails?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {admission.contact?.parentMobile || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2C3E50]">
                    {admission.standard}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm bg-yellow-100 text-yellow-800">
                      {admission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/admissions/${admission._id}`} 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all group-hover:gap-3"
                    >
                      <FaEye /> Review
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAdmissions.length === 0 && (
                 <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="text-3xl text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold">No pending admissions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4 bg-gray-50">
             {filteredAdmissions.map((admission) => (
                <div key={admission._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           {admission.personalDetails?.photoUrl ? (
                                <img src={admission.personalDetails.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <FaUserGraduate />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{admission.personalDetails?.fullName || 'N/A'}</h3>
                                <p className="text-xs text-gray-500">{new Date(admission.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold rounded-full shadow-sm bg-yellow-100 text-yellow-800">
                            {admission.status}
                        </span>
                     </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                        <p><span className="font-semibold text-gray-800">Mobile:</span> {admission.contact?.parentMobile || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-800">Standard:</span> <span className="text-[#2C3E50] font-bold">{admission.standard}</span></p>
                      </div>
                       <Link 
                        to={`/admissions/${admission._id}`} 
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md"
                      >
                        <FaEye /> Review Request
                      </Link>
                </div>
             ))}
             {filteredAdmissions.length === 0 && (
                <div className="text-center text-gray-500 py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FaSearch className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold">No pending admissions found</p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default Admissions;
