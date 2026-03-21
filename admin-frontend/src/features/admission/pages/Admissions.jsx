import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllAdmissions } from '../services/admissionService';
import { FaSearch } from 'react-icons/fa';
import AdmissionFilters from '../components/AdmissionFilters';
import AdmissionTable from '../components/AdmissionTable';
import AdmissionCard from '../components/AdmissionCard';

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

      <AdmissionFilters
        searchTerm={searchTerm}
        sortBy={sortBy}
        onFilterChange={updateFilter}
      />

      {/* List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <AdmissionTable admissions={filteredAdmissions} />

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-4 bg-gray-50">
          {filteredAdmissions.map((admission) => (
            <AdmissionCard key={admission._id} admission={admission} />
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
