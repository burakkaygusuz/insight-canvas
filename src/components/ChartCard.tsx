'use client';

import { motion } from 'framer-motion';
import { Copy, Trash2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { ChartRenderer } from '@/components/ChartRenderer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GeneratedChart } from '@/types/chart';

interface ChartCardProps {
  chart: GeneratedChart;
  onDelete: () => void;
}

export const ChartCard = memo(function ChartCard({ chart, onDelete }: Readonly<ChartCardProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmbed = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(chart, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [chart]);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="flex h-[450px] w-full flex-col overflow-hidden border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1.5">
            <CardTitle className="text-lg leading-none font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {chart.title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              {chart.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
              onClick={handleCopyEmbed}
              title="Copy JSON Config"
            >
              {copied ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold text-green-500"
                >
                  ✓
                </motion.span>
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
              onClick={onDelete}
              title="Delete Chart"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col pt-4">
          <div className="w-full flex-1">
            <ChartRenderer chart={chart} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
