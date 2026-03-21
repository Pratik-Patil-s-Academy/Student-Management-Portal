import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBatches, createBatch, updateBatch, deleteBatch } from '../services/batchService';
import { FaPlus, FaUsers } from 'react-icons/fa';
import BatchCard from '../components/BatchCard';
import BatchModal from '../components/BatchModal';

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {batches.map(batch => (
          <BatchCard
            key={batch._id}
            batch={batch}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
        {batches.length === 0 && (
          <div className="col-span-full text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FaUsers className="text-3xl md:text-4xl text-gray-300 mx-auto mb-2 md:mb-3" />
            <p className="text-sm md:text-base text-gray-500 font-medium">No batches created yet.</p>
            <button onClick={openCreateModal} className="text-blue-600 hover:underline mt-2 text-xs md:text-sm font-semibold">Create your first batch</button>
          </div>
        )}
      </div>

      <BatchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isEditMode={isEditMode}
        formData={formData}
        onInputChange={handleInputChange}
        onDayToggle={handleDayToggle}
        onSubmit={handleSubmit}
        standardOptions={standardOptions}
        daysOptions={daysOptions}
        modalError={modalError}
        submitting={submitting}
      />
    </div>
  );
};

export default Batches;
