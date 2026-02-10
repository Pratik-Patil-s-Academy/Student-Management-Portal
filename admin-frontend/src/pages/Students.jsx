import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudents } from '../services/studentService';
import { FaSearch, FaSort, FaEye, FaUserGraduate, FaFilter } from 'react-icons/fa';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL Params for persistence
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const standardFilter = searchParams.get('standard') || '';
  const sortBy = searchParams.get('sort') || 'date_desc';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
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
  const filteredStudents = students
    .filter(student => {
      const nameMatch = student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const mobileMatch = student.contact?.parentMobile?.includes(searchTerm) || student.contact?.studentMobile?.includes(searchTerm);
      const searchMatch = nameMatch || mobileMatch;

      const statusMatch = statusFilter ? student.status === statusFilter : true;
      const standardMatch = standardFilter ? student.standard === standardFilter : true;

      return searchMatch && statusMatch && standardMatch;
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
        <p className="text-gray-600 font-medium">Loading students...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Students</h1>
        <div className="text-sm text-gray-500">
          Total Students: <span className="font-bold text-[#2C3E50]">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Filters */}
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
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
             <div className="relative">
                <select
                className="w-full md:w-40 appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer"
                value={standardFilter}
                onChange={(e) => updateFilter('standard', e.target.value)}
                >
                <option value="">All Standards</option>
                <option value="11">11th</option>
                <option value="12">12th</option>
                <option value="Others">Others</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

             <div className="relative">
                <select
                className="w-full md:w-40 appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer"
                value={statusFilter}
                onChange={(e) => updateFilter('status', e.target.value)}
                >
                <option value="">All Statuses</option>
                <option value="Admitted">Admitted</option>
                <option value="Not Admitted">Not Admitted</option>
                <option value="Dropped">Dropped</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
                <select
                className="w-full md:w-40 appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer"
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

      {/* List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Standard</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-blue-50 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {student.rollno || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {student.personalDetails?.photoUrl ? (
                        <img src={student.personalDetails.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <FaUserGraduate />
                        </div>
                    )}
                    {student.personalDetails?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.contact?.parentMobile || 'N/A'}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2C3E50]">
                    {student.standard}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.batch ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">{student.batch.name}</span>
                    ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm 
                        ${student.status === 'Admitted' ? 'bg-green-100 text-green-800' : 
                          student.status === 'Dropped' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/students/${student._id}`} 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all group-hover:gap-3"
                    >
                      <FaEye /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                 <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="text-3xl text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold">No students found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4 bg-gray-50">
             {filteredStudents.map((student) => (
                <div key={student._id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           {student.personalDetails?.photoUrl ? (
                                <img src={student.personalDetails.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <FaUserGraduate />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{student.personalDetails?.fullName || 'N/A'}</h3>
                                <p className="text-xs text-gray-500">Roll: {student.rollno || 'N/A'}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm 
                            ${student.status === 'Admitted' ? 'bg-green-100 text-green-800' : 
                              student.status === 'Dropped' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {student.status}
                        </span>
                     </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                        <p><span className="font-semibold text-gray-800">Mobile:</span> {student.contact?.parentMobile || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-800">Standard:</span> <span className="text-[#2C3E50] font-bold">{student.standard}</span></p>
                        <p><span className="font-semibold text-gray-800">Batch:</span> {student.batch ? <span className="text-purple-700 font-medium">{student.batch.name}</span> : 'Unassigned'}</p>
                      </div>
                       <Link 
                        to={`/students/${student._id}`} 
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md"
                      >
                        <FaEye /> View Profile
                      </Link>
                </div>
             ))}
             {filteredStudents.length === 0 && (
                <div className="text-center text-gray-500 py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FaSearch className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold">No students found</p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default Students;
