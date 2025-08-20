import { useAuth } from '@/providers/AuthProvider';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';

const DashboardPage = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Cargando panel...</div>
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (profile?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div>No tienes un rol asignado. Contacta al administrador.</div>
    </div>
  );
};

export default DashboardPage;