import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      navigate('/admin/login');
      return;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      // Optional: redirect to an "unauthorized" page or back to login
      navigate('/admin/login');
    }
  }, [session, profile, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  if (session && (!allowedRoles || (profile && allowedRoles.includes(profile.role)))) {
    return <>{children}</>;
  }

  return null;
};

export default ProtectedRoute;