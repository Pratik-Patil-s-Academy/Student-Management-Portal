import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa';

const InquiryTable = ({
  inquiries,
  getStatusColor
}) => {
  return (
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
          {inquiries.map((inquiry) => (
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
          {inquiries.length === 0 && (
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
  );
};

export default InquiryTable;
