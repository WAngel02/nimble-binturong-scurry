import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const DoctorDashboard = () => {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!session) return;
      setLoading(true);
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', session.user.id)
        .gte('appointment_date', startOfDay)
        .lte('appointment_date', endOfDay)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({ title: 'Error', description: 'No se pudieron cargar tus citas.', variant: 'destructive' });
      } else {
        setAppointments(data as Appointment[]);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [session]);

  if (loading) {
    return <div>Cargando tus citas...</div>;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Citas para Hoy</h1>
        </div>
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No tienes citas para hoy.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;