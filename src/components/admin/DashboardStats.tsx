import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarX, CalendarCheck } from 'lucide-react';
import { startOfDay, endOfDay, addDays, startOfMonth, endOfMonth } from 'date-fns';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    next7Days: 0,
    cancelled: 0,
    attendedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const now = new Date();
        
        const todayStart = startOfDay(now).toISOString();
        const next7DaysEnd = endOfDay(addDays(now, 7)).toISOString();
        const monthStart = startOfMonth(now).toISOString();
        const monthEnd = endOfMonth(now).toISOString();

        const { count: next7DaysCount, error: next7DaysError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('appointment_date', todayStart)
          .lte('appointment_date', next7DaysEnd);

        if (next7DaysError) throw next7DaysError;

        const { count: cancelledCount, error: cancelledError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled')
          .gte('appointment_date', monthStart)
          .lte('appointment_date', monthEnd);

        if (cancelledError) throw cancelledError;

        const { count: attendedCount, error: attendedError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .gte('appointment_date', monthStart)
          .lte('appointment_date', monthEnd);

        if (attendedError) throw attendedError;

        setStats({
          next7Days: next7DaysCount ?? 0,
          cancelled: cancelledCount ?? 0,
          attendedThisMonth: attendedCount ?? 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Próximos 7 Días', value: stats.next7Days, icon: <CalendarCheck className="h-6 w-6 text-muted-foreground" /> },
    { title: 'Citas Canceladas (Mes)', value: stats.cancelled, icon: <CalendarX className="h-6 w-6 text-muted-foreground" /> },
    { title: 'Pacientes Atendidos (Mes)', value: stats.attendedThisMonth, icon: <Users className="h-6 w-6 text-muted-foreground" /> },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-premium-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((card, index) => (
        <Card key={index} className="shadow-premium-md transition-all hover:shadow-premium-lg hover:-translate-y-1">
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