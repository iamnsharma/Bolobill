import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/** Renders children only when user is NOT authenticated. Authenticated users are redirected to dashboard. */
export default function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
