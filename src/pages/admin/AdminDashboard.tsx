import DashboardStats from '@/components/admin/DashboardStats';
import AppointmentsList from '@/components/admin/AppointmentsList';
import AppointmentCalendar from '@/components/admin/AppointmentCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-muted-foreground">Una vista general de la actividad de tu centro médico.</p>
      </div>
      
      <DashboardStats />
      
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
          <TabsTrigger value="list">Lista de Citas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calendario de Citas</h2>
            <AppointmentCalendar />
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <AppointmentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;