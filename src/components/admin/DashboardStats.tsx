import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarCheck, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const statData = [
  {
    title: 'Patient',
    value: '1,273',
    increase: '+86',
    description: 'Patient increase of 6% in 7 days',
    icon: <Users className="h-6 w-6 text-blue-500" />,
    chartData: [
      { v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 20 }, { v: 17 }, { v: 22 },
    ],
    chartColor: '#3b82f6',
  },
  {
    title: 'Appointment',
    value: '1,003',
    increase: '+120',
    description: 'Appointment increase of 12% in 7 days',
    icon: <CalendarCheck className="h-6 w-6 text-green-500" />,
    chartData: [
      { v: 12 }, { v: 10 }, { v: 14 }, { v: 13 }, { v: 19 }, { v: 21 }, { v: 25 },
    ],
    chartColor: '#22c55e',
  },
  {
    title: 'Total Visitors',
    value: '2,872',
    increase: '+206',
    description: 'Total visitor increase of 7% in 7 days',
    icon: <Activity className="h-6 w-6 text-yellow-500" />,
    chartData: [
      { v: 15 }, { v: 13 }, { v: 16 }, { v: 14 }, { v: 18 }, { v: 15 }, { v: 20 },
    ],
    chartColor: '#eab308',
  },
];

const StatCard = ({ title, value, increase, description, icon, chartData, chartColor }: typeof statData[0]) => (
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

const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;