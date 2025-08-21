import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientAppointmentsListProps {
  patientId: string;
}

const PatientAppointmentsList = ({ patientId }: PatientAppointmentsListProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch appointments for the patient
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        setLoading(false);
        return;
      }

      setAppointments(appointmentsData || []);

      // Fetch all doctors to map their names
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'doctor');

      if (doctorsError) {
        console.error('Error fetching doctors:', doctorsError);
      } else {
        const doctorMap = new Map<string, string>();
        doctorsData.forEach(doc => {
          if (doc.full_name) {
            doctorMap.set(doc.id, doc.full_name);
          }
        });
        setDoctors(doctorMap);
      }

      setLoading(false);
    };

    fetchData();
  }, [patientId]);

  if (loading) {
    return <div className="text-center py-8">Cargando historial de consultas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Consultas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.appointment_date), 'PPP p', { locale: es })}
                  </TableCell>
                  <TableCell>{appointment.specialty}</TableCell>
                  <TableCell>
                    {appointment.doctor_id ? doctors.get(appointment.doctor_id) || 'No asignado' : 'No asignado'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={appointment.status === 'pending' ? 'secondary' : appointment.status === 'confirmed' ? 'default' : 'destructive'}>
                      {appointment.status === 'pending' ? 'Pendiente' : appointment.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No hay consultas registradas para este paciente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PatientAppointmentsList;