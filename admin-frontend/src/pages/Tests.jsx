import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTests, createTest, deleteTest } from '../services/testService';
import { getAllBatches } from '../services/batchService';
import {
  FaPlus, FaTrash, FaClipboardList, FaCalendarAlt,
  FaGraduationCap, FaBook, FaTimes, FaChartBar
} from 'react-icons/fa';
import toast from 'react-hot-toast';

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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Tests</h1>
        <button
          onClick={openCreateModal}
          className="bg-[#2C3E50] hover:bg-[#34495E] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <FaPlus /> Create New Test
        </button>
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

      {/* Create Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          formData.applicableBatches.includes(batch._id)
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
    </div>
  );
};

export default Tests;
