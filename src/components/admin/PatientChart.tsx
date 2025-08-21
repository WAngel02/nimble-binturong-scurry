import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from '../LoadingSpinner';

const PatientChart = () => {
  const [chartData, setChartData] = useState<{ name: string; Pacientes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const dateTo = new Date();
        const dateFrom = subDays(dateTo, 6);

        const { data, error } = await supabase
          .from('patients')
          .select('created_at')
          .gte('created_at', dateFrom.toISOString())
          .lte('created_at', dateTo.toISOString());

        if (error) {
          throw error;
        }

        const dailyCounts = new Map<string, number>();
        for (let i = 0; i < 7; i++) {
          const d = subDays(dateTo, i);
          dailyCounts.set(format(d, 'yyyy-MM-dd'), 0);
        }

        data.forEach(patient => {
          const day = format(new Date(patient.created_at), 'yyyy-MM-dd');
          if (dailyCounts.has(day)) {
            dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
          }
        });

        const formattedData = Array.from(dailyCounts.entries())
          .map(([date, count]) => ({
            name: format(new Date(date), 'eee', { locale: es }),
            Pacientes: count,
          }))
          .reverse(); // To show from past to present

        setChartData(formattedData);
      } catch (error: any) {
        toast({ title: "Error", description: "No se pudieron cargar los datos del gráfico de pacientes.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Nuevos Pacientes (Últimos 7 Días)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <LoadingSpinner />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Pacientes" fill="#4A90E2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientChart;