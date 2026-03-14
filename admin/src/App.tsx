import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MembershipProvider } from "./contexts/MembershipContext";
import BusinessOnlyRoute from "./components/BusinessOnlyRoute";
import SuperAdminOnlyRoute from "./components/SuperAdminOnlyRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Memberships from "./pages/Memberships";
import StoreLinks from "./pages/StoreLinks";
import Sales from "./pages/Sales";
import ItemsSold from "./pages/ItemsSold";
import OutOfStock from "./pages/OutOfStock";
import QrCode from "./pages/QrCode";
import CreateInvoice from "./pages/CreateInvoice";
import ManageSubscriptions from "./pages/ManageSubscriptions";
import Whisper from "./pages/Whisper";

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
      <Route
        path="/"
        element={
          <GuestOnlyRoute>
            <Landing />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnlyRoute>
            <SignupPage />
          </GuestOnlyRoute>
        }
      />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MembershipProvider>
              <DashboardLayout />
            </MembershipProvider>
          </ProtectedRoute>
        }>
        <Route index element={<Dashboard />} />
        <Route
          path="invoices"
          element={
            <BusinessOnlyRoute>
              <Invoices />
            </BusinessOnlyRoute>
          }
        />
        <Route
          path="invoices/new"
          element={
            <BusinessOnlyRoute>
              <CreateInvoice />
            </BusinessOnlyRoute>
          }
        />
        <Route
          path="sales"
          element={
            <BusinessOnlyRoute>
              <Sales />
            </BusinessOnlyRoute>
          }
        />
        <Route
          path="items-sold"
          element={
            <BusinessOnlyRoute>
              <ItemsSold />
            </BusinessOnlyRoute>
          }
        />
        <Route
          path="out-of-stock"
          element={
            <BusinessOnlyRoute>
              <OutOfStock />
            </BusinessOnlyRoute>
          }
        />
        <Route
          path="qr-code"
          element={
            <BusinessOnlyRoute>
              <QrCode />
            </BusinessOnlyRoute>
          }
        />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route
          path="memberships"
          element={
            <BusinessOnlyRoute>
              <Memberships />
            </BusinessOnlyRoute>
          }
        />
        <Route
          path="subscriptions"
          element={
            <SuperAdminOnlyRoute>
              <ManageSubscriptions />
            </SuperAdminOnlyRoute>
          }
        />
        <Route
          path="whisper"
          element={
            <SuperAdminOnlyRoute>
              <Whisper />
            </SuperAdminOnlyRoute>
          }
        />
        <Route
          path="store-links"
          element={
            <SuperAdminOnlyRoute>
              <StoreLinks />
            </SuperAdminOnlyRoute>
          }
        />
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
