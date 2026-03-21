import React from 'react';
import { FaTrash } from 'react-icons/fa';

const BatchModal = ({
  isOpen,
  onClose,
  isEditMode,
  formData,
  onInputChange,
  onDayToggle,
  onSubmit,
  standardOptions,
  daysOptions,
  modalError,
  submitting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
        <div className="bg-[#2C3E50] p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors flex items-center justify-center">
            <FaTrash className="transform rotate-45 text-lg" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {modalError && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{modalError}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
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
              onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                  onClick={() => onDayToggle(day)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${formData.days.includes(day)
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
              onClick={onClose}
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
  );
};

export default BatchModal;
