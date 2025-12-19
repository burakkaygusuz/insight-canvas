export type ChartType = 'BAR' | 'LINE' | 'AREA' | 'PIE';

export interface GeneratedChart {
  id?: string;
  title: string;
  description: string;
  type: ChartType;
  xAxisKey: string;
  dataKey: string;
  data: (string | number)[][];
}
