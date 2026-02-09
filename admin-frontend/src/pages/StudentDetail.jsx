import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, updateStudent, updateStudentStatus, deleteStudent } from '../services/studentService';
import { FaArrowLeft, FaUserGraduate, FaEdit, FaSave, FaTimes, FaTrash, FaPhone, FaCalendarAlt, FaIdCard } from 'react-icons/fa';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const data = await getStudentById(id);
      if (data.success) {
        setStudent(data.student);
        initializeFormData(data.student);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (data) => {
    setFormData({
        fullName: data.personalDetails?.fullName || '',
        address: data.personalDetails?.address || '',
        dob: data.personalDetails?.dob ? data.personalDetails.dob.split('T')[0] : '',
        gender: data.personalDetails?.gender || '',
        caste: data.personalDetails?.caste || '',
        
        fatherName: data.parents?.father?.name || '',
        fatherOccupation: data.parents?.father?.occupation || '',
        motherName: data.parents?.mother?.name || '',
        motherOccupation: data.parents?.mother?.occupation || '',
        
        parentMobile: data.contact?.parentMobile || '',
        studentMobile: data.contact?.studentMobile || '',
        email: data.contact?.email || '',
        
        standard: data.standard || '',
        rollno: data.rollno || '',
        status: data.status || 'Admitted',
        
        // Academics (Simplified for this view/edit)
        sscSchoolName: data.academics?.ssc?.schoolName || '',
        sscPercentageOrCGPA: data.academics?.ssc?.percentageOrCGPA || '',
        hscCollegeName: data.academics?.hsc?.collegeName || '',
        hscPercentageOrCGPA: data.academics?.hsc?.percentageOrCGPA || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

   const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!window.confirm('Save changes?')) return;

    setSaving(true);
    try {
        const data = new FormData();
        
        // Append all fields
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                 data.append(key, formData[key]);
            }
        });

        if (photoFile) {
            data.append('file', photoFile);
        }

        const result = await updateStudent(id, data);
        if (result.success) {
            setStudent(result.student);
            initializeFormData(result.student);
            setIsEditing(false);
            setPhotoFile(null);
            alert('Student updated successfully!');
        }
    } catch (err) {
        alert('Failed to update student: ' + (err.message || 'Unknown error'));
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to DELETE this student record? This action cannot be undone.')) return;
      try {
          await deleteStudent(id);
          alert('Student deleted successfully.');
          navigate('/students');
      } catch (err) {
          alert('Failed to delete student: ' + (err.message));
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
  if (!student) return <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">Student not found.</div>;

  const pd = student.personalDetails || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <button 
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C3E50] transition-all duration-200 font-medium hover:gap-3 group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" /> 
          <span>Back to Students</span>
        </button>
        
        <div className="flex items-center gap-3">
             {!isEditing ? (
                 <>
                    <button 
                        onClick={() => handleDelete()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-lg transition-all"
                    >
                        <FaTrash /> Delete
                    </button>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-[#2C3E50] text-white hover:bg-[#34495E] font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                        <FaEdit /> Edit Profile
                    </button>
                 </>
             ) : (
                 <>
                    <button 
                         onClick={() => { setIsEditing(false); initializeFormData(student); setPhotoFile(null); }}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold rounded-lg transition-all"
                        disabled={saving}
                    >
                        <FaTimes /> Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        disabled={saving}
                    >
                         {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </button>
                 </>
             )}
        </div>
      </div>

       {/* Banner Note */}
       <div className={`border-l-4 p-4 rounded-r-lg shadow-sm ${student.status === 'Admitted' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
        <div className="flex justify-between items-center">
           <div className="flex">
              <div className="flex-shrink-0">
                 <FaIdCard className={`h-5 w-5 ${student.status === 'Admitted' ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-sm ${student.status === 'Admitted' ? 'text-green-700' : 'text-red-700'}`}>
                  Academic Year Status: <strong>{student.status}</strong> | Batch: <strong>{student.batch?.batchName || 'Unassigned'}</strong>
                </p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Photo & basic info */}
        <div className="md:col-span-1 space-y-6">
             <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                 <div className="relative inline-block">
                    {pd.photoUrl ? (
                         <img src={pd.photoUrl} alt="Student" className="w-40 h-40 rounded-full border-4 border-gray-100 shadow-md object-cover mx-auto" />
                    ) : (
                        <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto border-4 border-white shadow-md">
                             <FaUserGraduate className="text-6xl" />
                        </div>
                    )}
                    {isEditing && (
                        <label className="absolute bottom-2 right-2 cursor-pointer bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md transition-all">
                             <FaEdit />
                             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    )}
                 </div>
                 
                 <div className="mt-4">
                     {isEditing ? (
                        <input 
                            name="fullName"
                            value={formData.fullName} 
                            onChange={handleChange}
                            className="w-full text-center text-xl font-bold border-b-2 border-blue-500 focus:outline-none bg-blue-50 rounded px-2 py-1"
                            placeholder="Full Name" 
                        /> 
                     ) : (
                         <h2 className="text-2xl font-bold text-gray-800">{pd.fullName || 'No Name'}</h2>
                     )}
                     
                     <div className="mt-2 text-gray-500 font-medium">Class {student.standard || 'N/A'}</div>
                     <div className="mt-1 text-sm bg-gray-100 inline-block px-3 py-1 rounded-full text-gray-600">
                        Roll No: {isEditing ? <input name="rollno" value={formData.rollno} onChange={handleChange} className="w-16 bg-transparent border-b border-gray-400 text-center focus:outline-none" /> : (student.rollno || 'N/A')}
                     </div>
                 </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg p-6">
                 <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Contact Info</h3>
                 <div className="space-y-3 text-sm">
                     <div>
                         <label className="block text-gray-500 text-xs">Student Mobile</label>
                         {isEditing ? (
                             <input name="studentMobile" value={formData.studentMobile} onChange={handleChange} className="w-full border rounded p-1" />
                         ) : (
                             <span className="font-medium">{student.contact?.studentMobile || 'N/A'}</span>
                         )}
                     </div>
                     <div>
                         <label className="block text-gray-500 text-xs">Parent Mobile</label>
                         {isEditing ? (
                             <input name="parentMobile" value={formData.parentMobile} onChange={handleChange} className="w-full border rounded p-1" />
                         ) : (
                             <span className="font-medium">{student.contact?.parentMobile || 'N/A'}</span>
                         )}
                     </div>
                      <div>
                         <label className="block text-gray-500 text-xs">Email</label>
                         {isEditing ? (
                             <input name="email" value={formData.email} onChange={handleChange} className="w-full border rounded p-1" />
                         ) : (
                             <span className="font-medium break-all">{student.contact?.email || 'N/A'}</span>
                         )}
                     </div>
                 </div>
             </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                 <h3 className="text-lg font-bold text-[#2C3E50] border-b pb-2 mb-4 flex items-center gap-2">
                    <FaIdCard /> Personal Information
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-500 text-xs">Date of Birth</label>
                        {isEditing ? (
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border rounded p-1" />
                        ) : (
                            <span className="font-medium">{pd.dob ? new Date(pd.dob).toLocaleDateString() : 'N/A'}</span>
                        )}
                    </div>
                     <div>
                        <label className="block text-gray-500 text-xs">Gender</label>
                         {isEditing ? (
                             <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded p-1">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                        ) : (
                            <span className="font-medium">{pd.gender || 'N/A'}</span>
                        )}
                    </div>
                     <div>
                        <label className="block text-gray-500 text-xs">Caste</label>
                        {isEditing ? (
                            <input name="caste" value={formData.caste} onChange={handleChange} className="w-full border rounded p-1" />
                        ) : (
                            <span className="font-medium">{pd.caste || 'N/A'}</span>
                        )}
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-gray-500 text-xs">Address</label>
                         {isEditing ? (
                            <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border rounded p-1" rows="2" />
                        ) : (
                            <span className="font-medium">{pd.address || 'N/A'}</span>
                        )}
                    </div>
                 </div>
            </div>

            {/* Parent Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                 <h3 className="text-lg font-bold text-[#2C3E50] border-b pb-2 mb-4 flex items-center gap-2">
                    Parent Details
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-blue-50 p-3 rounded-lg">
                         <h4 className="font-semibold text-blue-800 mb-2">Father</h4>
                         <div className="space-y-2">
                             <div>
                                 <label className="text-xs text-blue-600 block">Name</label>
                                 {isEditing ? (
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full border rounded p-1" />
                                 ) : (
                                    <span className="font-medium">{student.parents?.father?.name || 'N/A'}</span>
                                 )}
                             </div>
                             <div>
                                 <label className="text-xs text-blue-600 block">Occupation</label>
                                 {isEditing ? (
                                    <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="w-full border rounded p-1" />
                                 ) : (
                                    <span className="font-medium">{student.parents?.father?.occupation || 'N/A'}</span>
                                 )}
                             </div>
                         </div>
                     </div>
                     <div className="bg-pink-50 p-3 rounded-lg">
                         <h4 className="font-semibold text-pink-800 mb-2">Mother</h4>
                         <div className="space-y-2">
                             <div>
                                 <label className="text-xs text-pink-600 block">Name</label>
                                 {isEditing ? (
                                    <input name="motherName" value={formData.motherName} onChange={handleChange} className="w-full border rounded p-1" />
                                 ) : (
                                    <span className="font-medium">{student.parents?.mother?.name || 'N/A'}</span>
                                 )}
                             </div>
                             <div>
                                 <label className="text-xs text-pink-600 block">Occupation</label>
                                  {isEditing ? (
                                    <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="w-full border rounded p-1" />
                                 ) : (
                                    <span className="font-medium">{student.parents?.mother?.occupation || 'N/A'}</span>
                                 )}
                             </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Academic Preview */}
             <div className="bg-white rounded-xl shadow-lg p-6">
                 <h3 className="text-lg font-bold text-[#2C3E50] border-b pb-2 mb-4 flex items-center gap-2">
                    Previous Academics
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="font-semibold text-gray-700">SSC (10th)</p>
                         <div className="text-sm mt-1">
                             {isEditing ? (
                                 <div className="space-y-1">
                                     <input name="sscSchoolName" placeholder="School" value={formData.sscSchoolName} onChange={handleChange} className="w-full border rounded p-1 text-xs" />
                                     <input name="sscPercentageOrCGPA" placeholder="%" value={formData.sscPercentageOrCGPA} onChange={handleChange} className="w-full border rounded p-1 text-xs" />
                                 </div>
                             ) : (
                                 <>
                                     <p className="text-gray-600">{student.academics?.ssc?.schoolName}</p>
                                     <p className="text-blue-600 font-bold">{student.academics?.ssc?.percentageOrCGPA}%</p>
                                 </>
                             )}
                         </div>
                     </div>
                      <div>
                        <p className="font-semibold text-gray-700">HSC (12th)</p>
                         <div className="text-sm mt-1">
                              {isEditing ? (
                                 <div className="space-y-1">
                                     <input name="hscCollegeName" placeholder="College" value={formData.hscCollegeName} onChange={handleChange} className="w-full border rounded p-1 text-xs" />
                                     <input name="hscPercentageOrCGPA" placeholder="%" value={formData.hscPercentageOrCGPA} onChange={handleChange} className="w-full border rounded p-1 text-xs" />
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
      </div>
    </div>
  );
};

export default StudentDetail;
