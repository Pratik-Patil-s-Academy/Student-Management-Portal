import React, { useState } from 'react';
import { User, Phone, Users, GraduationCap, FileText, ChevronDown } from 'lucide-react';

// --- Styled Components ---

// 1. Section Header: Icon + Title
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6 mt-2">
    <div className="w-8 h-8 rounded bg-[#f5f1e8] flex items-center justify-center text-slate-700">
      <Icon size={16} strokeWidth={2} />
    </div>
    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
  </div>
);

// 2. Input Field: Clean, bordered, rounded
const InputField = ({ label, placeholder, type = "text", value, onChange, required, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-bold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 
                 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 
                 transition-all shadow-sm"
    />
  </div>
);

// 3. Select Field: Custom styled select
const SelectField = ({ label, value, onChange, options = [], required, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-bold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 
                   appearance-none focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 
                   transition-all shadow-sm cursor-pointer"
      >
        <option value="" disabled>Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={14} />
      </div>
    </div>
  </div>
);

// 4. Academic Sub-Block: The Beige Box
const AcademicBlock = ({ title, data, onChange, section }) => (
  <div className="bg-[#f9f7f2] p-5 rounded-xl mb-4 border border-[#f0ebe0]">
    <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <SelectField
        label="Board"
        value={data.board}
        onChange={(val) => onChange(section, 'board', val)}
        options={[{ label: 'State Board', value: 'State Board' }, { label: 'CBSE', value: 'CBSE' }, { label: 'ICSE', value: 'ICSE' }]}
      />
      <InputField
        label={section === 'eleventh' ? 'College Name' : 'School Name'}
        placeholder={section === 'eleventh' ? 'Enter College Name' : 'Enter School Name'}
        value={section === 'eleventh' ? data.collegeName : data.schoolName}
        onChange={(val) => onChange(section, section === 'eleventh' ? 'collegeName' : 'schoolName', val)}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Percentage / CGPA"
        placeholder="0.00"
        value={data.percentageOrCGPA}
        onChange={(val) => onChange(section, 'percentageOrCGPA', val)}
      />
      <InputField
        label="Maths Marks"
        placeholder="0"
        value={data.mathsMarks}
        onChange={(val) => onChange(section, 'mathsMarks', val)}
      />
    </div>
  </div>
);

const InquiryForm = () => {
  const [formData, setFormData] = useState({
    studentDetails: { fullName: '', gender: '', address: '' },
    parents: { father: { name: '', occupation: '' }, mother: { name: '', occupation: '' } },
    contact: { parentMobile: '', studentMobile: '', email: '' },
    academics: {
      ssc: { board: '', schoolName: '', percentageOrCGPA: '', mathsMarks: '' },
      eleventh: { board: '', collegeName: '', percentageOrCGPA: '', mathsMarks: '' }
    },
    reference: '',
    interestedStudentNote: '',
    specialRequirement: '',
  });

  // Universal Change Handler
  const handleChange = (section, field, value, subSection = null) => {
    setFormData(prev => {
      // Handle deeply nested academic data
      if (subSection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: { ...prev[section][subSection], [field]: value }
          }
        };
      }
      // Handle nested section data (parents, contact)
      if (typeof prev[section] === 'object' && prev[section] !== null && !subSection) {
        return {
          ...prev,
          [section]: { ...prev[section], [field]: value }
        };
      }
      // Handle root level data
      return { ...prev, [section]: value };
    });
  };

  // Specific handler for Academic blocks to keep JSX clean
  const handleAcademicChange = (subSection, field, value) => {
    handleChange('academics', field, value, subSection);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert("Inquiry Submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10">
      
      {/* 1. Student Details */}
      <section className="mb-8">
        <SectionHeader icon={User} title="Student Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InputField 
            label="Full Name" 
            placeholder="e.g. John Doe" 
            required
            value={formData.studentDetails.fullName}
            onChange={(val) => handleChange('studentDetails', 'fullName', val)}
          />
          <SelectField 
            label="Gender" 
            options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
            value={formData.studentDetails.gender}
            onChange={(val) => handleChange('studentDetails', 'gender', val)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 ml-1">Residential Address</label>
          <textarea
            rows="3"
            placeholder="Enter complete address"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 
                       placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 
                       transition-all shadow-sm resize-none"
            value={formData.studentDetails.address}
            onChange={(e) => handleChange('studentDetails', 'address', e.target.value)}
          ></textarea>
        </div>
      </section>

      {/* 2. Contact Information */}
      <section className="mb-8">
        <SectionHeader icon={Phone} title="Contact Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InputField 
            label="Parent Mobile" 
            placeholder="10-digit number" 
            required
            value={formData.contact.parentMobile}
            onChange={(val) => handleChange('contact', 'parentMobile', val)}
          />
          <InputField 
            label="Student Mobile" 
            placeholder="Optional"
            value={formData.contact.studentMobile}
            onChange={(val) => handleChange('contact', 'studentMobile', val)}
          />
        </div>
        <InputField 
          label="Email Address" 
          placeholder="student@example.com"
          value={formData.contact.email}
          onChange={(val) => handleChange('contact', 'email', val)}
        />
      </section>

      {/* 3. Parent Details */}
      <section className="mb-8">
        <SectionHeader icon={Users} title="Parent Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InputField 
            label="Father's Name" 
            placeholder="Full Name"
            value={formData.parents.father.name}
            onChange={(val) => handleChange('parents', 'name', val, 'father')} // Note: Logic tweaked for deep nest
          />
          <InputField 
            label="Father's Occupation" 
            placeholder="Occupation"
            value={formData.parents.father.occupation}
            onChange={(val) => handleChange('parents', 'occupation', val, 'father')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Mother's Name" 
            placeholder="Full Name"
            value={formData.parents.mother.name}
            onChange={(val) => handleChange('parents', 'name', val, 'mother')}
          />
          <InputField 
            label="Mother's Occupation" 
            placeholder="Occupation"
            value={formData.parents.mother.occupation}
            onChange={(val) => handleChange('parents', 'occupation', val, 'mother')}
          />
        </div>
      </section>

      {/* 4. Academic History (The Beige Blocks) */}
      <section className="mb-8">
        <SectionHeader icon={GraduationCap} title="Academic History" />
        
        <AcademicBlock 
          title="SSC / 10th Standard" 
          section="ssc"
          data={formData.academics.ssc} 
          onChange={handleAcademicChange} 
        />
        
        <AcademicBlock 
          title="11th Standard" 
          section="eleventh"
          data={formData.academics.eleventh} 
          onChange={handleAcademicChange} 
        />
      </section>

      {/* 5. Additional Details */}
      <section className="mb-8">
        <SectionHeader icon={FileText} title="Additional Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InputField 
            label="How did you hear about us?" 
            placeholder="Reference (Friend, Ad, etc.)"
            value={formData.reference}
            onChange={(val) => handleChange('reference', null, val)}
          />
          <InputField 
            label="Special Requirements" 
            placeholder="Any special needs?"
            value={formData.specialRequirement}
            onChange={(val) => handleChange('specialRequirement', null, val)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 ml-1">Notes / Remarks</label>
          <textarea
            rows="3"
            placeholder="Any additional comments..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 
                       placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 
                       transition-all shadow-sm resize-none"
            value={formData.interestedStudentNote}
            onChange={(e) => handleChange('interestedStudentNote', null, e.target.value)}
          ></textarea>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-[#2c3e50] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#1e2b3a] transition-colors shadow-lg shadow-slate-200"
        >
          Submit Inquiry
        </button>
      </div>
    </form>
  );
};

export default InquiryForm;