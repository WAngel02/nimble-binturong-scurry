import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Appointment, Profile } from '@/types';
import { Edit, CalendarOff } from 'lucide-react';
import AppointmentEditModal from './AppointmentEditModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointmentsAndDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startOfDay)
        .lte('appointment_date', endOfDay)
        .order('appointment_date', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');

      if (doctorsError) throw doctorsError;

      setAppointments(appointmentsData as Appointment[]);
      setDoctors(doctorsData as Profile[]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
      toast({ title: 'Error', description: 'No se pudieron cargar las citas.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndDoctors();
  }, []);

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.full_name : 'No asignado';
  };

  const statusMap: { [key: string]: { text: string; variant: 'secondary' | 'default' | 'destructive' } } = {
    pending: { text: 'Pendiente', variant: 'secondary' },
    confirmed: { text: 'Confirmada', variant: 'default' },
    cancelled: { text: 'Cancelada', variant: 'destructive' },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas para Hoy</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas para Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Citas para Hoy ({format(new Date(), 'PPP', { locale: es })})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Doctor Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="font-medium">{appointment.full_name}</div>
                      <div className="text-sm text-muted-foreground">{appointment.email}</div>
                    </TableCell>
                    <TableCell>{format(new Date(appointment.appointment_date), 'p', { locale: es })}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{appointment.specialty}</Badge>
                    </TableCell>
                    <TableCell>
                      {appointment.doctor_id ? (
                        <span className="text-sm font-medium">{getDoctorName(appointment.doctor_id)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[appointment.status]?.variant || 'secondary'}>
                        {statusMap[appointment.status]?.text || appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(appointment)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Ver/Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState 
                      icon={<CalendarOff className="h-8 w-8 text-muted-foreground" />}
                      title="No hay citas para hoy"
                      description="No hay citas programadas para la fecha de hoy."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AppointmentEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
        onUpdate={fetchAppointmentsAndDoctors}
      />
    </>
  );
};

export default AppointmentsList;