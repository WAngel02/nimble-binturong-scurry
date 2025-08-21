import DashboardStats from '@/components/admin/DashboardStats';
import AppointmentsWidget from '@/components/admin/AppointmentsWidget';
import PatientChart from '@/components/admin/PatientChart';

const AdminDashboard = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50/50">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
        <p className="text-muted-foreground text-sm">
          Accede a un resumen detallado de las métricas clave y resultados de pacientes.
        </p>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PatientChart />
        </div>
        <div className="lg:col-span-1">
          {/* Placeholder for Most Demanded Chart */}
          <div className="h-full bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900">Especialidades más Solicitadas</h3>
            <p className="text-sm text-muted-foreground mt-4 text-center">Gráfico de radar próximamente...</p>
          </div>
        </div>
      </div>

      <AppointmentsWidget />
    </div>
  );
};

export default AdminDashboard;