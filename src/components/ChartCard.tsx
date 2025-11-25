'use client';

import { Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ChartRenderer } from '@/components/ChartRenderer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GeneratedChart } from '@/types/chart';

interface ChartCardProps {
  chart: GeneratedChart;
  onDelete: () => void;
}

export function ChartCard({ chart, onDelete }: Readonly<ChartCardProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(JSON.stringify(chart, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex h-[400px] w-full flex-col border-slate-200 transition-shadow duration-300 hover:shadow-lg dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {chart.title}
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            {chart.description}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleCopyEmbed} title="Copy JSON Config">
            {copied ? (
              <span className="text-xs font-bold text-green-500">✓</span>
            ) : (
              <Copy className="h-4 w-4 text-slate-500 transition-colors hover:text-indigo-600" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete Chart">
            <Trash2 className="h-4 w-4 text-slate-500 transition-colors hover:text-red-600" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pb-4">
        <div className="h-full w-full">
          <ChartRenderer chart={chart} />
        </div>
      </CardContent>
    </Card>
  );
}
