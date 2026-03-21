import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaPlusCircle, FaReceipt, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

const FeeTable = ({
  students,
  getFeeStatus,
  getStatusColor,
  getStructureForStandard
}) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No / Standard</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Structure</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-medium">No students found</div>
                <div className="text-sm">Try adjusting your search or filters</div>
              </td>
            </tr>
          ) : (
            students.map((student) => {
              const feeStatus = getFeeStatus(student);
              const statusColor = getStatusColor(feeStatus);
              const structure = getStructureForStandard(student.standard);

              return (
                <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.personalDetails?.photoUrl ? (
                          <img className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" src={student.personalDetails.photoUrl} alt="Profile" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#2C3E50] flex items-center justify-center text-white font-semibold">
                            {student.personalDetails?.fullName?.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.personalDetails?.fullName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{student.personalDetails?.gender || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{student.rollno || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Standard {student.standard}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{student.contact?.parentMobile || 'N/A'}</div>
                    {student.contact?.email ? (
                      <div className="text-gray-500 text-xs">{student.contact.email}</div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mt-0.5">
                        <FaExclamationTriangle />
                        No email — update profile
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {structure ? (
                      <span className="font-semibold text-green-700">₹{structure.totalFee.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                      {feeStatus}
                    </span>
                    {student.feeInfo?.hasPayments && (
                      <div className="mt-1 text-xs text-gray-500">
                        <div>Paid: ₹{student.feeInfo.totalPaid?.toLocaleString('en-IN')}</div>
                        {student.feeInfo.remainingAmount > 0 && (
                          <div className="text-orange-600">Due: ₹{student.feeInfo.remainingAmount?.toLocaleString('en-IN')}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link to={`/fees/student/${student._id}`} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-200 hover:border-blue-600">
                        <FaEye /> View
                      </Link>
                      {student.contact?.email ? (
                        <>
                          {feeStatus.toLowerCase() === 'paid' ? (
                            <button disabled className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 cursor-not-allowed">
                              <FaPlusCircle /> Pay
                            </button>
                          ) : (
                            <Link to={`/fees/payment/${student._id}`} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all border border-green-200 hover:border-green-600">
                              <FaPlusCircle /> Pay
                            </Link>
                          )}
                          <Link to={`/fees/receipt/${student._id}`} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-all border border-purple-200 hover:border-purple-600">
                            <FaReceipt /> Receipt
                          </Link>
                        </>
                      ) : (
                        <Link
                          to={`/students/${student._id}?edit=true`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                        >
                          <FaExclamationTriangle /> Add Email
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeeTable;
