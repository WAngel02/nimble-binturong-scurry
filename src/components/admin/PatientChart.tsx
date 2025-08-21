import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sun', Male: 4, Female: 8 },
  { name: 'Mon', Male: 3, Female: 6 },
  { name: 'Tue', Male: 2, Female: 4 },
  { name: 'Wed', Male: 5, Female: 7 },
  { name: 'Thu', Male: 4, Female: 8 },
  { name: 'Fri', Male: 6, Female: 9 },
  { name: 'Sat', Male: 3, Female: 5 },
];

const PatientChart = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Patient Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="Male" fill="#F5A623" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Female" fill="#4A90E2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PatientChart;