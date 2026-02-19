import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudentFeeDetails, sendInstallmentEmail, sendAllInstallmentEmails } from '../services/feeService';
import { getStudentById } from '../services/studentService';
import { FaArrowLeft, FaMoneyBillWave, FaPlus, FaEnvelope, FaReceipt, FaCalendarAlt, FaCreditCard, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FeeDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentResponse, feeResponse] = await Promise.allSettled([
        getStudentById(studentId),
        getStudentFeeDetails(studentId)
      ]);

      if (studentResponse.status === 'fulfilled' && studentResponse.value.success) {
        setStudent(studentResponse.value.student);
      } else {
        throw new Error('Failed to fetch student details');
      }

      if (feeResponse.status === 'fulfilled' && feeResponse.value.success) {
        setFeeDetails(feeResponse.value.feeDetails);
      } else {
        setFeeDetails({
          hasPayments: false,
          totalPaid: 0,
          payments: [],
          receipt: null
        });
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      toast.error('Failed to load fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (installmentId) => {
    setEmailLoading(true);
    try {
      const result = await sendInstallmentEmail(installmentId);
      if (result.success) {
        toast.success('Receipt email sent successfully');
      } else {
        toast.error('Failed to send email: ' + result.message);
      }
    } catch (err) {
      toast.error('Failed to send email: ' + err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendAllEmails = async () => {
    setEmailLoading(true);
    try {
      const result = await sendAllInstallmentEmails(studentId);
      if (result.success) {
        const successCount = result.results.filter(r => r.success).length;
        toast.success(`${successCount} emails sent successfully`);
      } else {
        toast.error('Failed to send emails');
      }
    } catch (err) {
      toast.error('Failed to send emails: ' + err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading fee details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
      <button
        onClick={() => navigate('/fees')}
        className="block mx-auto mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Back to Fee Management
      </button>
    </div>
  );

  if (!student) return (
    <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">
      Student not found.
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'Cash': return '💵';
      case 'Online': return '💳';
      case 'UPI': return '📱';
      case 'Card': return '💳';
      case 'Bank Transfer': return '🏦';
      default: return '💰';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <button
          onClick={() => navigate('/fees')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-all duration-200 font-medium hover:gap-3 group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Fee Management</span>
        </button>

        <div className="flex items-center gap-4">
          {feeDetails.hasPayments && student.contact?.email && (
            <button
              onClick={handleSendAllEmails}
              disabled={emailLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200 disabled:opacity-50"
            >
              <FaEnvelope />
              {emailLoading ? 'Sending...' : 'Send All Receipts'}
            </button>
          )}

          {student.contact?.email ? (
            <button
              onClick={() => navigate(`/fees/payment/${studentId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg border border-green-200 hover:border-green-600 transition-all duration-200"
            >
              <FaPlus />
              Add Payment
            </button>
          ) : (
            <Link
              to={`/students/${studentId}?edit=true`}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg font-semibold hover:bg-amber-100 transition-colors"
            >
              <FaExclamationTriangle />
              Add Email First
            </Link>
          )}
        </div>
      </div>

      {/* ── No-email warning banner ───────────────────────────────────── */}
      {!student.contact?.email && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4">
          <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Email address missing</p>
            <p className="text-sm text-amber-700 mt-0.5">
              A parent email is required to process fee payments and send receipts.
              Please update the student profile before continuing.
            </p>
          </div>
          <Link
            to={`/students/${studentId}?edit=true`}
            className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Update Profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
            <div className="text-center mb-6">
              {student.personalDetails?.photoUrl ? (
                <img
                  src={student.personalDetails.photoUrl}
                  alt="Student"
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-[#2C3E50]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto bg-[#2C3E50] flex items-center justify-center text-white text-3xl font-bold">
                  {student.personalDetails?.fullName?.charAt(0) || 'S'}
                </div>
              )}
              <h3 className="text-xl font-semibold mt-4 text-gray-800">
                {student.personalDetails?.fullName}
              </h3>
              <p className="text-gray-600">Roll No: {student.rollno || 'N/A'}</p>
              <p className="text-gray-600">Standard: {student.standard}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{student.contact?.parentMobile || 'N/A'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-xs">{student.contact?.email || 'No email'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{student.personalDetails?.gender || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className={`text-2xl font-bold ${feeDetails.receipt?.feeStatus === 'Paid' ? 'text-green-600' :
                feeDetails.receipt?.feeStatus === 'Pending' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                {feeDetails.receipt?.feeStatus || 'No Fees'}
              </div>
              <div className="text-sm text-gray-600">Fee Status</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-2xl font-bold text-green-600">₹{feeDetails.totalPaid || 0}</div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹{feeDetails.receipt?.remainingAmount || 0}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-2xl font-bold text-blue-600">
                {feeDetails.payments?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Installments</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{(feeDetails.totalPaid || 0) + (feeDetails.receipt?.remainingAmount || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Fees</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaMoneyBillWave className="text-[#2C3E50] text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
              </div>
            </div>

            {!feeDetails.hasPayments ? (
              <div className="p-12 text-center text-gray-500">
                <FaMoneyBillWave className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <div className="text-lg font-medium mb-2">No payments yet</div>
                <div className="text-sm mb-4">This student hasn't made any fee payments</div>
                <button
                  onClick={() => navigate(`/fees/payment/${studentId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors"
                >
                  <FaPlus />
                  Make First Payment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Installment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeDetails.payments.map((payment, index) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#2C3E50] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {payment.paymentNumber}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                Installment {payment.paymentNumber}
                              </div>
                              {payment.remarks && (
                                <div className="text-sm text-gray-500">{payment.remarks}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">₹{payment.amount}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getPaymentModeIcon(payment.paymentMode)}</span>
                            <div>
                              <div className="text-sm text-gray-900">{payment.paymentMode}</div>
                              {payment.transactionId && (
                                <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            {formatDate(payment.paymentDate)}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {payment.installmentReceiptNumber}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {student.contact?.email ? (
                            <button
                              onClick={() => handleSendEmail(payment._id)}
                              disabled={emailLoading}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-600 disabled:opacity-50"
                            >
                              <FaEnvelope />
                              Send Receipt
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">No email</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {feeDetails.receipt && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <FaReceipt className="text-[#2C3E50] text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">Receipt Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt Number:</span>
                    <span className="font-mono font-medium">{feeDetails.receipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt Date:</span>
                    <span className="font-medium">{formatDate(feeDetails.receipt.receiptDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">₹{feeDetails.receipt.totalAmount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Amount:</span>
                    <span className="font-medium text-orange-600">₹{feeDetails.receipt.remainingAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-medium">{feeDetails.receipt.paymentMode}</span>
                  </div>
                  {feeDetails.receipt.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono font-medium">{feeDetails.receipt.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeDetail;