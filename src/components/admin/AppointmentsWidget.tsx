import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';

const AppointmentsWidget = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctor:profiles(full_name)')
        .limit(5)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data as any);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  const statusMap: { [key: string]: { text: string; variant: 'secondary' | 'default' | 'destructive' } } = {
    pending: { text: 'Pending', variant: 'secondary' },
    confirmed: { text: 'Confirmed', variant: 'default' },
    cancelled: { text: 'Cancelled', variant: 'destructive' },
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Appointment Date & Time</TableHead>
              <TableHead>Treatment Types</TableHead>
              <TableHead>Doctor Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
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
                      <AvatarImage src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${(appointment.doctor as any)?.full_name}`} />
                      <AvatarFallback>{(appointment.doctor as any)?.full_name?.charAt(0) || 'N'}</AvatarFallback>
                    </Avatar>
                    <span>{(appointment.doctor as any)?.full_name || 'Not Assigned'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusMap[appointment.status]?.variant || 'secondary'}>
                    {statusMap[appointment.status]?.text || appointment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AppointmentsWidget;