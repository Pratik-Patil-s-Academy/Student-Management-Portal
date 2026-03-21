import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllInquiries, getInquiryStats } from '../services/inquiryService';
import { FaSearch } from 'react-icons/fa';
import InquiryStats from '../components/InquiryStats';
import InquiryFilters from '../components/InquiryFilters';
import InquiryTable from '../components/InquiryTable';
import InquiryCard from '../components/InquiryCard';

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

      <InquiryStats
        stats={stats}
        statusFilter={statusFilter}
        onFilterChange={updateFilter}
      />

      {/* Filters & Search */}
      <InquiryFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onFilterChange={updateFilter}
      />

      {/* Responsive List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <InquiryTable
          inquiries={filteredInquiries}
          getStatusColor={getStatusColor}
        />

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4 bg-gray-50">
          {filteredInquiries.map((inquiry) => (
            <InquiryCard
              key={inquiry._id}
              inquiry={inquiry}
              getStatusColor={getStatusColor}
            />
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
