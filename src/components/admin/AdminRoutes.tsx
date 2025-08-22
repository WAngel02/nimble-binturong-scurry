import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../LoadingSpinner';

const AdminRoutes = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      console.log('No session found, redirecting to login');
      navigate('/admin/login');
      return;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      console.log('User role not allowed:', profile.role, 'Required:', allowedRoles);
      navigate('/admin/login'); // Redirect to login if role is not allowed
      return;
    }
  }, [session, profile, loading, navigate, allowedRoles]);

  // Muestra el layout con un spinner en el área de contenido mientras se verifica la autenticación
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center w-full h-full p-8">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  // Después de cargar, si la sesión aún no está disponible o el rol es incorrecto,
  // muestra un mensaje de redirección mientras navigate() hace efecto.
  if (!session || (allowedRoles && profile && !allowedRoles.includes(profile.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderiza el layout con el contenido de la página
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoutes;