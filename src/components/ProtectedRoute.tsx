import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/providers/SessionProvider';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <div>Cargando...</div>; // O un componente de spinner
  }

  if (session) {
    return <>{children}</>;
  }

  return null;
};

export default ProtectedRoute;