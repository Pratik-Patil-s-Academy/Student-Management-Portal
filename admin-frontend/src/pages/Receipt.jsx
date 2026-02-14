import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentFeeDetails } from '../services/feeService';
import { getStudentById } from '../services/studentService';
import { FaArrowLeft, FaPrint, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Receipt = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  
  const [student, setStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
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
        throw new Error('No fee details found');
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      toast.error('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    if (num < 1000) return convertLessThanThousand(num);
    if (num < 100000) {
      return convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertLessThanThousand(num % 1000) : '');
    }
    if (num < 10000000) {
      return convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    }
    return convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading receipt...</p>
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

  if (!student || !feeDetails || !feeDetails.hasPayments) return (
    <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">
      No receipt data available.
      <button 
        onClick={() => navigate(`/fees/student/${studentId}`)}
        className="block mx-auto mt-4 px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E]"
      >
        Back to Fee Details
      </button>
    </div>
  );

  const totalFees = (feeDetails.receipt?.totalAmount || 0) + (feeDetails.receipt?.remainingAmount || 0);

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-md no-print">
          <button 
            onClick={() => navigate(`/fees/student/${studentId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-all duration-200 font-medium hover:gap-3 group"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" /> 
            <span>Back to Fee Details</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors"
          >
            <FaPrint />
            Print Receipt
          </button>
        </div>

        <div ref={receiptRef} className="bg-white rounded-xl shadow-md overflow-hidden print-section">
          <div className="bg-[#2C3E50] text-white p-6 text-center">
            <h1 className="text-2xl font-bold">Pratik Patil's Maths Academy</h1>
            <p className="text-sm mt-1 opacity-90">Rajarampuri, Kolhapur</p>
            <p className="text-sm opacity-90">Contact: 7741814181</p>
          </div>

          <div className="p-6 border-b">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">FEE RECEIPT</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Receipt No:</span>
                <span className="font-mono font-semibold ml-2">{feeDetails.receipt?.receiptNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold ml-2">{formatDate(feeDetails.receipt?.receiptDate)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="text-gray-600">Name:</span> <span className="font-semibold">{student.personalDetails?.fullName}</span></p>
                <p><span className="text-gray-600">Roll No:</span> <span className="font-semibold">{student.rollno || 'N/A'}</span></p>
              </div>
              <div>
                <p><span className="text-gray-600">Standard:</span> <span className="font-semibold">{student.standard}</span></p>
                <p><span className="text-gray-600">Contact:</span> <span className="font-semibold">{student.contact?.parentMobile || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Payment Details</h3>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold text-gray-700">Installment</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Mode</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {feeDetails.payments.map((payment, index) => (
                  <tr key={payment._id} className="border-b border-gray-200">
                    <td className="py-2">Installment {payment.paymentNumber}</td>
                    <td className="py-2">{formatDate(payment.paymentDate)}</td>
                    <td className="py-2">{payment.paymentMode}</td>
                    <td className="py-2 text-right">₹{payment.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Fees:</span>
                <span className="font-semibold">₹{totalFees}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-semibold text-green-600">₹{feeDetails.totalPaid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold text-orange-600">₹{feeDetails.receipt?.remainingAmount || 0}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Amount in Words:</span> {numberToWords(feeDetails.totalPaid)} Rupees Only
              </p>
            </div>
          </div>

          <div className="p-6 border-t">
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-500">
                <p>This is a computer generated receipt.</p>
                <p>Thank you for your payment.</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-40 pt-2">
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;