import React from 'react';
import { FaTimes, FaUser, FaPhone, FaBook, FaGraduationCap } from 'react-icons/fa';

const CreateStudentModal = ({
  isOpen,
  onClose,
  step,
  steps,
  form,
  onFormChange,
  photoPreview,
  onPhotoChange,
  batches,
  formError,
  onNext,
  onBack,
  submitting,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-[#2C3E50]">Add New Student</h2>
            <p className="text-sm text-gray-500 mt-0.5">Step {step + 1} of {steps.length}: {steps[step]}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-[#2C3E50]' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Step 0: Personal */}
          {step === 0 && (
            <>
              {/* Photo */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-3xl text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline">
                    Upload Photo (optional)
                    <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={onPhotoChange} />
                  </label>
                  <p className="text-xs text-gray-400 mt-0.5">JPG/PNG, max 1MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input name="fullName" value={form.fullName} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                    placeholder="Student's full name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" name="dob" value={form.dob} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Caste</label>
                  <input name="caste" value={form.caste} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                    placeholder="Caste (optional)" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Standard <span className="text-red-500">*</span></label>
                  <select name="standard" value={form.standard} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                    <option value="11">11th</option>
                    <option value="12">12th</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Batch</label>
                  <select name="batch" value={form.batch} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                    <option value="">No batch</option>
                    {batches.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.standard})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Roll No</label>
                  <input type="number" name="rollno" value={form.rollno} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                    placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                    <option>Admitted</option>
                    <option>Not Admitted</option>
                    <option>Dropped</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input name="address" value={form.address} onChange={onFormChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                    placeholder="Address (optional)" />
                </div>
              </div>
            </>
          )}

          {/* Step 1: Contact & Parents */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaPhone /> Contact</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Mobile <span className="text-red-500">*</span></label>
                <input name="parentMobile" value={form.parentMobile} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="10-digit mobile" maxLength={10} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student Mobile</label>
                <input name="studentMobile" value={form.studentMobile} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Optional" maxLength={10} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Optional" />
              </div>

              <div className="md:col-span-2 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Parents</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Father's Name</label>
                <input name="fatherName" value={form.fatherName} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Father's Occupation</label>
                <input name="fatherOccupation" value={form.fatherOccupation} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mother's Name</label>
                <input name="motherName" value={form.motherName} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mother's Occupation</label>
                <input name="motherOccupation" value={form.motherOccupation} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Optional" />
              </div>
            </div>
          )}

          {/* Step 2: Academics */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaBook /> SSC (10th)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Board</label>
                    <select name="sscBoard" value={form.sscBoard} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                      <option value="">Select board</option>
                      <option>State Board</option><option>CBSE</option><option>ICSE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                    <input name="sscSchoolName" value={form.sscSchoolName} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Percentage / CGPA</label>
                    <input type="number" name="sscPercentageOrCGPA" value={form.sscPercentageOrCGPA} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Maths Marks</label>
                    <input type="number" name="sscMathsMarks" value={form.sscMathsMarks} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaGraduationCap /> HSC (12th)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Board</label>
                    <select name="hscBoard" value={form.hscBoard} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent bg-white">
                      <option value="">Select board</option>
                      <option>State Board</option><option>CBSE</option><option>ICSE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">College Name</label>
                    <input name="hscCollegeName" value={form.hscCollegeName} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Percentage / CGPA</label>
                    <input type="number" name="hscPercentageOrCGPA" value={form.hscPercentageOrCGPA} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Maths Marks</label>
                    <input type="number" name="hscMathsMarks" value={form.hscMathsMarks} onChange={onFormChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                      placeholder="Optional" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Admission */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admission Date</label>
                <input type="date" name="admissionDate" value={form.admissionDate} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reference</label>
                <input name="reference" value={form.reference} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="How did they hear about us?" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Examination</label>
                <input name="targetExamination" value={form.targetExamination} onChange={onFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="e.g. JEE, NEET, MHT-CET" />
              </div>
            </div>
          )}

          {/* Error */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button
            onClick={step === 0 ? onClose : onBack}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors text-sm"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold transition-all text-sm"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all text-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Student'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStudentModal;
