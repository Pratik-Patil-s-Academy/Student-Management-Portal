import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaUserGraduate, FaSearch } from 'react-icons/fa';

const AdmissionCard = ({
  admission
}) => {
  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
      {admission.personalDetails?.photoUrl ? (
        <img src={admission.personalDetails.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
          <FaUserGraduate />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate">{admission.personalDetails?.fullName || 'N/A'}</h3>
        <p className="text-xs text-gray-400">{new Date(admission.createdAt).toLocaleDateString()}</p>
      </div>
      <Link
        to={`/admissions/${admission._id}`}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold transition-colors"
      >
        <FaEye className="text-blue-500" />
        {admission.status}
      </Link>
    </div>
  );
};

export default AdmissionCard;
