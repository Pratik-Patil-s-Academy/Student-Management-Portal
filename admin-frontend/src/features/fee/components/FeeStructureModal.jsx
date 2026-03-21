import React from 'react';
import { FaTimes } from 'react-icons/fa';

const FeeStructureModal = ({
  editingStandard,
  structureForm,
  onFormChange,
  onSave,
  onClose,
  savingStructure
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#2C3E50]">
            Set Fee — Standard {editingStandard}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Total Fee Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
              <input
                type="number"
                value={structureForm.totalFee}
                onChange={e => onFormChange('totalFee', e.target.value)}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent text-lg font-semibold"
                placeholder="e.g. 15000"
                min="1"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">This will be auto-applied when recording the first payment for any Standard {editingStandard} student.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={structureForm.academicYear}
              onChange={e => onFormChange('academicYear', e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
              placeholder="e.g. 2025-2026"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={structureForm.description}
              onChange={e => onFormChange('description', e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
              placeholder="e.g. Annual tuition fee"
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={savingStructure}
            className="flex-1 px-4 py-2.5 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {savingStructure ? 'Saving...' : 'Save Fee Structure'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeStructureModal;
