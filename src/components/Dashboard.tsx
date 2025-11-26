'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { ChartCard } from '@/components/ChartCard';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-12 space-y-4 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-slate-50"
          >
            Visualize your data with{' '}
            <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400"
          >
            Ask questions about your sales, profit, and customer data. InsightCanvas uses your local
            Ollama LLM to generate interactive charts instantly.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative mx-auto mb-16 max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="group relative">
            <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
            <div className="relative flex gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Show me sales trends over time..."
                  className="h-12 w-full border-0 bg-transparent pr-10 text-lg focus-visible:ring-0"
                  disabled={isPending}
                  autoComplete="off"
                  autoFocus
                  aria-label="Chart generation query"
                  aria-describedby="query-hint"
                />
                {query && !isPending && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    aria-label="Clear input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={isPending || !query.trim()}
                size="lg"
                className="bg-indigo-600 text-white shadow-md transition-all hover:scale-105 hover:bg-indigo-700 disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin md:mr-2" />
                    <span className="hidden md:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Generate</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            id="query-hint"
            className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400"
          >
            Press{' '}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              Enter
            </kbd>{' '}
            to generate or{' '}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              Esc
            </kbd>{' '}
            to clear
          </motion.p>

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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="rounded-full bg-white p-4 shadow-sm dark:bg-slate-800"
                >
                  <Sparkles className="h-8 w-8 text-indigo-400" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-medium"
                >
                  No charts generated yet
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm"
                >
                  Try asking: &ldquo;Compare sales between North America and Europe&rdquo;
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
