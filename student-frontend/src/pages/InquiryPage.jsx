import React from 'react';
import InquiryForm from './InquiryForm';

const InquiryPage = () => {
  return (
    // Main Page Background: Very light gray/white to let the shadow pop
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Student Admission Inquiry
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Begin your journey with us. Please fill out the form below to register your interest for the upcoming academic year.
          </p>
        </div>

        {/* Form Container */}
        <InquiryForm />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Student Management Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default InquiryPage;