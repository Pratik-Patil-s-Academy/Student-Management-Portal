import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInquiryById, updateInquiryStatus, deleteInquiry } from '../services/inquiryService';
import { FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  const fetchInquiry = async () => {
    try {
      const data = await getInquiryById(id);
      if (data.success) {
        setInquiry(data.inquiry);
        console.log(data.inquiry);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inquiry details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const result = await updateInquiryStatus(id, newStatus);
      if (result.success) {
        setInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
            try {
                await deleteInquiry(id);
                navigate('/inquiries');
            } catch (err) {
                alert('Failed to delete inquiry: ' + (err.message || 'Unknown error'));
            }
        }
    }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading inquiry details...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
  if (!inquiry) return <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">Inquiry not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <button 
          onClick={() => navigate('/inquiries')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-all duration-200 font-medium hover:gap-3 group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" /> 
          <span>Back to Inquiries</span>
        </button>
        
        <div className="flex items-center gap-3">
            <select
            value={inquiry.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className={`px-5 py-2.5 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 font-semibold cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                updating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ 
                backgroundColor: 
                inquiry.status === 'New' ? '#DBEAFE' : 
                inquiry.status === 'In Progress' ? '#FEF9C3' :
                inquiry.status === 'Follow Up Required' ? '#FFEDD5' :
                inquiry.status === 'Converted' ? '#DCFCE7' : '#FEE2E2',
                color:
                inquiry.status === 'New' ? '#1E40AF' : 
                inquiry.status === 'In Progress' ? '#854D0E' :
                inquiry.status === 'Follow Up Required' ? '#9A3412' :
                inquiry.status === 'Converted' ? '#166534' : '#991B1B',
                borderColor:
                inquiry.status === 'New' ? '#3B82F6' : 
                inquiry.status === 'In Progress' ? '#EAB308' :
                inquiry.status === 'Follow Up Required' ? '#F97316' :
                inquiry.status === 'Converted' ? '#22C55E' : '#EF4444'
            }}
            >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Follow Up Required">Follow Up Required</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
            </select>
            
            <button 
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-full transition-all duration-200 border-2 border-red-200 hover:border-red-600 shadow-sm hover:shadow-md"
            >
                Delete
            </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-[#2C3E50] to-[#3d5266] px-8 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaUser className="text-lg" />
            </div>
            {inquiry.studentDetails?.fullName || 'N/A'}
          </h1>
          <p className="text-gray-200 text-sm mt-2 ml-13">Inquiry Date: {inquiry.inquiryDate ? new Date(inquiry.inquiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 pb-3 border-b-2 border-[#2C3E50] inline-block">Personal & Contact</h3>
            <div className="space-y-4 text-gray-700">
               <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                 <span className="font-semibold min-w-[100px]">Gender:</span>
                 <span>{inquiry.studentDetails?.gender || 'N/A'}</span>
               </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FaPhone className="mt-1 text-[#2C3E50]" />
                <span className="font-semibold min-w-[100px]">Parent:</span>
                <span className="text-blue-600 font-medium">{inquiry.contact?.parentMobile || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FaPhone className="mt-1 text-[#2C3E50]" />
                <span className="font-semibold min-w-[100px]">Student:</span>
                <span className="text-blue-600 font-medium">{inquiry.contact?.studentMobile || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-semibold min-w-[100px]">Email:</span>
                <span className="text-blue-600">{inquiry.contact?.email || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FaMapMarkerAlt className="mt-1 text-[#2C3E50]" />
                <span className="font-semibold min-w-[100px]">Address:</span>
                <span>{inquiry.studentDetails?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

           {/* Parent Info */}
           <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 pb-3 border-b-2 border-[#2C3E50] inline-block">Parent Details</h3>
            <div className="space-y-4 text-gray-700">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-all">
                  <p className="font-bold text-gray-800 mb-1">Father</p>
                  <p className="text-lg">{inquiry.parents?.father?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-1">{inquiry.parents?.father?.occupation || 'Occupation N/A'}</p>
                </div>
                
                <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500 hover:shadow-md transition-all">
                  <p className="font-bold text-gray-800 mb-1">Mother</p>
                  <p className="text-lg">{inquiry.parents?.mother?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-1">{inquiry.parents?.mother?.occupation || 'Occupation N/A'}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-[#2C3E50] flex items-center gap-3 inline-block">
            <FaGraduationCap className="text-2xl" /> Academic Details
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Interest */}
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">Interested In</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Target Standard:</span> 
                      <span className="ml-2 px-3 py-1 bg-[#2C3E50] text-white rounded-full text-sm font-bold inline-block">{inquiry.standard || 'N/A'}</span>
                    </p>
                    <p className="text-gray-700"><span className="font-semibold">Reference:</span> {inquiry.reference || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                  <p className="font-semibold text-gray-800 mb-2">Student Note</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{inquiry.interestedStudentNote || 'N/A'}</p>
                </div>
                 
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                  <p className="font-semibold text-gray-800 mb-2">Special Requirements</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{inquiry.specialRequirement || 'N/A'}</p>
                </div>
            </div>

            {/* Academic History */}
            <div className="space-y-5">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                    <h5 className="font-bold text-gray-800 text-base mb-3 flex items-center justify-between">
                      <span>SSC {inquiry.academics?.ssc?.board ? `(${inquiry.academics.ssc.board})` : ''}</span>
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">School:</span> {inquiry.academics?.ssc?.schoolName || 'N/A'}
                    </p>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-white p-3 rounded-lg text-center border border-blue-200">
                          <p className="text-xs text-gray-500 mb-1">Percentage</p>
                          <p className="text-xl font-bold text-blue-600">{inquiry.academics?.ssc?.percentageOrCGPA || 'N/A'}%</p>
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-lg text-center border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">Maths</p>
                          <p className="text-xl font-bold text-green-600">{inquiry.academics?.ssc?.mathsMarks || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                    <h5 className="font-bold text-gray-800 text-base mb-3 flex items-center justify-between">
                      <span>11th {inquiry.academics?.eleventh?.board ? `(${inquiry.academics.eleventh.board})` : ''}</span>
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">College:</span> {inquiry.academics?.eleventh?.collegeName || 'N/A'}
                    </p>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-white p-3 rounded-lg text-center border border-blue-200">
                          <p className="text-xs text-gray-500 mb-1">Percentage</p>
                          <p className="text-xl font-bold text-blue-600">{inquiry.academics?.eleventh?.percentageOrCGPA || 'N/A'}%</p>
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-lg text-center border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">Maths</p>
                          <p className="text-xl font-bold text-green-600">{inquiry.academics?.eleventh?.mathsMarks || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail;
