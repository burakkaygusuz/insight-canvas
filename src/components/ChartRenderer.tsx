'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { GeneratedChart } from '@/types/chart';

interface ChartRendererProps {
  chart: GeneratedChart;
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6'
];

export function ChartRenderer({ chart }: Readonly<ChartRendererProps>) {
  const { type, data, xAxisKey, dataKey } = chart;

  const renderChart = () => {
    switch (type) {
      case 'BAR':
        return (
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis dataKey={xAxisKey} className="text-xs text-slate-500" />
            <YAxis className="text-xs text-slate-500" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: '8px'
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'LINE':
        return (
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis dataKey={xAxisKey} className="text-xs text-slate-500" />
            <YAxis className="text-xs text-slate-500" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: '8px'
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      case 'AREA':
        return (
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis dataKey={xAxisKey} className="text-xs text-slate-500" />
            <YAxis className="text-xs text-slate-500" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: '8px'
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
            />
          </AreaChart>
        );
      case 'PIE':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#6366f1"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${String(entry[xAxisKey] ?? index)}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: '8px'
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <div className="flex h-full items-center justify-center text-slate-500">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
}
