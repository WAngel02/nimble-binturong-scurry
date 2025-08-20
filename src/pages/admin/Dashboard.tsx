import AppointmentsList from '@/components/admin/AppointmentsList';

const AdminDashboard = () => {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <AppointmentsList />
      </div>
    </div>
  );
};

export default AdminDashboard;