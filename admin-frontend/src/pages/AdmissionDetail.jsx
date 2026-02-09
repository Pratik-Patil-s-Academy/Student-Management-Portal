import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdmissionById, decideAdmission } from '../services/admissionService';
import { FaArrowLeft, FaUserGraduate, FaPhone, FaMapMarkerAlt, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const AdmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAdmission();
  }, [id]);

  const fetchAdmission = async () => {
    try {
      const data = await getAdmissionById(id);
      if (data.success) {
        setAdmission(data.admission);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admission details');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} this admission?`)) return;
    
    setProcessing(true);
    try {
      const result = await decideAdmission(id, action);
      if (result.success) {
        alert(result.message);
        navigate('/admissions');
      }
    } catch (err) {
      alert('Failed to process admission: ' + (err.message || 'Unknown error'));
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading details...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
  if (!admission) return <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">Admission not found.</div>;

  const pd = admission.personalDetails || {};
  const contact = admission.contact || {};
  const parents = admission.parents || {};
  const academics = admission.academics || {};
  const admInfo = admission.admission || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <button 
          onClick={() => navigate('/admissions')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-all duration-200 font-medium hover:gap-3 group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" /> 
          <span>Back to Queue</span>
        </button>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => handleDecision('reject')}
                disabled={processing}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-full transition-all duration-200 border-2 border-red-200 hover:border-red-600 shadow-sm hover:shadow-md disabled:opacity-50"
            >
                <FaTimes /> Reject
            </button>
            <button 
                onClick={() => handleDecision('approve')}
                disabled={processing}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-full transition-all duration-200 border-2 border-green-200 hover:border-green-600 shadow-sm hover:shadow-md disabled:opacity-50"
            >
                <FaCheck /> Approve
            </button>
        </div>
      </div>

       {/* Banner Note */}
       <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
             <FaCalendarAlt className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Admission Date: <strong>{new Date(admission.createdAt).toLocaleDateString()}</strong> | Status: <strong>{admission.status}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-[#2C3E50] to-[#3d5266] px-8 py-6">
          <div className="flex items-center gap-6">
             {pd.photoUrl ? (
                <img src={pd.photoUrl} alt="Student" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
             ) : (
                <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white border-4 border-transparent">
                  <FaUserGraduate className="text-4xl" />
                </div>
             )}
             <div>
                <h1 className="text-3xl font-bold text-white">{pd.fullName || 'N/A'}</h1>
                <p className="text-gray-200 text-lg mt-1">Standard: {admission.standard || 'N/A'}</p>
             </div>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal & Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 pb-3 border-b-2 border-[#2C3E50] inline-block">Personal & Contact</h3>
            <div className="grid grid-cols-1 gap-4 text-gray-700">
               <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">DOB</span>
                 <span>{pd.dob ? new Date(pd.dob).toLocaleDateString() : 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">Gender</span>
                 <span>{pd.gender || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">Caste</span>
                 <span>{pd.caste || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">Address</span>
                 <span className="text-right max-w-[60%]">{pd.address || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">Student Mobile</span>
                 <span className="text-blue-600 font-medium">{contact.studentMobile || 'N/A'}</span>
               </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">Parent Mobile</span>
                 <span className="text-blue-600 font-medium">{contact.parentMobile || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="font-semibold text-gray-500">Email</span>
                 <span className="text-blue-600">{contact.email || 'N/A'}</span>
               </div>
            </div>
          </div>

           {/* Parent Info */}
           <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 pb-3 border-b-2 border-[#2C3E50] inline-block">Parent Details</h3>
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-all">
                  <p className="font-bold text-gray-800 mb-1">Father</p>
                  <p className="text-lg">{parents.father?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-1">{parents.father?.occupation || 'Occupation N/A'}</p>
                </div>
                
                <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500 hover:shadow-md transition-all">
                  <p className="font-bold text-gray-800 mb-1">Mother</p>
                  <p className="text-lg">{parents.mother?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-1">{parents.mother?.occupation || 'Occupation N/A'}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-[#2C3E50] flex items-center gap-3 inline-block">
            <FaUserGraduate className="text-2xl" /> Academic History
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                <h5 className="font-bold text-gray-800 text-base mb-3 flex items-center justify-between">
                    <span>SSC {academics.ssc?.board ? `(${academics.ssc.board})` : ''}</span>
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">School:</span> {academics.ssc?.schoolName || 'N/A'}
                </p>
                <div className="flex gap-4">
                    <div className="flex-1 bg-white p-3 rounded-lg text-center border border-blue-200">
                        <p className="text-xs text-gray-500 mb-1">Percentage</p>
                        <p className="text-xl font-bold text-blue-600">{academics.ssc?.percentageOrCGPA || 'N/A'}%</p>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg text-center border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Maths</p>
                        <p className="text-xl font-bold text-green-600">{academics.ssc?.mathsMarks || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                <h5 className="font-bold text-gray-800 text-base mb-3 flex items-center justify-between">
                    <span>HSC {academics.hsc?.board ? `(${academics.hsc.board})` : ''}</span>
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">College:</span> {academics.hsc?.collegeName || 'N/A'}
                </p>
                <div className="flex gap-4">
                    <div className="flex-1 bg-white p-3 rounded-lg text-center border border-blue-200">
                        <p className="text-xs text-gray-500 mb-1">Percentage</p>
                        <p className="text-xl font-bold text-blue-600">{academics.hsc?.percentageOrCGPA || 'N/A'}%</p>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg text-center border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Maths</p>
                        <p className="text-xl font-bold text-green-600">{academics.hsc?.mathsMarks || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

       {/* Admission Info Card */}
       <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-[#2C3E50] flex items-center gap-3 inline-block">
            <FaCalendarAlt className="text-2xl" /> Admission Details
        </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
               <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Target Examination</p>
               <p className="text-2xl font-bold text-gray-800 mt-1">{admInfo.targetExamination || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
               <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Reference</p>
               <p className="text-2xl font-bold text-gray-800 mt-1">{admInfo.reference || 'N/A'}</p>
            </div>
        </div>
       </div>
    </div>
  );
};

export default AdmissionDetail;
