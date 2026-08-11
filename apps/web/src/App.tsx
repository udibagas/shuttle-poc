import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { UserDashboard } from './pages/user/Dashboard';
import { UserBookings } from './pages/user/Bookings';
import { NewBooking } from './pages/user/NewBooking';
import { DriverDashboard } from './pages/driver/Dashboard';
import { DriverBookings } from './pages/driver/Bookings';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminDrivers } from './pages/admin/Drivers';
import { AdminUsers } from './pages/admin/Users';
import { AdminVehicles } from './pages/admin/Vehicles';
import { AdminLocations } from './pages/admin/Locations';
import { UserRole } from '@shuttle/types';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f2f5',
        }}
      >
        <Spin size="large" indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  switch (user.role) {
    case UserRole.USER:
      return <Navigate to="/user" replace />
    case UserRole.DRIVER:
      return <Navigate to="/driver" replace />
    case UserRole.ADMIN:
      return <Navigate to="/admin" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={[UserRole.USER]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/bookings"
        element={
          <ProtectedRoute allowedRoles={[UserRole.USER]}>
            <UserBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/bookings/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.USER]}>
            <NewBooking />
          </ProtectedRoute>
        }
      />

      {/* Driver Routes */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute allowedRoles={[UserRole.DRIVER]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/bookings"
        element={
          <ProtectedRoute allowedRoles={[UserRole.DRIVER]}>
            <DriverBookings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDrivers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vehicles"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminVehicles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/locations"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminLocations />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
