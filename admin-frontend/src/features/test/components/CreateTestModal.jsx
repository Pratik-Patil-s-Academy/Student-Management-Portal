import React from 'react';
import { FaClipboardList, FaTimes } from 'react-icons/fa';

const CreateTestModal = ({
  isOpen,
  onClose,
  error,
  formData,
  onInputChange,
  onBatchToggle,
  batches,
  submitting,
  onSubmit,
  classLevels,
  subjects
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-[#2C3E50] p-6 flex justify-between items-center text-white flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaClipboardList /> Create New Test
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              >
                {classLevels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={onInputChange}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                    onClick={() => onBatchToggle(batch._id)}
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
              onClick={onClose}
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
  );
};

export default CreateTestModal;
