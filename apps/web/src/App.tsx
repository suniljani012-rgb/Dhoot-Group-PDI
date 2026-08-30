import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { YardReceivingPage } from './pages/YardReceiving';
import { BookingsPage } from './pages/Bookings';
import { VehiclesPage } from './pages/Vehicles';
import { VehicleDetailPage } from './pages/VehicleDetail';
import { PdiQueuePage } from './pages/PdiQueue';
import { PdiSessionPage } from './pages/PdiSession';
import { RepairsPage } from './pages/Repairs';
import { QaQueuePage } from './pages/QaQueue';
import { ChallanInvoicingPage } from './pages/ChallanInvoicing';
import { CertificateViewPage } from './pages/CertificateView';
import { AdminMasterPanelPage } from './pages/AdminMasterPanel';
import { ReportsPage } from './pages/Reports';
import { AppShell } from './components/layout/AppShell';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell>{children}</AppShell>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receiving"
            element={
              <ProtectedRoute>
                <YardReceivingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <VehicleDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdi"
            element={
              <ProtectedRoute>
                <PdiQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdi/:id"
            element={
              <ProtectedRoute>
                <PdiSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <ProtectedRoute>
                <RepairsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa"
            element={
              <ProtectedRoute>
                <QaQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoicing"
            element={
              <ProtectedRoute>
                <ChallanInvoicingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans"
            element={
              <ProtectedRoute>
                <ChallanInvoicingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates/:id"
            element={
              <ProtectedRoute>
                <CertificateViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminMasterPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
