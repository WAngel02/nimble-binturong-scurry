import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarCheck, Stethoscope } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, description, icon, chartData, chartColor }: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  chartData: { v: number }[];
  chartColor: string;
}) => (
  <Card className="shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="w-28 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip
                contentStyle={{ display: 'none' }}
                wrapperStyle={{ display: 'none' }}
              />
              <Line type="monotone" dataKey="v" stroke={chartColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LoadingStatCard = () => (
    <Card className="shadow-md">
        <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-20" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-end justify-between">
                <div>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-12 w-28" />
            </div>
        </CardContent>
    </Card>
);

const DashboardStats = () => {
    const [stats, setStats] = useState({
        patients: { total: 0, recent: 0, chartData: [] as {v: number}[] },
        appointments: { total: 0, recent: 0, chartData: [] as {v: number}[] },
        doctors: { total: 0, recent: 0, chartData: [] as {v: number}[] },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const sevenDaysAgoISO = sevenDaysAgo.toISOString();

                // Process data for charts
                const processDataForChart = (data: { created_at: string }[] | null) => {
                    const dailyCounts = new Map<string, number>();
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        dailyCounts.set(d.toISOString().split('T')[0], 0);
                    }

                    if (data) {
                        data.forEach(item => {
                            const day = item.created_at.split('T')[0];
                            if (dailyCounts.has(day)) {
                                dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
                            }
                        });
                    }
                    
                    return Array.from(dailyCounts.values()).map(count => ({ v: count }));
                };

                // Fetch Patients
                const { count: patientsCount, error: patientsError } = await supabase.from('patients').select('*', { count: 'exact', head: true });
                const { data: recentPatients, error: recentPatientsError } = await supabase.from('patients').select('created_at').gte('created_at', sevenDaysAgoISO);
                
                // Fetch Appointments
                const { count: appointmentsCount, error: appointmentsError } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
                const { data: recentAppointments, error: recentAppointmentsError } = await supabase.from('appointments').select('created_at').gte('created_at', sevenDaysAgoISO);

                // Fetch Doctors
                const { count: doctorsCount, error: doctorsError } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor');

                if (patientsError || recentPatientsError || appointmentsError || recentAppointmentsError || doctorsError) {
                    console.error({ patientsError, recentPatientsError, appointmentsError, recentAppointmentsError, doctorsError });
                    throw new Error('Error al cargar los datos de estadísticas.');
                }

                setStats({
                    patients: {
                        total: patientsCount ?? 0,
                        recent: recentPatients?.length ?? 0,
                        chartData: processDataForChart(recentPatients),
                    },
                    appointments: {
                        total: appointmentsCount ?? 0,
                        recent: recentAppointments?.length ?? 0,
                        chartData: processDataForChart(recentAppointments),
                    },
                    doctors: {
                        total: doctorsCount ?? 0,
                        recent: 0, // Cannot track new doctors easily
                        chartData: Array(7).fill({ v: 0 }),
                    },
                });

            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <LoadingStatCard />
                <LoadingStatCard />
                <LoadingStatCard />
            </div>
        );
    }

    const statData = [
      {
        title: 'Pacientes',
        value: stats.patients.total.toLocaleString(),
        description: `+${stats.patients.recent} nuevos en los últimos 7 días`,
        icon: <Users className="h-6 w-6 text-blue-500" />,
        chartData: stats.patients.chartData,
        chartColor: '#3b82f6',
      },
      {
        title: 'Citas',
        value: stats.appointments.total.toLocaleString(),
        description: `+${stats.appointments.recent} nuevas en los últimos 7 días`,
        icon: <CalendarCheck className="h-6 w-6 text-green-500" />,
        chartData: stats.appointments.chartData,
        chartColor: '#22c55e',
      },
      {
        title: 'Doctores',
        value: stats.doctors.total.toLocaleString(),
        description: 'Total de doctores activos',
        icon: <Stethoscope className="h-6 w-6 text-yellow-500" />,
        chartData: stats.doctors.chartData,
        chartColor: '#eab308',
      },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statData.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default DashboardStats;