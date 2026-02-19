import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudentFeeDetails, makeFeePayment } from '../services/feeService';
import { getStudentById } from '../services/studentService';
import { FaArrowLeft, FaMoneyBillWave, FaSave, FaUser, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProcessPayment = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    totalAmount: '',
    amount: '',
    paymentMode: 'Cash',
    transactionId: '',
    remarks: ''
  });

  const paymentModes = ['Cash', 'Online', 'UPI', 'Card', 'Bank Transfer'];

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

        if (feeResponse.value.feeDetails.hasPayments && feeResponse.value.feeDetails.receipt) {
          setFormData(prev => ({
            ...prev,
            totalAmount: feeResponse.value.feeDetails.receipt.totalAmount + feeResponse.value.feeDetails.receipt.remainingAmount
          }));
        } else if (!feeResponse.value.feeDetails.hasPayments && feeResponse.value.feeDetails.feeStructure) {
          // Auto-fill from fee structure on first payment
          setFormData(prev => ({
            ...prev,
            totalAmount: feeResponse.value.feeDetails.feeStructure.totalFee
          }));
        }
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
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    // Hard block if no email
    if (!student.contact?.email) {
      toast.error('Cannot process payment — update student email first.');
      return;
    }

    if (!feeDetails.hasPayments && (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0)) {
      toast.error('Please enter total fees amount');
      return;
    }

    if (!feeDetails.hasPayments && parseFloat(formData.amount) > parseFloat(formData.totalAmount)) {
      toast.error('Payment amount cannot exceed total fees');
      return;
    }

    if (feeDetails.hasPayments && feeDetails.receipt) {
      if (parseFloat(formData.amount) > feeDetails.receipt.remainingAmount) {
        toast.error('Payment amount cannot exceed remaining amount');
        return;
      }
    }

    setSubmitting(true);
    try {
      const paymentData = {
        studentId,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId || undefined,
        remarks: formData.remarks || undefined
      };

      if (!feeDetails.hasPayments) {
        paymentData.totalFees = parseFloat(formData.totalAmount);
      }

      const result = await makeFeePayment(paymentData);

      if (result.success) {
        toast.success('Payment recorded successfully!');
        if (result.emailSent) {
          toast.success('Receipt email sent to parent');
        }
        navigate(`/fees/student/${studentId}`);
      } else {
        toast.error('Failed to process payment: ' + result.message);
      }
    } catch (err) {
      toast.error('Failed to process payment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
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

  const isFirstPayment = !feeDetails.hasPayments;
  const remainingAmount = feeDetails.receipt?.remainingAmount || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-md">
        <button
          onClick={() => navigate(`/fees/student/${studentId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-all duration-200 font-medium hover:gap-3 group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Fee Details</span>
        </button>

        <div className="flex items-center gap-3">
          <FaMoneyBillWave className="text-[#2C3E50] text-2xl" />
          <h1 className="text-2xl font-bold text-[#2C3E50]">
            {isFirstPayment ? 'First Payment' : 'Add Payment'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-center mb-6">
              {student.personalDetails?.photoUrl ? (
                <img
                  src={student.personalDetails.photoUrl}
                  alt="Student"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-[#2C3E50]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto bg-[#2C3E50] flex items-center justify-center text-white text-2xl font-bold">
                  {student.personalDetails?.fullName?.charAt(0) || 'S'}
                </div>
              )}
              <h3 className="text-lg font-semibold mt-4 text-gray-800">
                {student.personalDetails?.fullName}
              </h3>
              <p className="text-gray-600">Roll No: {student.rollno || 'N/A'}</p>
              <p className="text-gray-600">Standard: {student.standard}</p>
            </div>

            {!isFirstPayment && feeDetails.receipt && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Fee Summary</h4>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fees:</span>
                  <span className="font-semibold">₹{feeDetails.receipt.totalAmount + feeDetails.receipt.remainingAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">₹{feeDetails.totalPaid}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-orange-600">₹{remainingAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Installments:</span>
                  <span className="font-semibold">{feeDetails.payments?.length || 0}</span>
                </div>
              </div>
            )}

            {isFirstPayment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <div className="font-semibold mb-1">First Payment</div>
                <p>This is the first payment for this student. Please enter the total fees amount.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaMoneyBillWave className="text-[#2C3E50]" />
              Payment Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isFirstPayment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Fees Amount <span className="text-red-500">*</span>
                  </label>
                  {feeDetails?.feeStructure && (
                    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                      <span className="font-semibold">Auto-filled from fee structure:</span>
                      ₹{feeDetails.feeStructure.totalFee.toLocaleString('en-IN')}
                      {feeDetails.feeStructure.academicYear && <span className="text-blue-500">({feeDetails.feeStructure.academicYear})</span>}
                    </div>
                  )}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="Enter total fees"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {feeDetails?.feeStructure ? 'Auto-filled from fee structure. You can override if needed.' : 'Total fees for the entire course/year'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="1"
                    max={isFirstPayment ? formData.totalAmount : remainingAmount}
                    placeholder={isFirstPayment ? "Enter payment amount" : `Max: ₹${remainingAmount}`}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all"
                  />
                </div>
                {!isFirstPayment && (
                  <p className="text-xs text-gray-500 mt-1">Maximum: ₹{remainingAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {paymentModes.map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMode: mode }))}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.paymentMode === mode
                        ? 'bg-[#2C3E50] text-white border-[#2C3E50]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#2C3E50]'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {formData.paymentMode !== 'Cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    placeholder="Enter transaction ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add any notes about this payment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Email status banner */}
              {student.contact?.email ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-700">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold">Email Receipt</div>
                    <p>A receipt will be automatically sent to <span className="font-mono">{student.contact.email}</span></p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800">Email address missing — payment blocked</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      A parent email is required to send the fee receipt. Update the student profile before processing a payment.
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

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/fees/student/${studentId}`)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !student.contact?.email}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
                    ${!student.contact?.email
                      ? 'bg-amber-100 text-amber-600 border border-amber-300 cursor-not-allowed'
                      : 'bg-[#2C3E50] text-white hover:bg-[#34495E] disabled:opacity-50'
                    }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : !student.contact?.email ? (
                    <><FaExclamationTriangle /> Email Required</>
                  ) : (
                    <><FaSave /> Record Payment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessPayment;