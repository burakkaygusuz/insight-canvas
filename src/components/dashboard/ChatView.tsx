'use client';

import { ChartCard } from '@/components/ChartCard';
import { ChatForm } from '@/components/ChatForm';
import { FileData } from '@/lib/data-utils';
import { ApiConfig, GeneratedChart } from '@/types/ai';
import { Database, LayoutGrid, Loader2, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';

interface ChatViewProps {
  dynamicData: FileData | null;
  config: ApiConfig;
  onChartGenerated: (chart: GeneratedChart) => void;
  onChartError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onResetData: () => void;
  query: string;
  setQuery: (query: string) => void;
  isGeneratingSuggestions: boolean;
  loadingStep: 'idle' | 'analyzing' | 'generating' | 'finalizing';
  optimisticCharts: GeneratedChart[];
  onDeleteChart: (id: string) => void;
}

const PROGRESS_WIDTHS = {
  idle: '0%',
  analyzing: '30%',
  generating: '70%',
  finalizing: '100%'
} as const;

export function ChatView({
  dynamicData,
  config,
  onChartGenerated,
  onChartError,
  onLoadingChange,
  onResetData,
  query,
  setQuery,
  isGeneratingSuggestions,
  loadingStep,
  optimisticCharts,
  onDeleteChart
}: Readonly<ChatViewProps>) {
  return (
    <m.div
      key="chat"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-7xl"
    >
      {dynamicData && (
        <div className="border-border bg-card/50 mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border px-4 py-1.5 shadow-sm backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-muted-foreground text-sm font-medium">
            Analyzing: <span className="text-primary font-semibold">{dynamicData.fileName}</span>
          </span>
          <button
            onClick={onResetData}
            className="text-muted-foreground hover:bg-muted hover:text-foreground ml-2 rounded-full p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="relative mx-auto mb-10 max-w-2xl">
        <ChatForm
          config={config}
          dynamicData={dynamicData}
          onChartGenerated={onChartGenerated}
          onError={onChartError}
          onLoadingChange={onLoadingChange}
          query={query}
          setQuery={setQuery}
        />

        <AnimatePresence>
          {loadingStep !== 'idle' && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden px-4"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="bg-border h-1.5 w-full max-w-xs overflow-hidden rounded-full">
                  <m.div
                    className="bg-primary h-full"
                    initial={{ width: '0%' }}
                    animate={{ width: PROGRESS_WIDTHS[loadingStep] }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
                <m.span
                  key={loadingStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-muted-foreground text-xs font-medium"
                >
                  {loadingStep === 'analyzing' && 'Analyzing data patterns...'}
                  {loadingStep === 'generating' && 'Crafting visualization...'}
                  {loadingStep === 'finalizing' && 'Polishing chart details...'}
                </m.span>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {dynamicData && (
        <div className="mb-12 flex flex-col items-center justify-center gap-3">
          {isGeneratingSuggestions ? (
            <div className="text-primary flex items-center gap-2 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating AI suggestions...
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {dynamicData.suggestions?.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary rounded-full border px-4 py-2 text-sm font-medium transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="flex items-center text-xl font-bold tracking-tight">
          <LayoutGrid className="text-primary mr-2" size={20} />
          Dashboard
        </h2>
        <div className="text-muted-foreground font-mono text-sm">
          {optimisticCharts.length} items
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {optimisticCharts.length > 0 ? (
          <m.div className="grid auto-rows-[minmax(400px,auto)] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {optimisticCharts.map((chart, i) => (
              <m.div
                key={chart.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                layout
                className={i === 0 || i % 7 === 0 ? 'md:col-span-2 xl:col-span-2' : ''}
              >
                <ChartCard chart={chart} onDelete={() => onDeleteChart(chart.id!)} />
              </m.div>
            ))}
          </m.div>
        ) : (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card/20 text-muted-foreground relative flex h-96 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/10 backdrop-blur-sm"
          >
            <div className="to-primary/5 pointer-events-none absolute inset-0 bg-linear-to-b from-transparent" />
            <div className="bg-primary/10 ring-primary/20 mb-4 rounded-full p-4 ring-1">
              <Database className="text-primary h-8 w-8" />
            </div>
            <p className="text-foreground text-lg font-medium">Ready to Visualize</p>
            <p className="text-sm opacity-60">Generate your first chart to build your dashboard.</p>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
