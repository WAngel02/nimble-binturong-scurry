import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/providers/SessionProvider';

const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/admin/login');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  return null;
};

export default AdminProtectedRoute;