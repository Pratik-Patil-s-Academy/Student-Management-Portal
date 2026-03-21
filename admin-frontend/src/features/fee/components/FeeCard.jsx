import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaPlusCircle, FaReceipt, FaExclamationTriangle } from 'react-icons/fa';

const FeeCard = ({
  student,
  feeStatus,
  statusColor
}) => {
  return (
    <div className="p-4 bg-white mb-2 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0">
            {student.personalDetails?.photoUrl ? (
              <img className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 shadow-sm" src={student.personalDetails.photoUrl} alt="" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-[#2C3E50] flex items-center justify-center text-white font-bold text-lg">
                {student.personalDetails?.fullName?.charAt(0) || 'S'}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{student.personalDetails?.fullName || 'N/A'}</div>
            <div className="text-xs text-gray-500">Roll: {student.rollno || 'N/A'} • Std {student.standard}</div>
          </div>
        </div>
        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${statusColor}`}>
          {feeStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link
          to={`/fees/student/${student._id}`}
          className="flex flex-col items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 active:scale-95 transition-all"
        >
          <FaEye className="text-lg" />
          <span className="text-[10px] font-bold">View</span>
        </Link>

        {student.contact?.email ? (
          <>
            {feeStatus.toLowerCase() === 'paid' ? (
              <button
                disabled
                className="flex flex-col items-center justify-center gap-1 py-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-200 cursor-not-allowed"
              >
                <FaPlusCircle className="text-lg" />
                <span className="text-[10px] font-bold">Pay</span>
              </button>
            ) : (
              <Link
                to={`/fees/payment/${student._id}`}
                className="flex flex-col items-center justify-center gap-1 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 active:scale-95 transition-all"
              >
                <FaPlusCircle className="text-lg" />
                <span className="text-[10px] font-bold">Pay</span>
              </Link>
            )}
            <Link
              to={`/fees/receipt/${student._id}`}
              className="flex flex-col items-center justify-center gap-1 py-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 active:scale-95 transition-all"
            >
              <FaReceipt className="text-lg" />
              <span className="text-[10px] font-bold">Receipt</span>
            </Link>
          </>
        ) : (
          <Link
            to={`/students/${student._id}?edit=true`}
            className="col-span-2 flex items-center justify-center gap-2 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 active:scale-95 transition-all"
          >
            <FaExclamationTriangle />
            <span className="text-[10px] font-bold uppercase">Update Email for Payments</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default FeeCard;
