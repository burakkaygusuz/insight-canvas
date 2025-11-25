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
    <motion.div layout whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Card className="flex h-[400px] w-full flex-col border-slate-200 shadow-md transition-shadow duration-300 hover:shadow-xl dark:border-slate-800">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-1"
          >
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {chart.title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              {chart.description}
            </CardDescription>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-1"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
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
                  <Copy className="h-4 w-4 text-slate-500 transition-colors hover:text-indigo-600" />
                )}
                <span className="sr-only">Copy</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={onDelete} title="Delete Chart">
                <Trash2 className="h-4 w-4 text-slate-500 transition-colors hover:text-red-600" />
                <span className="sr-only">Delete</span>
              </Button>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 pb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="h-full w-full"
          >
            <ChartRenderer chart={chart} />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
