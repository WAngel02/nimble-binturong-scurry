import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Appointment } from '@/types';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', startOfDay)
      .lte('appointment_date', endOfDay)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar las citas.', variant: 'destructive' });
    } else {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateProfile = async (appointment: Appointment) => {
    // 1. Create patient profile
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({
        full_name: appointment.full_name,
        email: appointment.email,
        phone: appointment.phone,
      })
      .select()
      .single();

    if (patientError) {
      console.error('Error creating patient:', patientError);
      toast({ title: 'Error', description: 'No se pudo crear el perfil del paciente.', variant: 'destructive' });
      return;
    }

    // 2. Update appointment status and link patient
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', patient_id: patient.id })
      .eq('id', appointment.id);

    if (appointmentError) {
      console.error('Error updating appointment:', appointmentError);
      toast({ title: 'Error', description: 'No se pudo actualizar la cita.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Perfil de paciente creado y cita confirmada.' });
      fetchAppointments(); // Refresh the list
    }
  };

  if (loading) {
    return <div>Cargando citas...</div>;
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
              <TableHead>Especialidad</TableHead>
              <TableHead>Hora</TableHead>
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
                  <TableCell>{appointment.specialty}</TableCell>
                  <TableCell>{format(new Date(appointment.appointment_date), 'p', { locale: es })}</TableCell>
                  <TableCell>
                    <Badge variant={appointment.status === 'pending' ? 'secondary' : 'default'}>
                      {appointment.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {appointment.status === 'pending' && (
                      <Button size="sm" onClick={() => handleCreateProfile(appointment)}>
                        Confirmar y Crear Perfil
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay citas para hoy.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;