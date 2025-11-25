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

import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/constants';
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
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis dataKey={xAxisKey} className="text-xs text-slate-500" />
            <YAxis className="text-xs text-slate-500" />
            <Tooltip {...TOOLTIP_STYLE} />
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
            <Tooltip {...TOOLTIP_STYLE} />
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
            <Tooltip {...TOOLTIP_STYLE} />
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
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
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
