"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartProps {
  data: Array<{ date: string; views: number; reads: number }>;
}

export default function AnalyticsChart({ data }: ChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(val: string) => {
              const d = new Date(val);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#0066CC" strokeWidth={2} name="Page Views" dot={false} />
          <Line type="monotone" dataKey="reads" stroke="#10B981" strokeWidth={2} name="Article Reads" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
