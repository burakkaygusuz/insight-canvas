'use client';

import { Copy, Loader2, Trash2 } from 'lucide-react';
import * as m from 'motion/react-m';
import dynamic from 'next/dynamic';
import { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GeneratedChart } from '@/types/chart';

const ChartRenderer = dynamic(
  () => import('@/components/ChartRenderer').then((mod) => mod.ChartRenderer),
  {
    loading: () => (
      <div className="text-muted-foreground/50 flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
    ssr: false
  }
);

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
    <m.div
      className="h-full"
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card
        variant="glass"
        className="hover:bg-card/70 flex h-full min-h-[350px] w-full flex-col hover:shadow-xl"
      >
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <m.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-1"
          >
            <CardTitle className="text-foreground text-lg font-semibold tracking-tight">
              {chart.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {chart.description}
            </CardDescription>
          </m.div>
          <m.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-1"
          >
            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyEmbed}
                title="Copy JSON Config"
              >
                {copied ? (
                  <m.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold text-green-500"
                  >
                    ✓
                  </m.span>
                ) : (
                  <Copy className="text-muted-foreground hover:text-primary h-4 w-4 transition-colors" />
                )}
                <span className="sr-only">Copy</span>
              </Button>
            </m.div>
            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={onDelete} title="Delete Chart">
                <Trash2 className="text-muted-foreground hover:text-destructive h-4 w-4 transition-colors" />
                <span className="sr-only">Delete</span>
              </Button>
            </m.div>
          </m.div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 pb-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="h-full w-full"
          >
            <ChartRenderer chart={chart} />
          </m.div>
        </CardContent>
      </Card>
    </m.div>
  );
});
