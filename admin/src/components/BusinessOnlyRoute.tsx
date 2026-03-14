import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Renders children only for business admins. Super admins are redirected to dashboard. */
export default function BusinessOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = useAuth();
  if (isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
