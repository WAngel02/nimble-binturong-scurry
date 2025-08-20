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
import { UserPlus, UserCheck } from 'lucide-react';

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

  const handleCreatePatient = async (appointment: Appointment) => {
    try {
      // Verificar si ya existe un paciente con este email
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('id')
        .eq('email', appointment.email)
        .maybeSingle();

      if (checkError) {
        toast({ title: 'Error', description: 'Error al verificar paciente existente.', variant: 'destructive' });
        return;
      }

      let patientId;

      if (existingPatient) {
        patientId = existingPatient.id;
        toast({ title: 'Info', description: 'El paciente ya existe en el sistema.' });
      } else {
        // Crear nuevo paciente
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({ 
            full_name: appointment.full_name, 
            email: appointment.email, 
            phone: appointment.phone 
          })
          .select()
          .single();

        if (patientError) {
          toast({ title: 'Error', description: 'No se pudo crear el perfil del paciente.', variant: 'destructive' });
          return;
        }

        patientId = newPatient.id;
        toast({ title: 'Éxito', description: 'Paciente creado correctamente.' });
      }

      // Actualizar la cita
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed', patient_id: patientId })
        .eq('id', appointment.id);

      if (appointmentError) {
        toast({ title: 'Error', description: 'No se pudo actualizar la cita.', variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: 'Cita confirmada y vinculada al paciente.' });
        fetchAppointmentsAndDoctors();
      }
    } catch (err) {
      console.error('Error creating patient:', err);
      toast({ title: 'Error', description: 'Error inesperado al crear el paciente.', variant: 'destructive' });
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.full_name : 'Doctor no encontrado';
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
                    {appointment.phone && (
                      <div className="text-sm text-muted-foreground">{appointment.phone}</div>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(appointment.appointment_date), 'p', { locale: es })}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{appointment.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    {appointment.doctor_id ? (
                      <span className="text-sm font-medium">{getDoctorName(appointment.doctor_id)}</span>
                    ) : (
                      <Select onValueChange={(doctorId) => handleAssignDoctor(appointment.id, doctorId)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Asignar doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors
                            .filter(doc => doc.specialty === appointment.specialty || !doc.specialty)
                            .map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.full_name}
                              </SelectItem>
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
                    <div className="flex space-x-2">
                      {appointment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCreatePatient(appointment)}
                          disabled={!appointment.doctor_id}
                          className="flex items-center space-x-1"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Crear Paciente</span>
                        </Button>
                      )}
                      {appointment.patient_id && (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <UserCheck className="h-3 w-3" />
                          <span>Paciente Registrado</span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No hay citas para hoy.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;