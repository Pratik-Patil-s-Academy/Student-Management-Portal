import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inquiries from './pages/Inquiries';
import InquiryDetail from './pages/InquiryDetail';
import Admissions from './pages/Admissions';
import AdmissionDetail from './pages/AdmissionDetail';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Attendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceDetail from './pages/AttendanceDetail';
import AttendanceStats from './pages/AttendanceStats';
import FeeManagement from './pages/FeeManagement';
import FeeDetail from './pages/FeeDetail';
import ProcessPayment from './pages/ProcessPayment';
import Receipt from './pages/Receipt';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inquiries" element={<Inquiries />} />
              <Route path="/inquiries/:id" element={<InquiryDetail />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/admissions/:id" element={<AdmissionDetail />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/batches/:id" element={<BatchDetail />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/mark" element={<MarkAttendance />} />
              <Route path="/attendance/stats" element={<AttendanceStats />} />
              <Route path="/attendance/:id" element={<AttendanceDetail />} />
              <Route path="/fees" element={<FeeManagement />} />
              <Route path="/fees/student/:studentId" element={<FeeDetail />} />
              <Route path="/fees/payment/:studentId" element={<ProcessPayment />} />
              <Route path="/fees/receipt/:studentId" element={<Receipt />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/tests/:testId" element={<TestDetail />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;