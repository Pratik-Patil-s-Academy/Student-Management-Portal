import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTests, createTest, deleteTest, getOverallPerformance } from '../services/testService';
import { getAllBatches } from '../services/batchService';
import {
  FaPlus, FaTrash, FaClipboardList, FaCalendarAlt,
  FaGraduationCap, FaBook, FaTimes, FaChartBar, FaDownload, FaTrophy
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SUBJECT_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];
const CLASS_LEVELS = ['11th', '12th'];
const SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'Other'];

const emptyForm = {
  title: '',
  topic: '',
  classLevel: '11th',
  subject: 'Maths',
  testDate: '',
  maxMarks: '',
  applicableBatches: [],
};

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // Create Test Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Overall Performance Modal
  const [showPerf, setShowPerf] = useState(false);
  const [perfLimit, setPerfLimit] = useState(10);
  const [perfLoading, setPerfLoading] = useState(false);
  const [perfData, setPerfData] = useState(null); // { tests: [], students: [] }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, batchesRes] = await Promise.all([
        getAllTests(),
        getAllBatches(),
      ]);
      if (testsRes.success) setTests(testsRes.tests);
      if (batchesRes.success) setBatches(batchesRes.batches);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const filters = {};
      if (filterClass) filters.classLevel = filterClass;
      if (filterSubject) filters.subject = filterSubject;
      const res = await getAllTests(filters);
      if (res.success) setTests(res.tests);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch tests');
    }
  };

  const handleFilterApply = () => fetchTests();

  const handleFilterReset = () => {
    setFilterClass('');
    setFilterSubject('');
    getAllTests().then(res => { if (res.success) setTests(res.tests); });
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBatchToggle = (batchId) => {
    setFormData(prev => {
      const current = prev.applicableBatches;
      return {
        ...prev,
        applicableBatches: current.includes(batchId)
          ? current.filter(id => id !== batchId)
          : [...current, batchId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (formData.applicableBatches.length === 0) {
      setModalError('Please select at least one batch.');
      return;
    }
    setSubmitting(true);
    try {
      await createTest({
        ...formData,
        maxMarks: Number(formData.maxMarks),
      });
      toast.success('Test created successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Failed to create test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e, testId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this test? All scores will be lost.')) return;
    try {
      await deleteTest(testId);
      toast.success('Test deleted');
      setTests(prev => prev.filter(t => t._id !== testId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete test');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getScoreCount = (test) => test.scores?.length || 0;

  // ── Overall Performance ──────────────────────────────────────────────
  const openPerformanceModal = async () => {
    setShowPerf(true);
    await loadPerformance(perfLimit);
  };

  const loadPerformance = async (limit) => {
    setPerfLoading(true);
    try {
      const res = await getOverallPerformance({ limit });
      if (res.success) setPerfData(res);
    } catch (err) {
      toast.error(err.message || 'Failed to load performance data');
    } finally {
      setPerfLoading(false);
    }
  };

  const handleLimitChange = async (newLimit) => {
    setPerfLimit(newLimit);
    await loadPerformance(newLimit);
  };

  const exportPerfCSV = () => {
    if (!perfData?.students?.length) return;
    const headers = ['Rank', 'Roll No', 'Student Name', 'Tests Appeared', 'Total Marks Obtained', 'Total Max Marks', 'Percentage'];
    const rows = perfData.students.map(s => [
      s.rank,
      s.rollno || '-',
      s.name || '-',
      s.testsAppeared,
      s.totalMarksObtained,
      s.totalMaxMarks,
      s.percentage + '%'
    ]);
    // \uFEFF BOM ensures Excel reads UTF-8 correctly
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overall_performance_last${perfLimit}tests.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPerfPDF = () => {
    if (!perfData?.students?.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Overall Performance - Last ${perfData.tests.length} Tests`, 14, 16);
    doc.setFontSize(10);
    const testTitles = perfData.tests.map(t => t.title).join(', ');
    doc.text(`Tests: ${testTitles}`, 14, 24, { maxWidth: 180 });
    autoTable(doc, {
      startY: 34,
      head: [['Rank', 'Roll No', 'Student', 'Tests Appeared', 'Total Marks', 'Percentage']],
      body: perfData.students.map(s => [
        s.rank, s.rollno, s.name, s.testsAppeared,
        `${s.totalMarksObtained}/${s.totalMaxMarks}`, s.percentage + '%'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [44, 62, 80] },
    });
    doc.save(`overall_performance_last${perfLimit}tests.pdf`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading tests...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Tests</h1>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={openPerformanceModal}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 font-semibold text-sm"
          >
            <FaTrophy /> Overall Performance
          </button>
          <button
            onClick={openCreateModal}
            className="bg-[#2C3E50] hover:bg-[#34495E] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
          >
            <FaPlus /> Create New Test
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Class Level</label>
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Classes</option>
            {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Subject</label>
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={handleFilterApply}
          className="px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm font-semibold hover:bg-[#34495E] transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleFilterReset}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <span className="ml-auto text-sm text-gray-400">{tests.length} test{tests.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Tests per Subject Chart */}
      {tests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FaChartBar className="text-purple-500" /> Tests by Subject
          </h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={SUBJECTS.map((subj, i) => ({
                subject: subj,
                count: tests.filter(t => t.subject === subj).length,
                color: SUBJECT_COLORS[i],
              })).filter(d => d.count > 0)}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Tests']} />
              <Bar dataKey="count" name="Tests" radius={[4, 4, 0, 0]}>
                {SUBJECTS.map((_, i) => <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <Link
            key={test._id}
            to={`/tests/${test._id}`}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group block"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#2C3E50] to-[#3498DB]"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {test.title}
                  </h2>
                  {test.topic && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{test.topic}</p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(e, test._id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  title="Delete test"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaGraduationCap className="text-blue-400 flex-shrink-0" />
                  <span>Class {test.classLevel}</span>
                  <span className="text-gray-300">•</span>
                  <FaBook className="text-purple-400 flex-shrink-0" />
                  <span>{test.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarAlt className="text-green-400 flex-shrink-0" />
                  <span>{formatDate(test.testDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaChartBar className="text-orange-400 flex-shrink-0" />
                  <span>Max Marks: <span className="font-bold text-gray-800">{test.maxMarks}</span></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {test.applicableBatches?.slice(0, 2).map(b => (
                    <span key={b._id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                      {b.name}
                    </span>
                  ))}
                  {test.applicableBatches?.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{test.applicableBatches.length - 2} more
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {getScoreCount(test)} scored
                </span>
              </div>
            </div>
          </Link>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-lg">No tests found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first test to get started</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-blue-600 hover:underline text-sm font-semibold"
            >
              Create a test
            </button>
          </div>
        )}
      </div>

      {/* ── Create Test Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#2C3E50] p-6 flex justify-between items-center text-white flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaClipboardList /> Create New Test
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    minLength={3}
                    placeholder="e.g., Unit Test 1 - Calculus"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Limits and Derivatives"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classLevel"
                    value={formData.classLevel}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    required
                    min={1}
                    max={1000}
                    placeholder="e.g., 100"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicable Batches <span className="text-red-500">*</span>
                </label>
                {batches.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No batches available. Please create batches first.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {batches.map(batch => (
                      <button
                        key={batch._id}
                        type="button"
                        onClick={() => handleBatchToggle(batch._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${formData.applicableBatches.includes(batch._id)
                          ? 'bg-[#2C3E50] text-white border-[#2C3E50]'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                      >
                        {batch.name} <span className="opacity-70">({batch.standard})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg transition-colors font-semibold shadow-md disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Creating...' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Overall Performance Modal ──────────────────────────────────── */}
      {showPerf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex justify-between items-center text-white flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaTrophy /> Overall Performance (Rank Wise)
                </h2>
                <p className="text-amber-100 text-sm mt-0.5">
                  {perfData ? `Showing data from last ${perfData.tests.length} test${perfData.tests.length !== 1 ? 's' : ''}` : 'Loading...'}
                </p>
              </div>
              <button
                onClick={() => setShowPerf(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-600">Last N Tests:</label>
                <div className="flex gap-1.5">
                  {[5, 10, 15, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => handleLimitChange(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${perfLimit === n
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={perfLimit}
                    onChange={e => {
                      const v = Math.max(1, Math.min(100, Number(e.target.value)));
                      setPerfLimit(v);
                    }}
                    onBlur={() => handleLimitChange(perfLimit)}
                    className="w-16 border rounded-lg px-2 py-1 text-xs text-center focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    title="Custom number of tests"
                    placeholder="N"
                  />
                </div>
              </div>
              {perfData?.students?.length > 0 && (
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={exportPerfCSV}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <FaDownload /> CSV
                  </button>
                  <button
                    onClick={exportPerfPDF}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <FaDownload /> PDF
                  </button>
                </div>
              )}
            </div>

            {/* Tests included */}
            {perfData?.tests?.length > 0 && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">Tests included:</p>
                <div className="flex flex-wrap gap-1.5">
                  {perfData.tests.map(t => (
                    <span key={t._id} className="px-2 py-0.5 bg-white text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                      {t.title} <span className="text-blue-400">({t.subject})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {perfLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mx-auto mb-3"></div>
                  <p className="text-gray-500 font-medium">Loading performance data...</p>
                </div>
              ) : !perfData?.students?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <FaTrophy className="text-5xl mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No data available</p>
                  <p className="text-sm mt-1">Enter scores for tests to see rank data here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-l-lg">Rank</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll No</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tests Appeared</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Marks</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-r-lg">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {perfData.students.map((s) => {
                        const rankDisplay = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank;
                        const isTop3 = s.rank <= 3;
                        const pctNum = parseFloat(s.percentage);
                        const pctColor = pctNum >= 75 ? 'text-green-600' : pctNum >= 40 ? 'text-yellow-600' : 'text-red-600';
                        return (
                          <tr key={s.studentId} className={`hover:bg-gray-50 transition-colors ${isTop3 ? 'bg-amber-50/50' : ''}`}>
                            <td className="px-4 py-3 font-bold text-gray-700 text-base">{rankDisplay}</td>
                            <td className="px-4 py-3 text-gray-500">{s.rollno}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                {s.testsAppeared}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800">
                              {s.totalMarksObtained}
                              <span className="text-gray-400 font-normal text-xs"> / {s.totalMaxMarks}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${pctColor}`}>{s.percentage}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
