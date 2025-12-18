'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
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

import { CHART_COLORS } from '@/lib/constants';
import { GeneratedChart } from '@/types/chart';

interface ChartRendererProps {
  chart: GeneratedChart;
}

export const ChartRenderer = memo(function ChartRenderer({ chart }: Readonly<ChartRendererProps>) {
  const { type, data, xAxisKey, dataKey } = chart;

  const renderChart = () => {
    switch (type) {
      case 'BAR':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: 'var(--muted-foreground)'
              }}
            />
            <Bar dataKey={dataKey} fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={60} />
          </BarChart>
        );
      case 'LINE':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: 'var(--muted-foreground)'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--background)', strokeWidth: 2, stroke: 'var(--primary)' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
            />
          </LineChart>
        );
      case 'AREA':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: 'var(--muted-foreground)'
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.2}
              strokeWidth={2}
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
              fill="var(--primary)"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${String(entry[xAxisKey] ?? index)}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ color: 'var(--muted-foreground)' }} />
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
    <motion.div
      key={`${type}-${data.length}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
});
