'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [charts, setCharts] = useState<GeneratedChart[]>([]);
  const [config, setConfig] = useState<OllamaConfig>({
    baseUrl: 'http://localhost:11434',
    model: 'llama3'
  });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const chart = await generateChartFromPrompt(query, config, systemPromptTemplate);
      const chartWithId = { ...chart, id: crypto.randomUUID() };
      setCharts((prev) => [chartWithId, ...prev]);
      setQuery('');
    } catch (err) {
      console.error(err);
      setError(
        'Failed to generate chart. Please ensure Ollama is running and CORS is configured (OLLAMA_ORIGINS="*").'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      {/* Header / Hero */}
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
        {/* Hero Text */}
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-slate-50">
            Visualize your data with{' '}
            <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Ask questions about your sales, profit, and customer data. InsightCanvas uses your local
            Ollama LLM to generate interactive charts instantly.
          </p>
        </div>

        {/* Input Section */}
        <div className="relative mx-auto mb-16 max-w-2xl">
          <div className="group relative">
            <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
            <div className="relative flex gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Show me sales trends over time..."
                className="h-12 flex-1 border-0 bg-transparent text-lg focus-visible:ring-0"
                disabled={loading}
              />
              <Button
                onClick={handleGenerate}
                disabled={loading || !query.trim()}
                size="lg"
                className="bg-indigo-600 text-white shadow-md transition-all hover:scale-105 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Charts Grid */}
        {charts.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 grid grid-cols-1 gap-6 duration-700 md:grid-cols-2">
            {charts.map((chart) => (
              <ChartCard key={chart.id} chart={chart} onDelete={() => handleDelete(chart.id!)} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="rounded-full bg-white p-4 shadow-sm dark:bg-slate-800">
                <Sparkles className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-lg font-medium">No charts generated yet</p>
              <p className="text-sm">
                Try asking: "Compare sales between North America and Europe"
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
