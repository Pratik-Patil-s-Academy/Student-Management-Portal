import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBatches, createBatch, updateBatch, deleteBatch } from '../services/batchService';
import { FaPlus, FaEdit, FaTrash, FaClock, FaCalendarAlt, FaUsers, FaGraduationCap } from 'react-icons/fa';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    standard: '11',
    startTime: '',
    endTime: '',
    days: []
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const standardOptions = ['11', '12', 'Others'];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await getAllBatches();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      standard: '11',
      startTime: '',
      endTime: '',
      days: []
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setIsEditMode(true);
    setCurrentBatchId(batch._id);
    setFormData({
      name: batch.name,
      standard: batch.standard,
      startTime: batch.time.startTime,
      endTime: batch.time.endTime,
      days: batch.days
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const currentDays = prev.days;
      if (currentDays.includes(day)) {
        return { ...prev, days: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, days: [...currentDays, day] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    if (formData.days.length === 0) {
        setModalError('Please select at least one day.');
        setSubmitting(false);
        return;
    }

    try {
      if (isEditMode) {
        await updateBatch(currentBatchId, formData);
      } else {
        await createBatch(formData);
      }
      setIsModalOpen(false);
      fetchBatches();
    } catch (err) {
      setModalError(err.message || 'Failed to save batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch? Associated students will be unassigned.')) return;
    try {
      await deleteBatch(id);
      fetchBatches();
    } catch (err) {
      alert(err.message || 'Failed to delete batch');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading batches...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#2C3E50]">Batches</h1>
        <button 
          onClick={openCreateModal}
          className="bg-[#2C3E50] hover:bg-[#34495E] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <FaPlus /> Create New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map(batch => (
          <div key={batch._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{batch.name}</h2>
                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                     <FaGraduationCap /> Class {batch.standard}
                   </span>
                </div>
                {/* Actions Dropdown or Buttons */}
                <div className="flex gap-2">
                   <button onClick={() => openEditModal(batch)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Edit">
                     <FaEdit />
                   </button>
                   <button onClick={() => handleDelete(batch._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete">
                     <FaTrash />
                   </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                 <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <FaClock className="text-blue-400 flex-shrink-0" />
                    <span>{batch.time.startTime} - {batch.time.endTime}</span>
                 </div>
                 <div className="flex items-start gap-3 text-gray-600 text-sm">
                    <FaCalendarAlt className="text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                        {batch.days.map(day => (
                            <span key={day} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{day.slice(0, 3)}</span>
                        ))}
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-gray-600 text-sm">
                    <FaUsers className="text-purple-400 flex-shrink-0" />
                    <span><span className="font-bold text-gray-800">{batch.students?.length || 0}</span> Students Enrolled</span>
                 </div>
              </div>

               <Link 
                to={`/batches/${batch._id}`} 
                className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg transition-colors border border-gray-200"
              >
                Manage Students
              </Link>
            </div>
          </div>
        ))}
         {batches.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <FaUsers className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No batches created yet.</p>
                <button onClick={openCreateModal} className="text-blue-600 hover:underline mt-2 text-sm font-semibold">Create your first batch</button>
            </div>
         )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="bg-[#2C3E50] p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h2>
              <button onClick={closeModal} className="hover:bg-white/10 p-1 rounded-full transition-colors"><FaTrash className="transform rotate-45" /></button> {/* Using trash icon rotated as close for simplicity or import FaTimes */}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{modalError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., Morning 11th - A"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
                <select 
                  name="standard" 
                  value={formData.standard} 
                  onChange={handleInputChange} 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {standardOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                 <div className="flex flex-wrap gap-2">
                    {daysOptions.map(day => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                                formData.days.includes(day)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                 </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg transition-colors font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (isEditMode ? 'Update Batch' : 'Create Batch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
