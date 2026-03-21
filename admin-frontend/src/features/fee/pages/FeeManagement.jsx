import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudentsWithFees, getFeeStructures, upsertFeeStructure } from '../services/feeService';
import { FaSearch, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FeeStructureSettings from '../components/FeeStructureSettings';
import FeeFilters from '../components/FeeFilters';
import FeeTable from '../components/FeeTable';
import FeeCard from '../components/FeeCard';
import FeeCharts from '../components/FeeCharts';
import FeeStructureModal from '../components/FeeStructureModal';

const FEE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const STANDARDS = ['11', '12', 'Others'];


const FeeManagement = () => {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fee structure modal
  const [structureModal, setStructureModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [structureForm, setStructureForm] = useState({ standard: '11', totalFee: '', description: '', academicYear: '' });
  const [savingStructure, setSavingStructure] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const standardFilter = searchParams.get('standard') || '';

  useEffect(() => {
    fetchData();
    fetchStructures();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllStudentsWithFees();
      if (data.success) setStudents(data.students);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      toast.error('Failed to fetch students data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const data = await getFeeStructures();
      if (data.success) setFeeStructures(data.structures);
    } catch { /* non-critical */ }
  };

  const getStructureForStandard = (std) => feeStructures.find(s => s.standard === std);

  const openStructureModal = (standard) => {
    const existing = getStructureForStandard(standard);
    setEditingStandard(standard);
    setStructureForm({
      standard,
      totalFee: existing?.totalFee || '',
      description: existing?.description || '',
      academicYear: existing?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    });
    setStructureModal(true);
  };

  const handleSaveStructure = async () => {
    if (!structureForm.totalFee || parseFloat(structureForm.totalFee) <= 0) {
      toast.error('Please enter a valid fee amount');
      return;
    }
    setSavingStructure(true);
    try {
      const res = await upsertFeeStructure({
        standard: structureForm.standard,
        totalFee: parseFloat(structureForm.totalFee),
        description: structureForm.description,
        academicYear: structureForm.academicYear
      });
      if (res.success) {
        toast.success(res.message);
        setStructureModal(false);
        fetchStructures();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save fee structure');
    } finally {
      setSavingStructure(false);
    }
  };

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) newParams.set(key, value);
      else newParams.delete(key);
      return newParams;
    });
  };

  const filteredStudents = students.filter(student => {
    if (searchTerm && !student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !student.rollno?.toString().includes(searchTerm)) return false;
    if (standardFilter && student.standard !== standardFilter) return false;
    if (statusFilter) {
      const status = student.feeInfo?.feeStatus?.toLowerCase() || 'pending';
      if (statusFilter === 'paid' && status !== 'paid') return false;
      if (statusFilter === 'pending' && status !== 'pending') return false;
      if (statusFilter === 'partial' && status !== 'partially paid') return false;
    }
    return true;
  });

  const getFeeStatus = (student) => student.feeInfo?.feeStatus || 'Pending';

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially paid': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaMoneyBillWave className="text-[#2C3E50]" />
            Fee Management
          </h1>
          <p className="text-gray-600 mt-1">Manage student fee payments and track payment history</p>
        </div>
      </div>

      <FeeStructureSettings
        standards={STANDARDS}
        getStructureForStandard={getStructureForStandard}
        onOpenModal={openStructureModal}
      />

      {/* Filters */}
      <FeeFilters
        searchTerm={searchTerm}
        standardFilter={standardFilter}
        statusFilter={statusFilter}
        onFilterChange={updateFilter}
      />

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <FeeTable
          students={filteredStudents}
          getFeeStatus={getFeeStatus}
          getStatusColor={getStatusColor}
          getStructureForStandard={getStructureForStandard}
        />

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-100 bg-gray-50">
          {filteredStudents.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 bg-white">
              <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <div className="text-lg font-medium">No students found</div>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <FeeCard
                key={student._id}
                student={student}
                feeStatus={getFeeStatus(student)}
                statusColor={getStatusColor(getFeeStatus(student))}
              />
            ))
          )}
        </div>
      </div>

      {/* Charts Section */}
      <FeeCharts
        students={filteredStudents}
        getFeeStatus={getFeeStatus}
        feeColors={FEE_COLORS}
      />

      {/* ── Fee Structure Modal ─────────────────────────────────────────────── */}
      {structureModal && (
        <FeeStructureModal
          editingStandard={editingStandard}
          structureForm={structureForm}
          onFormChange={(key, value) => setStructureForm(p => ({ ...p, [key]: value }))}
          onSave={handleSaveStructure}
          onClose={() => setStructureModal(false)}
          savingStructure={savingStructure}
        />
      )}
    </div>
  );
};

export default FeeManagement;