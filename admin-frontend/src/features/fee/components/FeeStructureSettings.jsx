import React from 'react';
import { FaCog, FaEdit } from 'react-icons/fa';

const FeeStructureSettings = ({
  standards,
  getStructureForStandard,
  onOpenModal
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <FaCog className="text-[#2C3E50]" />
        <h2 className="text-lg font-bold text-gray-800">Fee Structure</h2>
        <span className="text-xs text-gray-400 ml-1">(Fixed fee per standard — auto-applied on first payment)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {standards.map(std => {
          const structure = getStructureForStandard(std);
          return (
            <div key={std} className={`border-2 rounded-xl p-4 flex items-center justify-between transition-all ${structure ? 'border-green-200 bg-green-50' : 'border-dashed border-gray-200 bg-gray-50'}`}>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Standard {std}</div>
                {structure ? (
                  <>
                    <div className="text-2xl font-bold text-green-700">₹{structure.totalFee.toLocaleString('en-IN')}</div>
                    {structure.academicYear && <div className="text-xs text-gray-500 mt-0.5">{structure.academicYear}</div>}
                    {structure.description && <div className="text-xs text-gray-400 mt-0.5 italic">{structure.description}</div>}
                  </>
                ) : (
                  <div className="text-sm text-gray-400 italic">Not set</div>
                )}
              </div>
              <button
                onClick={() => onOpenModal(std)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg text-xs font-semibold transition-all"
              >
                <FaEdit /> {structure ? 'Edit' : 'Set'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeeStructureSettings;
