import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import EmployeesList from './pages/employees/EmployeesList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import AttendancePage from './pages/attendance/AttendancePage';
import LeavesPage from './pages/leaves/LeavesPage';
import TrainingsPage from './pages/trainings/TrainingsPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 bg-light p-md-3 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeesList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LeavesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TrainingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AnnouncementsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
