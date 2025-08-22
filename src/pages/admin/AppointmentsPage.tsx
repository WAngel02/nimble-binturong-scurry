import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppointmentCalendar from '@/components/admin/AppointmentCalendar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/components/ui/use-toast';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        const { data: doctorsData, error: doctorsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'doctor');

        if (doctorsError) throw doctorsError;

        const doctorMap = new Map(doctorsData.map(doc => [doc.id, doc.full_name]));

        const appointmentsWithDoctors = appointmentsData.map(apt => {
          const doctorName = apt.doctor_id ? doctorMap.get(apt.doctor_id) : undefined;
          return {
            ...apt,
            doctor: doctorName ? { full_name: doctorName } : undefined,
          };
        });

        setAppointments(appointmentsWithDoctors as Appointment[]);
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        toast({ title: 'Error', description: 'No se pudieron cargar las citas.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    if (view === 'list') {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [view]);

  const statusMap: { [key: string]: { text: string; variant: 'secondary' | 'default' | 'destructive' } } = {
    pending: { text: 'Pendiente', variant: 'secondary' },
    confirmed: { text: 'Confirmada', variant: 'default' },
    cancelled: { text: 'Cancelada', variant: 'destructive' },
  };

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-96">
                  <div className="flex justify-center items-center">
                    <LoadingSpinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${appointment.full_name}`} />
                        <AvatarFallback>{appointment.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{appointment.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(appointment.appointment_date), "dd, MMM, yyyy, p", { locale: es })}</TableCell>
                  <TableCell>{appointment.specialty}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${appointment.doctor?.full_name}`} />
                        <AvatarFallback>{appointment.doctor?.full_name?.charAt(0) || 'N'}</AvatarFallback>
                      </Avatar>
                      <span>{appointment.doctor?.full_name || 'No Asignado'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[appointment.status]?.variant || 'secondary'}>
                      {statusMap[appointment.status]?.text || appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState 
                    icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
                    title="No hay citas"
                    description="Aún no se han registrado citas en el sistema."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Citas</h1>
          <p className="text-muted-foreground mt-2">Visualiza y administra todas las citas.</p>
        </div>
        <div>
          <Button variant="outline" onClick={() => setView(view === 'list' ? 'calendar' : 'list')}>
            {view === 'list' ? <Calendar className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
            {view === 'list' ? 'Vista Calendario' : 'Vista de Lista'}
          </Button>
        </div>
      </div>
      {view === 'list' ? renderListView() : <AppointmentCalendar />}
    </div>
  );
};

export default AppointmentsPage;