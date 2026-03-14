import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MembershipProvider } from './contexts/MembershipContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Memberships from './pages/Memberships';
import ManageFeatures from './pages/ManageFeatures';
import StoreLinks from './pages/StoreLinks';
import Sales from './pages/Sales';
import ItemsSold from './pages/ItemsSold';
import OutOfStock from './pages/OutOfStock';
import CreateInvoice from './pages/CreateInvoice';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MembershipProvider>
              <DashboardLayout />
            </MembershipProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<CreateInvoice />} />
        <Route path="sales" element={<Sales />} />
        <Route path="items-sold" element={<ItemsSold />} />
        <Route path="out-of-stock" element={<OutOfStock />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="store-links" element={<StoreLinks />} />
        <Route path="manage-features" element={<ManageFeatures />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
