import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudentsWithFees } from '../services/feeService';
import { FaSearch, FaPlus, FaEye, FaMoneyBillWave, FaFilter, FaPlusCircle, FaReceipt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FeeManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const standardFilter = searchParams.get('standard') || '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllStudentsWithFees();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      toast.error('Failed to fetch students data');
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

  const filteredStudents = students
    .filter(student => {
      if (searchTerm && !student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !student.rollno?.toString().includes(searchTerm)) {
        return false;
      }
      if (standardFilter && student.standard !== standardFilter) {
        return false;
      }
      if (statusFilter) {
        const status = student.feeInfo?.feeStatus?.toLowerCase() || 'pending';
        if (statusFilter === 'paid' && status !== 'paid') return false;
        if (statusFilter === 'pending' && status !== 'pending') return false;
        if (statusFilter === 'partial' && status !== 'partially paid') return false;
      }
      return true;
    });

  const getFeeStatus = (student) => {
    return student.feeInfo?.feeStatus || 'No Fees';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading students...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaMoneyBillWave className="text-[#2C3E50]" />
            Fee Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student fee payments and track payment history
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all duration-200"
            />
          </div>

          <select
            value={standardFilter}
            onChange={(e) => updateFilter('standard', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
          >
            <option value="">All Standards</option>
            <option value="11">Standard 11</option>
            <option value="12">Standard 12</option>
            <option value="Others">Others</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll No / Standard
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-lg font-medium">No students found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const feeStatus = getFeeStatus(student);
                  const statusColor = getStatusColor(feeStatus);
                  
                  return (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.personalDetails?.photoUrl ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" 
                                src={student.personalDetails.photoUrl} 
                                alt="Profile"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#2C3E50] flex items-center justify-center text-white font-semibold">
                                {student.personalDetails?.fullName?.charAt(0) || 'S'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.personalDetails?.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.personalDetails?.gender || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{student.rollno || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Standard {student.standard}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{student.contact?.parentMobile || 'N/A'}</div>
                        <div className="text-gray-500">{student.contact?.email || 'No email'}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                          {feeStatus}
                        </span>
                        {student.feeInfo?.hasPayments && (
                          <div className="mt-1 text-xs text-gray-500">
                            <div>Paid: ₹{student.feeInfo.totalPaid}</div>
                            {student.feeInfo.remainingAmount > 0 && (
                              <div className="text-orange-600">Due: ₹{student.feeInfo.remainingAmount}</div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/fees/student/${student._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-600"
                        >
                          <FaEye /> View
                        </Link>
                        
                        <Link
                          to={`/fees/payment/${student._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all duration-200 border border-green-200 hover:border-green-600"
                        >
                          <FaPlusCircle /> Add Payment
                        </Link>
                        
                        <Link
                          to={`/fees/receipt/${student._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-600"
                        >
                          <FaReceipt /> Receipt
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStudents.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredStudents.length}</div>
              <div className="text-sm text-blue-800">Total Students</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredStudents.filter(s => getFeeStatus(s) === 'Paid').length}
              </div>
              <div className="text-sm text-green-800">Fully Paid</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredStudents.filter(s => getFeeStatus(s) === 'Partial').length}
              </div>
              <div className="text-sm text-yellow-800">Partially Paid</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredStudents.filter(s => getFeeStatus(s) === 'Pending').length}
              </div>
              <div className="text-sm text-red-800">Pending</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;