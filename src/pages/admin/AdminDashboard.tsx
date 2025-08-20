import DashboardStats from '@/components/admin/DashboardStats';
import AppointmentsList from '@/components/admin/AppointmentsList';

const AdminDashboard = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-muted-foreground">Una vista general de la actividad de tu centro médico.</p>
      </div>
      <DashboardStats />
      <AppointmentsList />
    </div>
  );
};

export default AdminDashboard;