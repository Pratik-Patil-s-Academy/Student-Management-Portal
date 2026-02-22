import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import { Toaster } from 'react-hot-toast';

// Lazy loaded components applicable for deferred loading
const Inquiries = lazy(() => import('./pages/Inquiries'));
const InquiryDetail = lazy(() => import('./pages/InquiryDetail'));
const Admissions = lazy(() => import('./pages/Admissions'));
const AdmissionDetail = lazy(() => import('./pages/AdmissionDetail'));
const Students = lazy(() => import('./pages/Students'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const Batches = lazy(() => import('./pages/Batches'));
const BatchDetail = lazy(() => import('./pages/BatchDetail'));
const Attendance = lazy(() => import('./pages/Attendance'));
const MarkAttendance = lazy(() => import('./pages/MarkAttendance'));
const AttendanceDetail = lazy(() => import('./pages/AttendanceDetail'));
const AttendanceStats = lazy(() => import('./pages/AttendanceStats'));
const FeeManagement = lazy(() => import('./pages/FeeManagement'));
const FeeDetail = lazy(() => import('./pages/FeeDetail'));
const ProcessPayment = lazy(() => import('./pages/ProcessPayment'));
const Receipt = lazy(() => import('./pages/Receipt'));
const Tests = lazy(() => import('./pages/Tests'));
const TestDetail = lazy(() => import('./pages/TestDetail'));
import { MessageLoading } from './components/ui/message-loading';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><MessageLoading /></div>}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;