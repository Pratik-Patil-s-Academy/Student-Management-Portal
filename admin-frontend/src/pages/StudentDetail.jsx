import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getStudentById, updateStudent, deleteStudent, assignBatch } from '../services/studentService';
import { getAllBatches } from '../services/batchService';
import { getStudentFeeDetails } from '../services/feeService';
import { getStudentTestHistory } from '../services/testService';
import { getAttendanceByStudent, getStudentAttendanceStats } from '../services/attendanceService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaArrowLeft, FaUserGraduate, FaEdit, FaSave, FaTimes, FaTrash,
  FaIdCard, FaUsers, FaMoneyBillWave, FaClipboardList, FaCalendarCheck,
  FaGraduationCap, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FaIdCard },
  { id: 'batch', label: 'Batch', icon: FaUsers },
  { id: 'fees', label: 'Fee History', icon: FaMoneyBillWave },
  { id: 'tests', label: 'Test Scores', icon: FaClipboardList },
  { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
];

const PIE_COLORS = ['#22c55e', '#ef4444'];

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Batch modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [assigningBatch, setAssigningBatch] = useState(false);

  // Fee data
  const [feeData, setFeeData] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  // Test data
  const [testHistory, setTestHistory] = useState([]);
  const [testLoading, setTestLoading] = useState(false);

  // Attendance data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => { fetchStudent(); }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await getStudentById(id);
      if (data.success) {
        setStudent(data.student);
        initFormData(data.student);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  };

  const initFormData = (s) => setFormData({
    fullName: s.personalDetails?.fullName || '',
    address: s.personalDetails?.address || '',
    dob: s.personalDetails?.dob ? s.personalDetails.dob.split('T')[0] : '',
    gender: s.personalDetails?.gender || '',
    caste: s.personalDetails?.caste || '',
    fatherName: s.parents?.father?.name || '',
    fatherOccupation: s.parents?.father?.occupation || '',
    motherName: s.parents?.mother?.name || '',
    motherOccupation: s.parents?.mother?.occupation || '',
    parentMobile: s.contact?.parentMobile || '',
    studentMobile: s.contact?.studentMobile || '',
    email: s.contact?.email || '',
    standard: s.standard || '',
    rollno: s.rollno || '',
    status: s.status || 'Admitted',
    sscSchoolName: s.academics?.ssc?.schoolName || '',
    sscPercentageOrCGPA: s.academics?.ssc?.percentageOrCGPA || '',
    hscCollegeName: s.academics?.hsc?.collegeName || '',
    hscPercentageOrCGPA: s.academics?.hsc?.percentageOrCGPA || '',
  });

  // Lazy-load tab data
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'fees' && !feeData && !feeLoading) {
      setFeeLoading(true);
      try {
        const res = await getStudentFeeDetails(id);
        if (res.success) setFeeData(res);
      } catch { /* no fee record yet */ }
      finally { setFeeLoading(false); }
    }
    if (tab === 'tests' && testHistory.length === 0 && !testLoading) {
      setTestLoading(true);
      try {
        const res = await getStudentTestHistory(id);
        if (res.success) setTestHistory(res.tests || []);
      } catch { }
      finally { setTestLoading(false); }
    }
    if (tab === 'attendance' && attendanceRecords.length === 0 && !attendanceLoading) {
      setAttendanceLoading(true);
      try {
        const [recRes, statsRes] = await Promise.all([
          getAttendanceByStudent(id),
          getStudentAttendanceStats(id),
        ]);
        if (recRes.success) setAttendanceRecords(recRes.attendance || []);
        if (statsRes.success) setAttendanceStats(statsRes.stats);
      } catch { }
      finally { setAttendanceLoading(false); }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!window.confirm('Save changes?')) return;
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => {
        if (formData[k] !== null && formData[k] !== undefined) data.append(k, formData[k]);
      });
      if (photoFile) data.append('file', photoFile);
      const result = await updateStudent(id, data);
      if (result.success) {
        setStudent(result.student);
        initFormData(result.student);
        setIsEditing(false);
        setPhotoFile(null);
        toast.success('Student updated!');
      }
    } catch (err) {
      toast.error('Update failed: ' + (err.message || 'Unknown error'));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('DELETE this student? This cannot be undone.')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted.');
      navigate('/students');
    } catch (err) { toast.error(err.message); }
  };

  const handleOpenBatchModal = async () => {
    try {
      const data = await getAllBatches();
      if (data.success) { setAvailableBatches(data.batches || []); setShowBatchModal(true); }
    } catch (err) { toast.error(err.message); }
  };

  const handleAssignBatch = async () => {
    if (!selectedBatchId) { toast.error('Select a batch'); return; }
    if (!window.confirm('Assign this batch?')) return;
    setAssigningBatch(true);
    try {
      const result = await assignBatch(id, selectedBatchId);
      if (result.success) {
        const assignedBatch = availableBatches.find(b => b._id === selectedBatchId);
        const updatedStudent = result.student;
        if (assignedBatch && (!updatedStudent.batch || !updatedStudent.batch.name)) {
          updatedStudent.batch = assignedBatch;
        }
        setStudent(updatedStudent);
        setShowBatchModal(false);
        setSelectedBatchId('');
        toast.success('Batch assigned!');
      }
    } catch (err) { toast.error(err.message); }
    finally { setAssigningBatch(false); }
  };

  // ── Derived chart data ──────────────────────────────────────────────────────

  const testChartData = testHistory.map(t => ({
    name: t.title?.length > 14 ? t.title.slice(0, 14) + '…' : t.title,
    score: t.attendanceStatus !== 'Absent' ? t.marksObtained : null,
    max: t.maxMarks,
    pct: t.attendanceStatus !== 'Absent' && t.marksObtained != null
      ? Math.round((t.marksObtained / t.maxMarks) * 100)
      : null,
    date: t.testDate ? new Date(t.testDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
  })).filter(d => d.score !== null);

  const attendancePieData = attendanceStats
    ? [
        { name: 'Present', value: attendanceStats.totalPresent },
        { name: 'Absent', value: attendanceStats.totalAbsent },
      ]
    : [];

  // Last 30 attendance records for bar chart
  const attendanceBarData = [...attendanceRecords]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      Present: r.status === 'Present' ? 1 : 0,
      Absent: r.status === 'Absent' ? 1 : 0,
    }));

  const installments = feeData?.installments || [];
  const receipt = feeData?.feeReceipt;

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
  if (!student) return <div className="p-8 text-center text-gray-500">Student not found.</div>;

  const pd = student.personalDetails || {};

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-fadeIn">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-md">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] font-medium transition-all group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Students
        </button>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-lg transition-all text-sm">
                <FaTrash /> Delete
              </button>
              <button onClick={() => { setActiveTab('profile'); setIsEditing(true); }} className="flex items-center gap-2 px-5 py-2 bg-[#2C3E50] text-white hover:bg-[#34495E] font-semibold rounded-lg transition-all shadow text-sm">
                <FaEdit /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setIsEditing(false); initFormData(student); setPhotoFile(null); }} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold rounded-lg transition-all text-sm">
                <FaTimes /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-lg transition-all shadow text-sm disabled:opacity-50">
                {saving ? 'Saving…' : <><FaSave /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Hero Card ───────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#2C3E50] to-[#3d5a73] rounded-2xl shadow-lg p-6 text-white flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {pd.photoUrl ? (
            <img src={pd.photoUrl} alt="Student" className="w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              <FaUserGraduate className="text-4xl text-white/80" />
            </div>
          )}
          {isEditing && (
            <label className="absolute bottom-0 right-0 cursor-pointer bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 shadow">
              <FaEdit className="text-xs" />
              <input type="file" className="hidden" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
            </label>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{pd.fullName || 'No Name'}</h1>
          <div className="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">Standard {student.standard || 'N/A'}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Roll #{student.rollno || 'N/A'}</span>
            <span className={`px-3 py-1 rounded-full font-semibold ${student.status === 'Admitted' ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
              {student.status}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Batch: {student.batch?.name || 'Unassigned'}
            </span>
          </div>
        </div>
        {!student.batch?.name && (
          <button onClick={handleOpenBatchModal} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all text-sm border border-white/30">
            <FaUsers /> Assign Batch
          </button>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#2C3E50] text-[#2C3E50] bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="text-base" /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">

          {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2"><FaIdCard /> Personal</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Date of Birth', name: 'dob', type: 'date', val: pd.dob ? new Date(pd.dob).toLocaleDateString() : 'N/A' },
                      { label: 'Gender', name: 'gender', type: 'select', opts: ['Male', 'Female', 'Other'], val: pd.gender || 'N/A' },
                      { label: 'Caste', name: 'caste', val: pd.caste || 'N/A' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
                        {isEditing ? (
                          f.type === 'select'
                            ? <select name={f.name} value={formData[f.name]} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm">{f.opts.map(o => <option key={o}>{o}</option>)}</select>
                            : <input type={f.type || 'text'} name={f.name} value={formData[f.name]} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                        ) : <span className="font-medium text-gray-800">{f.val}</span>}
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-gray-500 block mb-0.5">Address</label>
                      {isEditing
                        ? <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" rows="2" />
                        : <span className="font-medium text-gray-800">{pd.address || 'N/A'}</span>}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-[#2C3E50] mb-4">Contact</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Student Mobile', name: 'studentMobile', val: student.contact?.studentMobile },
                      { label: 'Parent Mobile', name: 'parentMobile', val: student.contact?.parentMobile },
                      { label: 'Email', name: 'email', val: student.contact?.email },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
                        {isEditing
                          ? <input name={f.name} value={formData[f.name]} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                          : <span className="font-medium text-gray-800">{f.val || 'N/A'}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parents */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <h3 className="font-bold text-blue-800 mb-4">Father</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Name', name: 'fatherName', val: student.parents?.father?.name },
                      { label: 'Occupation', name: 'fatherOccupation', val: student.parents?.father?.occupation },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs text-blue-600 block mb-0.5">{f.label}</label>
                        {isEditing
                          ? <input name={f.name} value={formData[f.name]} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                          : <span className="font-medium text-gray-800">{f.val || 'N/A'}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-pink-50 rounded-xl p-5">
                  <h3 className="font-bold text-pink-800 mb-4">Mother</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Name', name: 'motherName', val: student.parents?.mother?.name },
                      { label: 'Occupation', name: 'motherOccupation', val: student.parents?.mother?.occupation },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs text-pink-600 block mb-0.5">{f.label}</label>
                        {isEditing
                          ? <input name={f.name} value={formData[f.name]} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                          : <span className="font-medium text-gray-800">{f.val || 'N/A'}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academics */}
                <div className="bg-gray-50 rounded-xl p-5 md:col-span-2">
                  <h3 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2"><FaGraduationCap /> Previous Academics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">SSC (10th)</p>
                      {isEditing ? (
                        <div className="space-y-1">
                          <input name="sscSchoolName" placeholder="School" value={formData.sscSchoolName} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                          <input name="sscPercentageOrCGPA" placeholder="%" value={formData.sscPercentageOrCGPA} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600">{student.academics?.ssc?.schoolName || '-'}</p>
                          <p className="text-blue-600 font-bold">{student.academics?.ssc?.percentageOrCGPA ? `${student.academics.ssc.percentageOrCGPA}%` : '-'}</p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">HSC (12th)</p>
                      {isEditing ? (
                        <div className="space-y-1">
                          <input name="hscCollegeName" placeholder="College" value={formData.hscCollegeName} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                          <input name="hscPercentageOrCGPA" placeholder="%" value={formData.hscPercentageOrCGPA} onChange={handleChange} className="w-full border rounded-lg p-1.5 text-sm" />
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600">{student.academics?.hsc?.collegeName || '-'}</p>
                          <p className="text-blue-600 font-bold">{student.academics?.hsc?.percentageOrCGPA ? `${student.academics.hsc.percentageOrCGPA}%` : '-'}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BATCH TAB ───────────────────────────────────────────────────── */}
          {activeTab === 'batch' && (
            <div>
              {student.batch?.name ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2"><FaUsers /> Current Batch</h3>
                      <button onClick={handleOpenBatchModal} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all">
                        Change Batch
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Batch Name', val: student.batch.name },
                        { label: 'Standard', val: student.batch.standard },
                        { label: 'Timing', val: student.batch.time ? `${student.batch.time.startTime} – ${student.batch.time.endTime}` : 'N/A' },
                        { label: 'Days', val: student.batch.days?.join(', ') || 'N/A' },
                      ].map(item => (
                        <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className="font-bold text-gray-800 text-sm">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No batch assigned yet</p>
                  <button onClick={handleOpenBatchModal} className="px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-semibold hover:bg-[#34495E] transition-all shadow">
                    Assign Batch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── FEES TAB ────────────────────────────────────────────────────── */}
          {activeTab === 'fees' && (
            <div>
              {feeLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
                  <span className="ml-3 text-gray-500">Loading fee data…</span>
                </div>
              ) : !receipt ? (
                <div className="text-center py-16">
                  <FaMoneyBillWave className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No fee records found for this student.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">Total Fees</p>
                      <p className="text-xl font-bold text-blue-700">₹{((receipt.totalAmount || 0) + (receipt.remainingAmount || 0)).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-xs text-green-600 font-medium mb-1">Paid</p>
                      <p className="text-xl font-bold text-green-700">₹{(receipt.totalAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`${receipt.remainingAmount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-xl p-4`}>
                      <p className={`text-xs font-medium mb-1 ${receipt.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>Remaining</p>
                      <p className={`text-xl font-bold ${receipt.remainingAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{(receipt.remainingAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`${receipt.feeStatus === 'Paid' ? 'bg-green-50 border-green-200' : receipt.feeStatus === 'Partially Paid' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
                      <p className={`text-xs font-medium mb-1 ${receipt.feeStatus === 'Paid' ? 'text-green-600' : receipt.feeStatus === 'Partially Paid' ? 'text-yellow-600' : 'text-red-600'}`}>Status</p>
                      <p className={`text-xl font-bold ${receipt.feeStatus === 'Paid' ? 'text-green-700' : receipt.feeStatus === 'Partially Paid' ? 'text-yellow-700' : 'text-red-700'}`}>{receipt.feeStatus}</p>
                    </div>
                  </div>

                  {/* Installments table */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">Payment History ({installments.length} installments)</h3>
                    {installments.length === 0 ? (
                      <p className="text-gray-400 text-sm">No installments recorded.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              {['#', 'Date', 'Amount', 'Mode', 'Transaction ID', 'Receipt No'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {installments.map((inst, i) => (
                              <tr key={inst._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-700">{inst.paymentNumber || i + 1}</td>
                                <td className="px-4 py-3 text-gray-600">{inst.paymentDate ? new Date(inst.paymentDate).toLocaleDateString('en-IN') : '-'}</td>
                                <td className="px-4 py-3 font-bold text-green-700">₹{inst.amount?.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{inst.paymentMode}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{inst.transactionId || '-'}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{inst.installmentReceiptNumber}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TESTS TAB ───────────────────────────────────────────────────── */}
          {activeTab === 'tests' && (
            <div>
              {testLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
                  <span className="ml-3 text-gray-500">Loading test history…</span>
                </div>
              ) : testHistory.length === 0 ? (
                <div className="text-center py-16">
                  <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No test records found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score trend chart */}
                  {testChartData.length > 1 && (
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <h3 className="font-bold text-gray-800 mb-4">Score Trend (%)</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={testChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                          <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                          <Line type="monotone" dataKey="pct" stroke="#2C3E50" strokeWidth={2.5} dot={{ r: 4, fill: '#2C3E50' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Test table */}
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Test', 'Subject', 'Date', 'Marks', 'Out of', '%', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {testHistory.map(t => {
                          const absent = t.attendanceStatus === 'Absent';
                          const pct = !absent && t.marksObtained != null ? Math.round((t.marksObtained / t.maxMarks) * 100) : null;
                          return (
                            <tr key={t.testId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold text-gray-800">{t.title}</td>
                              <td className="px-4 py-3 text-gray-600">{t.subject}</td>
                              <td className="px-4 py-3 text-gray-500">{t.testDate ? new Date(t.testDate).toLocaleDateString('en-IN') : '-'}</td>
                              <td className="px-4 py-3 font-bold text-gray-800">{absent ? '—' : (t.marksObtained ?? '—')}</td>
                              <td className="px-4 py-3 text-gray-500">{t.maxMarks}</td>
                              <td className="px-4 py-3">
                                {pct != null ? (
                                  <span className={`font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                {absent ? (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Absent</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Present</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ATTENDANCE TAB ──────────────────────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
                  <span className="ml-3 text-gray-500">Loading attendance…</span>
                </div>
              ) : !attendanceStats && attendanceRecords.length === 0 ? (
                <div className="text-center py-16">
                  <FaCalendarCheck className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance records found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats cards */}
                  {attendanceStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-medium mb-1">Total Classes</p>
                        <p className="text-2xl font-bold text-blue-700">{attendanceStats.totalClasses}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs text-green-600 font-medium mb-1">Present</p>
                        <p className="text-2xl font-bold text-green-700">{attendanceStats.totalPresent}</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs text-red-600 font-medium mb-1">Absent</p>
                        <p className="text-2xl font-bold text-red-700">{attendanceStats.totalAbsent}</p>
                      </div>
                      <div className={`${attendanceStats.attendancePercentage >= 75 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
                        <p className={`text-xs font-medium mb-1 ${attendanceStats.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>Attendance %</p>
                        <p className={`text-2xl font-bold ${attendanceStats.attendancePercentage >= 75 ? 'text-green-700' : 'text-red-700'}`}>{attendanceStats.attendancePercentage?.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie chart */}
                    {attendancePieData.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h3 className="font-bold text-gray-800 mb-4">Overall Attendance</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                              {attendancePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Bar chart - last 30 sessions */}
                    {attendanceBarData.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h3 className="font-bold text-gray-800 mb-4">Last {attendanceBarData.length} Sessions</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={attendanceBarData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={Math.floor(attendanceBarData.length / 6)} />
                            <YAxis tick={false} />
                            <Tooltip />
                            <Bar dataKey="Present" fill="#22c55e" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="Absent" fill="#ef4444" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Attendance history table */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">Attendance History ({attendanceRecords.length} records)</h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-72 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {['Date', 'Subject', 'Status'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[...attendanceRecords]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map(rec => (
                              <tr key={rec._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700">{new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td className="px-4 py-2.5 text-gray-500">{rec.subject || 'Maths'}</td>
                                <td className="px-4 py-2.5">
                                  {rec.status === 'Present' ? (
                                    <span className="flex items-center gap-1 text-green-600 font-semibold text-xs"><FaCheckCircle /> Present</span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-red-600 font-semibold text-xs"><FaTimesCircle /> Absent</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Batch Assignment Modal ──────────────────────────────────────────── */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2"><FaUsers /> Assign Batch</h3>
            <select
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C3E50] mb-5"
              disabled={assigningBatch}
            >
              <option value="">-- Choose a batch --</option>
              {availableBatches.map(b => (
                <option key={b._id} value={b._id}>{b.name} (Std {b.standard}) · {b.time?.startTime}–{b.time?.endTime}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setShowBatchModal(false); setSelectedBatchId(''); }} disabled={assigningBatch} className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold rounded-xl transition-all">Cancel</button>
              <button onClick={handleAssignBatch} disabled={assigningBatch || !selectedBatchId} className="flex-1 px-4 py-2.5 bg-[#2C3E50] text-white hover:bg-[#34495E] font-semibold rounded-xl transition-all shadow disabled:opacity-50">
                {assigningBatch ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
