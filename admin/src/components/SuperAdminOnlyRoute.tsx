import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Renders children only for super admins. Business admins are redirected to dashboard. */
export default function SuperAdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
