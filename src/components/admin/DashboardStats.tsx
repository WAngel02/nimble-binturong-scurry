import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CalendarX, CalendarCheck } from 'lucide-react';
import { startOfDay, endOfDay, addDays, startOfMonth, endOfMonth } from 'date-fns';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    today: 0,
    next7Days: 0,
    cancelled: 0,
    attendedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const now = new Date();
      
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();
      const next7DaysEnd = endOfDay(addDays(now, 7)).toISOString();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', todayStart)
        .lte('appointment_date', todayEnd);

      const { count: next7DaysCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', todayStart)
        .lte('appointment_date', next7DaysEnd);

      const { count: cancelledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled')
        .gte('appointment_date', monthStart)
        .lte('appointment_date', monthEnd);

      const { count: attendedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')
        .gte('appointment_date', monthStart)
        .lte('appointment_date', monthEnd);

      setStats({
        today: todayCount ?? 0,
        next7Days: next7DaysCount ?? 0,
        cancelled: cancelledCount ?? 0,
        attendedThisMonth: attendedCount ?? 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Citas del Día', value: stats.today, icon: <Calendar className="h-6 w-6 text-muted-foreground" /> },
    { title: 'Próximos 7 Días', value: stats.next7Days, icon: <CalendarCheck className="h-6 w-6 text-muted-foreground" /> },
    { title: 'Citas Canceladas (Mes)', value: stats.cancelled, icon: <CalendarX className="h-6 w-6 text-muted-foreground" /> },
    { title: 'Pacientes Atendidos (Mes)', value: stats.attendedThisMonth, icon: <Users className="h-6 w-6 text-muted-foreground" /> },
  ];

  if (loading) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;