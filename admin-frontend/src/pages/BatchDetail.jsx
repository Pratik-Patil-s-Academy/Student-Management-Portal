import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBatchById, addStudentsToBatch, removeStudentsFromBatch } from '../services/batchService';
import { getStudentsWithNoBatch } from '../services/studentService';
import { FaArrowLeft, FaClock, FaCalendarAlt, FaUsers, FaPlus, FaTrash, FaUserGraduate, FaSearch } from 'react-icons/fa';

const BatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Add Student Modal Action
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const fetchBatch = async () => {
        setLoading(true);
        try {
            const data = await getBatchById(id);
            if (data.success) {
                setBatch(data.batch);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch batch details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const data = await getStudentsWithNoBatch();
            if (data.success) {
                setAvailableStudents(data.students);
            }
        } catch (err) {
            console.error('Failed to fetch available students', err);
        }
    }

    const openAddModal = () => {
        fetchAvailableStudents();
        setStudentSearch('');
        setSelectedStudents([]);
        setIsAddModalOpen(true);
    }

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
            ? prev.filter(id => id !== studentId) 
            : [...prev, studentId]
        );
    }

    const handleAddStudents = async () => {
        if (selectedStudents.length === 0) return;
        setActionLoading(true);
        try {
            await addStudentsToBatch(id, selectedStudents);
            setIsAddModalOpen(false);
            fetchBatch(); // Refresh
        } catch (err) {
            alert(err.message || 'Failed to add students');
        } finally {
            setActionLoading(false);
        }
    }

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to remove this student from the batch?')) return;
        try {
            await removeStudentsFromBatch(id, [studentId]);
            fetchBatch(); // Refresh
        } catch (err) {
            alert(err.message || 'Failed to remove student');
        }
    }

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

    const filteredAvailableStudents = availableStudents.filter(s => 
        s.personalDetails?.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
        s.contact?.parentMobile?.includes(studentSearch)
    );

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
                                    <div className="flex-shrink-0 h-10 w-10 relative">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {student.contact?.parentMobile}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {batch.standard === '11' || batch.standard === '12' 
                                  ? student.academics?.hsc?.collegeName || student.academics?.ssc?.schoolName 
                                  : student.academics?.ssc?.schoolName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${student.status === 'Admitted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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

        {/* Add Student Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-scaleIn">
                    <div className="bg-[#2C3E50] p-5 flex justify-between items-center text-white rounded-t-2xl">
                        <h2 className="text-xl font-bold">Add Students to Batch</h2>
                        <button onClick={() => setIsAddModalOpen(false)} className="hover:text-gray-300 font-bold text-xl">&times;</button>
                    </div>

                    <div className="p-4 border-b">
                         <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search unassigned students..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                            />
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {filteredAvailableStudents.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                {studentSearch ? 'No matching students found.' : 'No unassigned students available.'}
                            </div>
                        ) : (
                            filteredAvailableStudents.map(student => (
                                <div 
                                    key={student._id}
                                    onClick={() => handleSelectStudent(student._id)}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                        selectedStudents.includes(student._id) 
                                        ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                        : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                                         selectedStudents.includes(student._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                                    }`}>
                                        {selectedStudents.includes(student._id) && <span className="text-xs">✓</span>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                         {student.personalDetails?.photoUrl ? (
                                            <img className="h-8 w-8 rounded-full object-cover" src={student.personalDetails.photoUrl} alt="" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                <FaUserGraduate />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-800">{student.personalDetails?.fullName}</h4>
                                            <p className="text-xs text-gray-500">Std: {student.standard}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-5 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">{selectedStudents.length} students selected</span>
                        <div className="flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                            <button 
                                onClick={handleAddStudents}
                                disabled={selectedStudents.length === 0 || actionLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 shadow-md"
                            >
                                {actionLoading ? 'Adding...' : 'Add Selected'}
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
