import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './features/auth/pages/Login';
import Dashboard from './features/dashboard/pages/Dashboard';
import NotFound from './features/misc/pages/NotFound';
import PrivateRoute from './shared/components/PrivateRoute';
import Layout from './layouts/Layout';

import { Toaster } from 'react-hot-toast';

// Lazy loaded components applicable for deferred loading
const Inquiries = lazy(() => import('./features/inquiry/pages/Inquiries'));
const InquiryDetail = lazy(() => import('./features/inquiry/pages/InquiryDetail'));
const Admissions = lazy(() => import('./features/admission/pages/Admissions'));
const AdmissionDetail = lazy(() => import('./features/admission/pages/AdmissionDetail'));
const Students = lazy(() => import('./features/student/pages/Students'));
const StudentDetail = lazy(() => import('./features/student/pages/StudentDetail'));
const Batches = lazy(() => import('./features/batch/pages/Batches'));
const BatchDetail = lazy(() => import('./features/batch/pages/BatchDetail'));
const Attendance = lazy(() => import('./features/attendance/pages/Attendance'));
const MarkAttendance = lazy(() => import('./features/attendance/pages/MarkAttendance'));
const AttendanceDetail = lazy(() => import('./features/attendance/pages/AttendanceDetail'));
const AttendanceStats = lazy(() => import('./features/attendance/pages/AttendanceStats'));
const FeeManagement = lazy(() => import('./features/fee/pages/FeeManagement'));
const FeeDetail = lazy(() => import('./features/fee/pages/FeeDetail'));
const ProcessPayment = lazy(() => import('./features/fee/pages/ProcessPayment'));
const Receipt = lazy(() => import('./features/fee/pages/Receipt'));
const Tests = lazy(() => import('./features/test/pages/Tests'));
const OverallPerformance = lazy(() => import('./features/test/pages/OverallPerformance'));
const TestDetail = lazy(() => import('./features/test/pages/TestDetail'));
import { GlobalLoader } from './shared';
import ErrorBoundary from './shared/components/ErrorBoundary';

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <Toaster position="top-right" />
          <Suspense fallback={<GlobalLoader />}>
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
                  <Route path="/tests/performance" element={<OverallPerformance />} />
                  <Route path="/tests/:testId" element={<TestDetail />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;