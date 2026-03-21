import React from 'react';
import { FaArrowUp, FaTimes } from 'react-icons/fa';

const PromoteStudentsModal = ({
  isOpen,
  onClose,
  loading,
  students,
  selectedForPromotion,
  onToggleStudent,
  onToggleSelectAll,
  onPromote,
  promoting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
            <FaArrowUp className="text-amber-500" /> Promote Students to Standard 12
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 pt-4 flex-shrink-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            ℹ️ <strong>Fees will be carried forward</strong>. Any outstanding dues from Standard 11 will be added to the Standard 12 fees.
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <span className="ml-3 text-gray-500">Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No Standard 11 students found.</div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedForPromotion.size === students.length && students.length > 0}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 accent-amber-500"
                  />
                  Select All ({students.length})
                </label>
                <span className="text-sm text-amber-600 font-semibold">{selectedForPromotion.size} selected</span>
              </div>

              {/* Student rows */}
              <div className="space-y-2">
                {students.map(student => {
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
                        onChange={() => onToggleStudent(student._id)}
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
                const s = students.find(st => st._id === id);
                return s?.feeStatus?.remaining > 0;
              }) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    ℹ️ Some selected students have <strong>outstanding dues</strong>. These will be added to their next standard fees.
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onPromote}
            disabled={promoting || selectedForPromotion.size === 0 || loading}
            className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {promoting ? 'Promoting...' : <><FaArrowUp /> Promote {selectedForPromotion.size} Students</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteStudentsModal;
