'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChartColumn, CheckCircle2, LayoutGrid, Loader2, Send, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { ChartCard } from '@/components/ChartCard';
import { SettingsModal } from '@/components/SettingsModal';
import { generateChartFromPrompt } from '@/services/ollamaService';
import { GeneratedChart } from '@/types/chart';
import { OllamaConfig } from '@/types/ollama';

interface DashboardProps {
  systemPromptTemplate: string;
}

export default function Dashboard({ systemPromptTemplate }: Readonly<DashboardProps>) {
  const [query, setQuery] = useState('');
  const [charts, setCharts] = useState<GeneratedChart[]>([]);
  const [config, setConfig] = useState<OllamaConfig>({
    baseUrl: 'http://localhost:11434',
    model: 'llama3'
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!query.trim()) return;

    setError(null);
    setShowSuccess(false);

    startTransition(async () => {
      try {
        const chart = await generateChartFromPrompt(query, config, systemPromptTemplate);
        const chartWithId = { ...chart, id: crypto.randomUUID() };
        setCharts((prev) => [chartWithId, ...prev]);
        setQuery('');
        setShowSuccess(true);
      } catch (err) {
        console.error('Chart generation error:', err);

        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            setError(
              `Model "${config.model}" not found. Please check the model name in settings or pull it using: ollama pull ${config.model}`
            );
          } else {
            setError(err.message);
          }
        } else {
          setError(
            'Failed to generate chart. Please ensure Ollama is running and CORS is configured (OLLAMA_ORIGINS="*").'
          );
        }
      }
    });
  }, [query, config, systemPromptTemplate]);

  const handleClear = useCallback(() => {
    setQuery('');
    setError(null);
    setShowSuccess(false);
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleDelete = useCallback((id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleGenerate, handleClear]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleGenerate();
    },
    [handleGenerate]
  );

  return (
    <main className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-bold text-transparent dark:from-indigo-400 dark:to-violet-400">
              InsightCanvas
            </h1>
          </div>
          <SettingsModal config={config} onSave={setConfig} />
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4 text-center"
        >
          <motion.h2
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-slate-50"
          >
            Visualize your data with{' '}
            <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </motion.h2>
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400"
          >
            Ask questions about your sales, profit, and customer data. InsightCanvas uses your local
            Ollama LLM to generate interactive charts instantly.
          </motion.p>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto mb-12 max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative">
              <Sparkles className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-indigo-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Show me monthly sales trends for 2023..."
                className="block w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pr-12 pl-12 text-lg text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10"
                disabled={isPending}
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={isPending || !query.trim()}
                className="absolute inset-y-2 right-2 flex items-center justify-center rounded-xl bg-indigo-600 px-4 font-medium text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="mt-1.5 mr-1 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Try asking:
            </span>
            {[
              'Total profit by region',
              'Sales trend over time',
              'Sales vs Customers per product'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="rounded-full bg-slate-100 px-3 py-1 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {showSuccess && !error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
                <span>Chart generated successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-medium"
                >
                  Failed to generate chart
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-1 text-xs"
                >
                  {error}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setError(null)}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Dismiss
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold text-slate-800 dark:text-slate-100">
            <LayoutGrid className="mr-2 text-slate-400" size={20} />
            Your Dashboard
          </h2>
          <div className="text-sm text-slate-400">
            {charts.length} visualization{charts.length !== 1 ? 's' : ''} generated
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {charts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              {charts.map((chart, index) => (
                <motion.div
                  key={chart.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  layout
                >
                  <ChartCard
                    key={chart.id}
                    chart={chart}
                    onDelete={() => handleDelete(chart.id!)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm dark:bg-slate-800">
                <ChartColumn className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-200">Canvas is empty</p>
              <p className="mt-1 text-sm">Configure AI and ask a question to generate charts.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
