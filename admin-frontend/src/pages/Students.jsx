import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudents, createStudent, promoteStudents, getStudentsForPromotion } from '../services/studentService';
import { getAllBatches } from '../services/batchService';
import {
  FaSearch, FaSort, FaEye, FaUserGraduate, FaFilter,
  FaPlus, FaTimes, FaUser, FaPhone, FaBook, FaGraduationCap, FaArrowUp
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  // Personal
  fullName: '', address: '', dob: '', gender: '', caste: '',
  // Parents
  fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
  // Contact
  parentMobile: '', studentMobile: '', email: '',
  // Academics - SSC
  sscBoard: '', sscSchoolName: '', sscPercentageOrCGPA: '', sscMathsMarks: '',
  // Academics - HSC
  hscBoard: '', hscCollegeName: '', hscPercentageOrCGPA: '', hscMathsMarks: '',
  // Admission
  reference: '', admissionDate: '', targetExamination: '',
  // Core
  standard: '11', batch: '', rollno: '', status: 'Admitted',
};

const STEPS = ['Personal', 'Contact & Parents', 'Academics', 'Admission'];

const Students = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL Params for persistence
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const standardFilter = searchParams.get('standard') || '';
  const sortBy = searchParams.get('sort') || 'date_desc';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Promote state
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promote11Students, setPromote11Students] = useState([]);
  const [loadingPromoteList, setLoadingPromoteList] = useState(false);
  const [selectedForPromotion, setSelectedForPromotion] = useState(new Set());
  const students11Count = students.filter(s => s.standard === '11').length;

  useEffect(() => {
    fetchData();
    fetchBatches();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      if (data.success) setStudents(data.students);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      if (data.success) setBatches(data.batches);
    } catch { /* non-critical */ }
  };

  const handlePromote = async () => {
    const selectedIds = [...selectedForPromotion];
    if (selectedIds.length === 0) {
      toast.error('Please select at least one student to promote');
      return;
    }
    setPromoting(true);
    try {
      const res = await promoteStudents(selectedIds);
      if (res.success) {
        toast.success(res.message);
        setPromoteModalOpen(false);
        setSelectedForPromotion(new Set());
        setPromote11Students([]);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to promote students');
    } finally {
      setPromoting(false);
    }
  };

  const openPromoteModal = async () => {
    setPromoteModalOpen(true);
    setLoadingPromoteList(true);
    setSelectedForPromotion(new Set());
    try {
      const res = await getStudentsForPromotion();
      if (res.success) {
        setPromote11Students(res.students);
        // Pre-select all by default
        setSelectedForPromotion(new Set(res.students.map(s => s._id)));
      }
    } catch (err) {
      toast.error('Failed to load students for promotion');
    } finally {
      setLoadingPromoteList(false);
    }
  };

  const toggleStudentSelection = (id) => {
    setSelectedForPromotion(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedForPromotion.size === promote11Students.length) {
      setSelectedForPromotion(new Set());
    } else {
      setSelectedForPromotion(new Set(promote11Students.map(s => s._id)));
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

  // Filter & Sort Logic
  const filteredStudents = students
    .filter(student => {
      const nameMatch = student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const mobileMatch = student.contact?.parentMobile?.includes(searchTerm) || student.contact?.studentMobile?.includes(searchTerm);
      const searchMatch = nameMatch || mobileMatch;
      const statusMatch = statusFilter ? student.status === statusFilter : true;
      const standardMatch = standardFilter ? student.standard === standardFilter : true;
      return searchMatch && statusMatch && standardMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name_asc') return (a.personalDetails?.fullName || '').localeCompare(b.personalDetails?.fullName || '');
      if (sortBy === 'name_desc') return (b.personalDetails?.fullName || '').localeCompare(a.personalDetails?.fullName || '');
      return 0;
    });

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openModal = () => {
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview('');
    setFormError('');
    setStep(0);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-sync standard from selected batch
      if (name === 'batch' && value) {
        const selectedBatch = batches.find(b => b._id === value);
        if (selectedBatch) updated.standard = selectedBatch.standard;
      }
      return updated;
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1048576) { toast.error('Photo must be less than 1MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName.trim() || form.fullName.trim().length < 2)
        return 'Full name is required (minimum 2 characters)';
      if (!form.standard) return 'Standard is required';
    }
    if (step === 1) {
      if (!form.parentMobile || !/^[0-9]{10}$/.test(form.parentMobile))
        return 'Valid 10-digit parent mobile is required';
      if (form.studentMobile && !/^[0-9]{10}$/.test(form.studentMobile))
        return 'Student mobile must be 10 digits';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return 'Enter a valid email address';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setFormError(err); return; }
    setFormError('');
    setStep(s => s + 1);
  };

  const handleBack = () => { setFormError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setFormError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (photoFile) fd.append('file', photoFile);

      const res = await createStudent(fd);
      if (res.success) {
        toast.success('Student created successfully!');
        closeModal();
        fetchData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading students...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Students</h1>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-[#2C3E50]">{filteredStudents.length}</span>
          </div>
          {students11Count > 0 && (
            <button
              onClick={openPromoteModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow transition-all hover:scale-105 text-sm"
            >
              <FaArrowUp /> Promote to 12th ({students11Count})
            </button>
          )}
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold shadow transition-all hover:scale-105 text-sm"
          >
            <FaPlus /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name or Mobile..."
            className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 text-sm"
            value={searchTerm}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          <div className="relative">
            <select
              className="w-full appearance-none pl-3 pr-8 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer text-sm"
              value={standardFilter}
              onChange={(e) => updateFilter('standard', e.target.value)}
            >
              <option value="">All Standards</option>
              <option value="11">11th</option>
              <option value="12">12th</option>
              <option value="Others">Others</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>

          <div className="relative">
            <select
              className="w-full appearance-none pl-3 pr-8 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer text-sm"
              value={statusFilter}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Admitted">Admitted</option>
              <option value="Not Admitted">Not Admitted</option>
              <option value="Dropped">Dropped</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>

          <div className="relative col-span-2 md:col-span-1">
            <select
              className="w-full appearance-none pl-3 pr-8 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all hover:border-gray-300 cursor-pointer text-sm"
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
            <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Standard</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-blue-50 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {student.rollno || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {student.personalDetails?.photoUrl ? (
                      <img src={student.personalDetails.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <FaUserGraduate />
                      </div>
                    )}
                    {student.personalDetails?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.contact?.parentMobile || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2C3E50]">
                    {student.standard}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.batch && student.batch.name ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">{student.batch.name}</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm 
                        ${student.status === 'Admitted' ? 'bg-green-100 text-green-800' :
                        student.status === 'Dropped' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/students/${student._id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all group-hover:gap-3"
                    >
                      <FaEye /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="text-3xl text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold">No students found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4 bg-gray-50">
          {filteredStudents.map((student) => (
            <Link
              key={student._id}
              to={`/students/${student._id}`}
              className="block bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {student.personalDetails?.photoUrl ? (
                    <img src={student.personalDetails.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <FaUserGraduate />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{student.personalDetails?.fullName || 'N/A'}</h3>
                    <p className="text-xs text-gray-500">Roll: {student.rollno || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full shadow-sm border 
                               ${student.status === 'Admitted' ? 'bg-green-100 text-green-800 border-green-200' :
                      student.status === 'Dropped' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    <span>{student.status}</span>
                    <div
                      className={`p-1 rounded-full transition-colors flex items-center justify-center
                        ${student.status === 'Admitted' ? 'bg-green-200 hover:bg-green-300 text-green-900' :
                          student.status === 'Dropped' ? 'bg-red-200 hover:bg-red-300 text-red-900' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                      title="View Profile"
                    >
                      <FaEye className="text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><span className="font-semibold text-gray-800">Mobile:</span> {student.contact?.parentMobile || 'N/A'}</p>
                <p><span className="font-semibold text-gray-800">Standard:</span> <span className="text-[#2C3E50] font-bold">{student.standard}</span></p>
                <p><span className="font-semibold text-gray-800">Batch:</span> {student.batch && student.batch.name ? <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-bold">{student.batch.name}</span> : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium italic">Unassigned</span>}</p>
              </div>
            </Link>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center text-gray-500 py-12 bg-white rounded-xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <p className="text-lg font-semibold">No students found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Promote Students Modal ───────────────────────────────────────────── */}
      {promoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
                <FaArrowUp className="text-amber-500" /> Promote Students to Standard 12
              </h2>
              <button onClick={() => setPromoteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {/* Info Banner */}
            <div className="px-5 pt-4 flex-shrink-0">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ⚠️ <strong>Fee records will be reset</strong> for promoted students. This action cannot be undone.
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingPromoteList ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                  <span className="ml-3 text-gray-500">Loading students...</span>
                </div>
              ) : promote11Students.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No Standard 11 students found.</div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedForPromotion.size === promote11Students.length && promote11Students.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-amber-500"
                      />
                      Select All ({promote11Students.length})
                    </label>
                    <span className="text-sm text-amber-600 font-semibold">{selectedForPromotion.size} selected</span>
                  </div>

                  {/* Student rows */}
                  <div className="space-y-2">
                    {promote11Students.map(student => {
                      const hasDues = student.feeStatus?.remaining > 0;
                      const hasFees = student.feeStatus?.status !== 'No Fees';
                      const isSelected = selectedForPromotion.has(student._id);
                      return (
                        <label
                          key={student._id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="w-4 h-4 accent-amber-500 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800 text-sm">{student.personalDetails?.fullName}</span>
                              {student.rollno && <span className="text-xs text-gray-400">#{student.rollno}</span>}
                              {student.batch?.name && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{student.batch.name}</span>}
                            </div>
                            {hasFees && (
                              <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className="text-green-600">Paid: ₹{student.feeStatus.paid?.toLocaleString('en-IN')}</span>
                                {hasDues && (
                                  <span className="text-red-600 font-semibold">⚠ Due: ₹{student.feeStatus.remaining?.toLocaleString('en-IN')}</span>
                                )}
                                {!hasDues && <span className="text-green-600 font-semibold">✓ Fully Paid</span>}
                              </div>
                            )}
                            {!hasFees && <div className="text-xs text-gray-400 mt-0.5">No fee records</div>}
                          </div>
                          {hasDues && isSelected && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold flex-shrink-0">Unpaid</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Unpaid warning */}
                  {[...selectedForPromotion].some(id => {
                    const s = promote11Students.find(st => st._id === id);
                    return s?.feeStatus?.remaining > 0;
                  }) && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                        ⚠️ Some selected students have <strong>outstanding dues</strong>. Their fee records will be reset upon promotion.
                      </div>
                    )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setPromoteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePromote}
                disabled={promoting || selectedForPromotion.size === 0 || loadingPromoteList}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {promoting ? 'Promoting...' : <><FaArrowUp /> Promote {selectedForPromotion.size} Students</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Student Modal ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-[#2C3E50]">Add New Student</h2>
                <p className="text-sm text-gray-500 mt-0.5">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-4">
              <div className="flex gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-[#2C3E50]' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Step 0: Personal */}
              {step === 0 && (
                <>
                  {/* Photo */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <FaUser className="text-3xl text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline">
                        Upload Photo (optional)
                        <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      <p className="text-xs text-gray-400 mt-0.5">JPG/PNG, max 1MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input name="fullName" value={form.fullName} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                        placeholder="Student's full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" name="dob" value={form.dob} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Caste</label>
                      <input name="caste" value={form.caste} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                        placeholder="Caste (optional)" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Standard <span className="text-red-500">*</span></label>
                      <select name="standard" value={form.standard} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                        <option value="11">11th</option>
                        <option value="12">12th</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Batch</label>
                      <select name="batch" value={form.batch} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                        <option value="">No batch</option>
                        {batches.map(b => (
                          <option key={b._id} value={b._id}>{b.name} ({b.standard})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Roll No</label>
                      <input type="number" name="rollno" value={form.rollno} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                        placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                      <select name="status" value={form.status} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                        <option>Admitted</option>
                        <option>Not Admitted</option>
                        <option>Dropped</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                      <input name="address" value={form.address} onChange={handleFormChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                        placeholder="Address (optional)" />
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Contact & Parents */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaPhone /> Contact</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Mobile <span className="text-red-500">*</span></label>
                    <input name="parentMobile" value={form.parentMobile} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="10-digit mobile" maxLength={10} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Student Mobile</label>
                    <input name="studentMobile" value={form.studentMobile} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" maxLength={10} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>

                  <div className="md:col-span-2 border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Parents</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Father's Name</label>
                    <input name="fatherName" value={form.fatherName} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Father's Occupation</label>
                    <input name="fatherOccupation" value={form.fatherOccupation} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mother's Name</label>
                    <input name="motherName" value={form.motherName} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mother's Occupation</label>
                    <input name="motherOccupation" value={form.motherOccupation} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                </div>
              )}

              {/* Step 2: Academics */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaBook /> SSC (10th)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Board</label>
                        <select name="sscBoard" value={form.sscBoard} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                          <option value="">Select board</option>
                          <option>State Board</option><option>CBSE</option><option>ICSE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                        <input name="sscSchoolName" value={form.sscSchoolName} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                          placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Percentage / CGPA</label>
                        <input type="number" name="sscPercentageOrCGPA" value={form.sscPercentageOrCGPA} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                          placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Maths Marks</label>
                        <input type="number" name="sscMathsMarks" value={form.sscMathsMarks} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                          placeholder="Optional" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaGraduationCap /> HSC (12th)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Board</label>
                        <select name="hscBoard" value={form.hscBoard} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                          <option value="">Select board</option>
                          <option>State Board</option><option>CBSE</option><option>ICSE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">College Name</label>
                        <input name="hscCollegeName" value={form.hscCollegeName} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                          placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Percentage / CGPA</label>
                        <input type="number" name="hscPercentageOrCGPA" value={form.hscPercentageOrCGPA} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                          placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Maths Marks</label>
                        <input type="number" name="hscMathsMarks" value={form.hscMathsMarks} onChange={handleFormChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                          placeholder="Optional" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Admission */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Admission Date</label>
                    <input type="date" name="admissionDate" value={form.admissionDate} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reference</label>
                    <input name="reference" value={form.reference} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="How did they hear about us?" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target Examination</label>
                    <input name="targetExamination" value={form.targetExamination} onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="e.g. JEE, NEET, MHT-CET" />
                  </div>
                </div>
              )}

              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100">
              <button
                onClick={step === 0 ? closeModal : handleBack}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors text-sm"
              >
                {step === 0 ? 'Cancel' : '← Back'}
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold transition-all text-sm"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all text-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Student'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
