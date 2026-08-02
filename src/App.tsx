import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Patient pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientBookAppointment } from './pages/patient/PatientBookAppointment';
import { PatientLiveQueue } from './pages/patient/PatientLiveQueue';
import { PatientMedicalHistory } from './pages/patient/PatientMedicalHistory';
import { PatientPrescriptions } from './pages/patient/PatientPrescriptions';
import { PatientBills } from './pages/patient/PatientBills';

// Doctor pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorQueue } from './pages/doctor/DoctorQueue';
import { DoctorConsultation } from './pages/doctor/DoctorConsultation';

// Receptionist pages
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';
import { ReceptionistBilling } from './pages/receptionist/ReceptionistBilling';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminPatients } from './pages/admin/AdminPatients';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Protected Route Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Loading MediCare360...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to proper dashboard based on role
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-slate-50">
                <Navbar />
                <LandingPage />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-slate-100">
                <Navbar />
                <LoginPage />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-slate-100">
                <Navbar />
                <RegisterPage />
              </div>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patient/book"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientBookAppointment />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patient/live-queue"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientLiveQueue />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patient/medical-history"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientMedicalHistory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientPrescriptions />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patient/bills"
            element={
              <ProtectedLayout allowedRoles={['PATIENT']}>
                <PatientBills />
              </ProtectedLayout>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedLayout allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/doctor/queue"
            element={
              <ProtectedLayout allowedRoles={['DOCTOR']}>
                <DoctorQueue />
              </ProtectedLayout>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedLayout allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/doctor/consultation/:appointmentId"
            element={
              <ProtectedLayout allowedRoles={['DOCTOR']}>
                <DoctorConsultation />
              </ProtectedLayout>
            }
          />

          {/* Receptionist Routes */}
          <Route
            path="/receptionist/dashboard"
            element={
              <ProtectedLayout allowedRoles={['RECEPTIONIST']}>
                <ReceptionistDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/receptionist/patients"
            element={
              <ProtectedLayout allowedRoles={['RECEPTIONIST']}>
                <ReceptionistDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/receptionist/appointments"
            element={
              <ProtectedLayout allowedRoles={['RECEPTIONIST']}>
                <ReceptionistDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/receptionist/billing"
            element={
              <ProtectedLayout allowedRoles={['RECEPTIONIST']}>
                <ReceptionistBilling />
              </ProtectedLayout>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <AdminDoctors />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <AdminDepartments />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <AdminPatients />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <AdminAppointments />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <AdminAuditLogs />
              </ProtectedLayout>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
