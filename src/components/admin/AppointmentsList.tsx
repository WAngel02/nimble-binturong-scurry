import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Appointment, Profile } from '@/types';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAssignDoctor = async (appointmentId: string, doctorId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ doctor_id: doctorId })
      .eq('id', appointmentId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo asignar el doctor.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Doctor asignado correctamente.' });
      fetchAppointmentsAndDoctors();
    }
  };

  const handleCreateProfile = async (appointment: Appointment) => {
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({ full_name: appointment.full_name, email: appointment.email, phone: appointment.phone })
      .select().single();

    if (patientError) {
      toast({ title: 'Error', description: 'No se pudo crear el perfil del paciente.', variant: 'destructive' });
      return;
    }

    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', patient_id: patient.id })
      .eq('id', appointment.id);

    if (appointmentError) {
      toast({ title: 'Error', description: 'No se pudo actualizar la cita.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Perfil de paciente creado y cita confirmada.' });
      fetchAppointmentsAndDoctors();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas para Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando citas...</div>
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
                    {appointment.doctor_id ? (
                      <span>Doctor Asignado</span>
                    ) : (
                      <Select onValueChange={(doctorId) => handleAssignDoctor(appointment.id, doctorId)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Asignar doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>{doc.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={appointment.status === 'pending' ? 'secondary' : 'default'}>
                      {appointment.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {appointment.status === 'pending' && (
                      <Button size="sm" onClick={() => handleCreateProfile(appointment)} disabled={!appointment.doctor_id}>
                        Confirmar y Crear Perfil
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No hay citas para hoy.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;