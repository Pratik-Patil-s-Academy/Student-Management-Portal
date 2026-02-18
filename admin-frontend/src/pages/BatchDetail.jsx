import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBatchById, addStudentsToBatch, removeStudentsFromBatch } from '../services/batchService';
import { getAllStudents } from '../services/studentService';
import { FaArrowLeft, FaClock, FaCalendarAlt, FaUsers, FaPlus, FaUserGraduate, FaSearch } from 'react-icons/fa';

const STANDARDS = ['11', '12', 'Others'];

const BatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Add Student Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [standardTab, setStandardTab] = useState('11');   // '11' | '12' | 'Others'
    const [assignTab, setAssignTab] = useState('unassigned'); // 'unassigned' | 'assigned'

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const fetchBatch = async () => {
        setLoading(true);
        try {
            const data = await getBatchById(id);
            if (data.success) setBatch(data.batch);
        } catch (err) {
            setError(err.message || 'Failed to fetch batch details');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = async () => {
        setSelectedStudents([]);
        setStudentSearch('');
        setStandardTab('11');
        setAssignTab('unassigned');
        setIsAddModalOpen(true);
        setLoadingStudents(true);
        try {
            const data = await getAllStudents();
            if (data.success) setAllStudents(data.students);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(sid => sid !== studentId)
                : [...prev, studentId]
        );
    };

    const handleAddStudents = async () => {
        if (selectedStudents.length === 0) return;
        setActionLoading(true);
        try {
            await addStudentsToBatch(id, selectedStudents);
            setIsAddModalOpen(false);
            fetchBatch();
        } catch (err) {
            alert(err.message || 'Failed to add students');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to remove this student from the batch?')) return;
        try {
            await removeStudentsFromBatch(id, [studentId]);
            fetchBatch();
        } catch (err) {
            alert(err.message || 'Failed to remove student');
        }
    };

    // Compute the currently enrolled student IDs for this batch
    const enrolledIds = useMemo(() => new Set((batch?.students || []).map(s => s._id)), [batch]);

    // Filter students for the modal based on tabs + search
    const modalStudents = useMemo(() => {
        return allStudents.filter(s => {
            // Standard filter
            if (s.standard !== standardTab) return false;

            // Assigned/Unassigned filter
            const isInThisBatch = enrolledIds.has(s._id);
            const isAssignedElsewhere = s.batch && !isInThisBatch;

            if (assignTab === 'unassigned') {
                // Students with no batch at all
                if (s.batch) return false;
            } else {
                // Students assigned to another batch (not this one)
                if (!isAssignedElsewhere) return false;
            }

            // Search filter
            if (studentSearch) {
                const q = studentSearch.toLowerCase();
                return (
                    s.personalDetails?.fullName?.toLowerCase().includes(q) ||
                    s.contact?.parentMobile?.includes(q) ||
                    s.rollno?.toString().includes(q)
                );
            }
            return true;
        });
    }, [allStudents, standardTab, assignTab, studentSearch, enrolledIds]);

    // Count badges for tabs
    const countFor = (std, assign) => {
        return allStudents.filter(s => {
            if (s.standard !== std) return false;
            const isInThisBatch = enrolledIds.has(s._id);
            const isAssignedElsewhere = s.batch && !isInThisBatch;
            if (assign === 'unassigned') return !s.batch;
            return !!isAssignedElsewhere;
        }).length;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading details...</p>
            </div>
        </div>
    );

    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
    if (!batch) return <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">Batch not found.</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/batches')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] font-medium transition-colors group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Batches
                </button>
                <h1 className="text-3xl font-bold text-[#2C3E50] flex items-center gap-3">
                    {batch.name}
                    <span className="text-base font-normal px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
                        Class {batch.standard}
                    </span>
                </h1>
            </div>

            {/* Meta Info */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-blue-500">
                        <FaClock className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Timings</h3>
                        <p className="font-bold text-gray-800 text-lg">{batch.time?.startTime} - {batch.time?.endTime}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-full text-green-500">
                        <FaCalendarAlt className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Days</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {batch.days?.map(day => (
                                <span key={day} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">{day.slice(0, 3)}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-full text-purple-500">
                        <FaUsers className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Students Enrolled</h3>
                        <p className="font-bold text-gray-800 text-lg">{batch.students?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Enrolled Students</h2>
                    <button
                        onClick={openAddModal}
                        className="bg-[#2C3E50] hover:bg-[#34495E] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-md"
                    >
                        <FaPlus /> Add Students
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">School/College</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {batch.students?.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {student.personalDetails?.photoUrl ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={student.personalDetails.photoUrl} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <FaUserGraduate />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{student.personalDetails?.fullName}</div>
                                                <div className="text-xs text-gray-500">Roll: {student.rollno || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.contact?.parentMobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {batch.standard === '11' || batch.standard === '12'
                                            ? student.academics?.hsc?.collegeName || student.academics?.ssc?.schoolName
                                            : student.academics?.ssc?.schoolName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Admitted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/students/${student._id}`} className="text-blue-600 hover:text-blue-900 mr-4 font-semibold">View</Link>
                                        <button
                                            onClick={() => handleRemoveStudent(student._id)}
                                            className="text-red-600 hover:text-red-900 font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!batch.students || batch.students.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No students assigned to this batch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add Student Modal ─────────────────────────────────────────────── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '88vh' }}>

                        {/* Modal Header */}
                        <div className="bg-[#2C3E50] p-5 flex justify-between items-center text-white rounded-t-2xl flex-shrink-0">
                            <h2 className="text-xl font-bold">Add Students to Batch</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="hover:text-gray-300 font-bold text-xl">&times;</button>
                        </div>

                        {/* Standard Tabs */}
                        <div className="flex border-b border-gray-200 flex-shrink-0 bg-gray-50">
                            {STANDARDS.map(std => (
                                <button
                                    key={std}
                                    onClick={() => { setStandardTab(std); setSelectedStudents([]); setStudentSearch(''); }}
                                    className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${
                                        standardTab === std
                                            ? 'border-[#2C3E50] text-[#2C3E50] bg-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Standard {std}
                                </button>
                            ))}
                        </div>

                        {/* Assigned / Unassigned Sub-tabs */}
                        <div className="flex gap-2 px-4 pt-3 flex-shrink-0">
                            <button
                                onClick={() => { setAssignTab('unassigned'); setSelectedStudents([]); }}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    assignTab === 'unassigned'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Unassigned
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${assignTab === 'unassigned' ? 'bg-green-500' : 'bg-gray-200 text-gray-500'}`}>
                                    {countFor(standardTab, 'unassigned')}
                                </span>
                            </button>
                            <button
                                onClick={() => { setAssignTab('assigned'); setSelectedStudents([]); }}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    assignTab === 'assigned'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Assigned to other batch
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${assignTab === 'assigned' ? 'bg-orange-400' : 'bg-gray-200 text-gray-500'}`}>
                                    {countFor(standardTab, 'assigned')}
                                </span>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-4 pt-3 pb-2 flex-shrink-0">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, mobile or roll no..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] text-sm"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
                            {loadingStudents ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E50]"></div>
                                    <span className="ml-3 text-gray-500 text-sm">Loading students...</span>
                                </div>
                            ) : modalStudents.length === 0 ? (
                                <div className="text-center text-gray-400 py-10 text-sm">
                                    {studentSearch
                                        ? 'No matching students found.'
                                        : assignTab === 'unassigned'
                                            ? `No unassigned Standard ${standardTab} students.`
                                            : `No Standard ${standardTab} students assigned to other batches.`}
                                </div>
                            ) : (
                                modalStudents.map(student => {
                                    const isSelected = selectedStudents.includes(student._id);
                                    return (
                                        <div
                                            key={student._id}
                                            onClick={() => handleSelectStudent(student._id)}
                                            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                                                    : 'hover:bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 rounded border mr-3 flex-shrink-0 flex items-center justify-center ${
                                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                                            }`}>
                                                {isSelected && <span className="text-xs">✓</span>}
                                            </div>

                                            {/* Avatar */}
                                            {student.personalDetails?.photoUrl ? (
                                                <img className="h-9 w-9 rounded-full object-cover mr-3 flex-shrink-0" src={student.personalDetails.photoUrl} alt="" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs mr-3 flex-shrink-0">
                                                    <FaUserGraduate />
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-800 text-sm">{student.personalDetails?.fullName}</span>
                                                    {student.rollno && <span className="text-xs text-gray-400">#{student.rollno}</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{student.contact?.parentMobile}</div>
                                            </div>

                                            {/* Current batch badge (for assigned tab) */}
                                            {assignTab === 'assigned' && student.batch && (
                                                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-semibold flex-shrink-0 max-w-[120px] truncate">
                                                    {student.batch.name}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">{selectedStudents.length} selected</span>
                            <div className="flex gap-3">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
                                <button
                                    onClick={handleAddStudents}
                                    disabled={selectedStudents.length === 0 || actionLoading}
                                    className="px-6 py-2 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold disabled:opacity-50 shadow-md text-sm transition-colors"
                                >
                                    {actionLoading ? 'Adding...' : `Add ${selectedStudents.length > 0 ? selectedStudents.length : ''} Selected`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchDetail;
