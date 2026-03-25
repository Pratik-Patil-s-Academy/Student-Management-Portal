import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';

const InquiryCard = ({
  inquiry,
  getStatusColor
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{inquiry.studentDetails?.fullName}</h3>
          <p className="text-xs text-gray-500 mt-1">{new Date(inquiry.inquiryDate).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(inquiry.status)}`}>
          {inquiry.status}
        </span>
      </div>
      <div className="space-y-1.5 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
        <p className="flex justify-between items-center"><span className="font-semibold text-gray-800">Mobile:</span> <span>{inquiry.contact?.parentMobile}</span></p>
        {inquiry.contact?.whatsappNumber && (
            <p className="flex justify-between items-center"><span className="font-semibold text-gray-800">WhatsApp:</span> <span className="text-green-600 font-medium">{inquiry.contact?.whatsappNumber}</span></p>
        )}
        <p className="flex justify-between items-center"><span className="font-semibold text-gray-800">Standard:</span> <span className="text-[#2C3E50] font-bold">{inquiry.standard}</span></p>
      </div>
      <Link
        to={`/inquiries/${inquiry._id}`}
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md"
      >
        <FaEye /> View Details
      </Link>
    </div>
  );
};

export default InquiryCard;
