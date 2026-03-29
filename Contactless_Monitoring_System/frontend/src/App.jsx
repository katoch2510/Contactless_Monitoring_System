import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AdminLayout from './components/Layout/AdminLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/Admin/DashboardScreen';
import VisitorRegistration from './pages/Visitor/VisitorRegistration';
import PendingApprovals from './pages/Admin/PendingApprovals';
import EntryLogs from './pages/Admin/EntryLogs';
import QRScanner from './pages/Security/QRScanner';
import StudentRegistration from './pages/Admin/StudentRegistration';
import FacultyRegistration from './pages/Admin/FacultyRegistration';
import InstitutionManager from './pages/Admin/InstitutionManager';

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/visit-register" element={<VisitorRegistration />} />
        <Route path="/login" element={<LoginScreen />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardScreen />} />
          <Route path="approvals" element={<PendingApprovals />} />
          <Route path="logs" element={<EntryLogs />} />
          <Route path="register-student" element={<StudentRegistration />} />
          <Route path="register-faculty" element={<FacultyRegistration />} />
          <Route path="institutions" element={<InstitutionManager />} />
        </Route>

        {/* Security Scanner */}
        <Route path="/scanner" element={<QRScanner />} />
      </Routes>
    </Router>
  );
};

export default App;
