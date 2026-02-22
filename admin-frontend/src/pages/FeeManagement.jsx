import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudentsWithFees, getFeeStructures, upsertFeeStructure } from '../services/feeService';
import { FaSearch, FaEye, FaMoneyBillWave, FaFilter, FaPlusCircle, FaReceipt, FaCog, FaTimes, FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const FEE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const STANDARDS = ['11', '12', 'Others'];


const FeeManagement = () => {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fee structure modal
  const [structureModal, setStructureModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [structureForm, setStructureForm] = useState({ standard: '11', totalFee: '', description: '', academicYear: '' });
  const [savingStructure, setSavingStructure] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const standardFilter = searchParams.get('standard') || '';

  useEffect(() => {
    fetchData();
    fetchStructures();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllStudentsWithFees();
      if (data.success) setStudents(data.students);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      toast.error('Failed to fetch students data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const data = await getFeeStructures();
      if (data.success) setFeeStructures(data.structures);
    } catch { /* non-critical */ }
  };

  const getStructureForStandard = (std) => feeStructures.find(s => s.standard === std);

  const openStructureModal = (standard) => {
    const existing = getStructureForStandard(standard);
    setEditingStandard(standard);
    setStructureForm({
      standard,
      totalFee: existing?.totalFee || '',
      description: existing?.description || '',
      academicYear: existing?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    });
    setStructureModal(true);
  };

  const handleSaveStructure = async () => {
    if (!structureForm.totalFee || parseFloat(structureForm.totalFee) <= 0) {
      toast.error('Please enter a valid fee amount');
      return;
    }
    setSavingStructure(true);
    try {
      const res = await upsertFeeStructure({
        standard: structureForm.standard,
        totalFee: parseFloat(structureForm.totalFee),
        description: structureForm.description,
        academicYear: structureForm.academicYear
      });
      if (res.success) {
        toast.success(res.message);
        setStructureModal(false);
        fetchStructures();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save fee structure');
    } finally {
      setSavingStructure(false);
    }
  };

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) newParams.set(key, value);
      else newParams.delete(key);
      return newParams;
    });
  };

  const filteredStudents = students.filter(student => {
    if (searchTerm && !student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !student.rollno?.toString().includes(searchTerm)) return false;
    if (standardFilter && student.standard !== standardFilter) return false;
    if (statusFilter) {
      const status = student.feeInfo?.feeStatus?.toLowerCase() || 'pending';
      if (statusFilter === 'paid' && status !== 'paid') return false;
      if (statusFilter === 'pending' && status !== 'pending') return false;
      if (statusFilter === 'partial' && status !== 'partially paid') return false;
    }
    return true;
  });

  const getFeeStatus = (student) => student.feeInfo?.feeStatus || 'Pending';

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially paid': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaMoneyBillWave className="text-[#2C3E50]" />
            Fee Management
          </h1>
          <p className="text-gray-600 mt-1">Manage student fee payments and track payment history</p>
        </div>
      </div>

      {/* ── Fee Structure Settings ──────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-xl shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FaCog className="text-[#2C3E50]" />
          <h2 className="text-lg font-bold text-gray-800">Fee Structure</h2>
          <span className="text-xs text-gray-400 ml-1">(Fixed fee per standard — auto-applied on first payment)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STANDARDS.map(std => {
            const structure = getStructureForStandard(std);
            return (
              <div key={std} className={`border-2 rounded-xl p-4 flex items-center justify-between transition-all ${structure ? 'border-green-200 bg-green-50' : 'border-dashed border-gray-200 bg-gray-50'}`}>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Standard {std}</div>
                  {structure ? (
                    <>
                      <div className="text-2xl font-bold text-green-700">₹{structure.totalFee.toLocaleString('en-IN')}</div>
                      {structure.academicYear && <div className="text-xs text-gray-500 mt-0.5">{structure.academicYear}</div>}
                      {structure.description && <div className="text-xs text-gray-400 mt-0.5 italic">{structure.description}</div>}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">Not set</div>
                  )}
                </div>
                <button
                  onClick={() => openStructureModal(std)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <FaEdit /> {structure ? 'Edit' : 'Set'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-1 lg:col-span-2 md:w-auto">
            <select
              value={standardFilter}
              onChange={(e) => updateFilter('standard', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent text-sm"
            >
              <option value="">All Standards</option>
              <option value="11">Standard 11</option>
              <option value="12">Standard 12</option>
              <option value="Others">Others</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-lg font-medium">No students found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
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
      </div>

      {/* Charts Section */}
      {filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Status Donut */}
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" /> Fee Status Breakdown
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: filteredStudents.filter(s => getFeeStatus(s) === 'Paid').length },
                      { name: 'Partially Paid', value: filteredStudents.filter(s => getFeeStatus(s) === 'Partially Paid').length },
                      { name: 'Pending', value: filteredStudents.filter(s => getFeeStatus(s) === 'Pending').length },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {FEE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 min-w-[140px]">
                {[
                  { label: 'Paid', color: FEE_COLORS[0], count: filteredStudents.filter(s => getFeeStatus(s) === 'Paid').length },
                  { label: 'Partially Paid', color: FEE_COLORS[1], count: filteredStudents.filter(s => getFeeStatus(s) === 'Partially Paid').length },
                  { label: 'Pending', color: FEE_COLORS[2], count: filteredStudents.filter(s => getFeeStatus(s) === 'Pending').length },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-sm text-gray-600">{d.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{d.count}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-sm font-bold text-gray-800">{filteredStudents.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Standard Bar Chart */}
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaFilter className="text-blue-500" /> Fee Collection by Standard
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={['11', '12', 'Others'].map(std => {
                  const stdStudents = filteredStudents.filter(s => s.standard === std);
                  const collected = stdStudents.reduce((sum, s) => sum + (s.feeInfo?.totalPaid || 0), 0);
                  const outstanding = stdStudents.reduce((sum, s) => sum + (s.feeInfo?.remainingAmount || 0), 0);
                  return { std: `Std ${std}`, collected, outstanding };
                })}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="std" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip formatter={(v, n) => [`₹${v.toLocaleString('en-IN')}`, n === 'collected' ? 'Collected' : 'Outstanding']} />
                <Legend formatter={n => n === 'collected' ? 'Collected' : 'Outstanding'} />
                <Bar dataKey="collected" name="collected" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outstanding" name="outstanding" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      {/* ── Fee Structure Modal ─────────────────────────────────────────────── */}
      {structureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#2C3E50]">
                Set Fee — Standard {editingStandard}
              </h2>
              <button onClick={() => setStructureModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Total Fee Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={structureForm.totalFee}
                    onChange={e => setStructureForm(p => ({ ...p, totalFee: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent text-lg font-semibold"
                    placeholder="e.g. 15000"
                    min="1"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">This will be auto-applied when recording the first payment for any Standard {editingStandard} student.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={structureForm.academicYear}
                  onChange={e => setStructureForm(p => ({ ...p, academicYear: e.target.value }))}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="e.g. 2025-2026"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={structureForm.description}
                  onChange={e => setStructureForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="e.g. Annual tuition fee"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setStructureModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStructure}
                disabled={savingStructure}
                className="flex-1 px-4 py-2.5 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {savingStructure ? 'Saving...' : 'Save Fee Structure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;