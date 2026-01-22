'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Database,
  FileText,
  FileUp,
  Key,
  LayoutGrid,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { ChartCard } from '@/components/ChartCard';
import { BackgroundAmbience, DashboardHeader, PageContainer } from '@/components/layout/Shell';
import { SettingsModal } from '@/components/SettingsModal';
import { useLocalStorage } from '@/hooks/local-storage';
import { AiProvider } from '@/lib/constants';
import { FileData, parseFile } from '@/lib/data-utils';
import { FileSchema, safeValidate } from '@/lib/validation';
import { generateChartFromPrompt, generateSuggestions } from '@/services/ai-client';
import { ApiConfig, GeneratedChart } from '@/types/ai';

type DashboardState = 'connect' | 'upload' | 'chat';

const PROGRESS_WIDTHS = {
  idle: '0%',
  analyzing: '30%',
  generating: '70%',
  finalizing: '100%'
} as const;

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [charts, setCharts] = useState<GeneratedChart[]>([]);
  const [config, setConfig] = useLocalStorage<ApiConfig>('ai-config', {
    provider: AiProvider.GOOGLE,
    model: 'gemini-3-flash',
    apiKey: '',
    baseUrl: ''
  });

  const [appState, setAppState] = useState<DashboardState>('connect');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [dynamicData, setDynamicData] = useState<FileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    'idle' | 'analyzing' | 'generating' | 'finalizing'
  >('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config.apiKey) {
      if (dynamicData) {
        setAppState('chat');
      } else {
        setAppState('upload');
      }
    } else {
      setAppState('connect');
    }
  }, [config.apiKey, dynamicData]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Validate file size and type
      const validation = await safeValidate(FileSchema, file);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const parsed = await parseFile(file);

      setDynamicData(parsed);

      if (config.apiKey) {
        setIsGeneratingSuggestions(true);
        generateSuggestions(config, parsed)
          .then((aiSuggestions) => {
            if (aiSuggestions && aiSuggestions.length > 0) {
              setDynamicData((prev) => (prev ? { ...prev, suggestions: aiSuggestions } : null));
            }
          })
          .catch(console.error)
          .finally(() => setIsGeneratingSuggestions(false));
      }

      setAppState('chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!query.trim()) return;

    setError(null);
    setShowSuccess(false);
    setLoadingStep('analyzing');

    startTransition(async () => {
      try {
        // Simulate analysis step
        await new Promise((resolve) => setTimeout(resolve, 600));
        setLoadingStep('generating');

        const chart = await generateChartFromPrompt(query, config, dynamicData || undefined);

        setLoadingStep('finalizing');
        await new Promise((resolve) => setTimeout(resolve, 400));

        const chartWithId = { ...chart, id: crypto.randomUUID() };
        setCharts((prev) => [chartWithId, ...prev]);
        setQuery('');
        setShowSuccess(true);
      } catch (err) {
        console.error('Chart generation error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to generate chart. Please check your settings and try again.');
        }
      } finally {
        setLoadingStep('idle');
      }
    });
  }, [query, config, dynamicData]);

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

  return (
    <main className="bg-background text-foreground relative min-h-screen overflow-hidden transition-colors duration-300">
      <BackgroundAmbience />

      <DashboardHeader
        onNavigate={() => setAppState(config.apiKey ? 'upload' : 'connect')}
        config={config}
        onConfigSave={setConfig}
        showSettings={appState !== 'connect'}
      />

      <PageContainer>
        <AnimatePresence mode="wait">
          {appState === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center"
            >
              {/* Left Column: Value Prop */}
              <div className="flex flex-col items-start space-y-8 text-left">
                <div className="space-y-4">
                  <div className="border-primary/20 bg-primary/5 text-primary inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    <span>AI-Powered Data Analyst</span>
                  </div>
                  <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl">
                    Chat with your <br />
                    <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">
                      Data.
                    </span>
                  </h1>
                  <p className="text-muted-foreground max-w-xl text-lg md:text-xl">
                    Transform raw CSVs into interactive visual stories in seconds. No code, just
                    natural language.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <SettingsModal
                    config={config}
                    onSave={setConfig}
                    trigger={
                      <button className="group bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold shadow-lg transition-all hover:scale-105">
                        <Key className="h-5 w-5" />
                        Start with your Key
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    }
                  />
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <div className="bg-card ring-border flex h-8 w-8 items-center justify-center rounded-full ring-1">
                      <Key className="h-4 w-4 opacity-50" />
                    </div>
                    <span>Your keys stay local in your browser.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Proof */}
              <div className="perspective-1000 relative hidden lg:block">
                {/* Decorative Blobs */}
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-500/30 blur-[100px]" />
                <div className="bg-primary/30 absolute -bottom-20 -left-20 h-72 w-72 rounded-full blur-[100px]" />

                <motion.div
                  initial={{ rotateX: 5, rotateY: -12, opacity: 0, y: 50 }}
                  animate={{ rotateX: 5, rotateY: -12, opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="relative transform-gpu transition-transform duration-500 hover:rotate-x-2 hover:rotate-y-[-5deg]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="pointer-events-none">
                    <ChartCard
                      chart={{
                        id: 'demo',
                        title: 'Monthly Revenue Growth',
                        description: 'Revenue is trending up by 20% month-over-month.',
                        type: 'AREA',
                        data: [
                          ['Jan', 4000],
                          ['Feb', 3000],
                          ['Mar', 5000],
                          ['Apr', 7000],
                          ['May', 6000],
                          ['Jun', 9000]
                        ],
                        xAxisKey: 'month',
                        dataKey: 'value'
                      }}
                      onDelete={() => {}}
                    />
                  </div>
                  {/* Glass Reflection Overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-tr from-white/10 to-transparent opacity-50 mix-blend-overlay" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {appState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10 flex w-full max-w-xl flex-col items-center text-center"
            >
              <div className="mb-6 rounded-3xl bg-blue-500/10 p-6 ring-1 ring-blue-500/20">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight">Ingest Data</h2>
              <p className="text-muted-foreground mb-8">
                Upload your CSV or Excel file. AI will analyze the schema and suggest insights
                automatically.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group border-border bg-card/30 hover:border-primary/50 hover:bg-primary/5 relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed py-16 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />
                <div className="bg-background ring-border mb-4 rounded-full p-4 shadow-sm ring-1 transition-transform group-hover:scale-110">
                  {isUploading ? (
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  ) : (
                    <FileUp className="text-primary h-8 w-8" />
                  )}
                </div>
                <p className="text-lg font-medium">
                  {isUploading ? 'Parsing file...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">CSV, XLSX up to 10MB</p>
              </button>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setAppState('chat')}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Skip to Demo Data
                </button>
              </div>
            </motion.div>
          )}
          {appState === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-7xl"
            >
              {dynamicData && (
                <div className="border-border bg-card/50 mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border px-4 py-1.5 shadow-sm backdrop-blur-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Analyzing:{' '}
                    <span className="text-primary font-semibold">{dynamicData.fileName}</span>
                  </span>
                  <button
                    onClick={() => {
                      setDynamicData(null);
                      setAppState('upload');
                    }}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground ml-2 rounded-full p-1 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="relative mx-auto mb-10 max-w-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGenerate();
                  }}
                  className="group relative w-full"
                >
                  <div className="relative transition-transform duration-300 focus-within:scale-105">
                    <div className="from-primary absolute -inset-0.5 rounded-2xl bg-linear-to-r to-purple-600 opacity-20 blur transition duration-500 group-focus-within:opacity-50"></div>
                    <div className="bg-card relative rounded-2xl">
                      <Sparkles className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          dynamicData
                            ? `Ask about ${dynamicData.fileName}...`
                            : 'Describe the chart you want to generate...'
                        }
                        className="text-foreground placeholder:text-muted-foreground block w-full rounded-2xl border-0 bg-transparent py-4 pr-12 pl-12 text-lg focus:ring-0"
                        disabled={isPending}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isPending || !query.trim()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 absolute inset-y-2 right-2 flex items-center justify-center rounded-xl px-4 font-medium shadow-md transition-all disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                      </button>
                    </div>
                  </div>
                </form>

                <AnimatePresence>
                  {loadingStep !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden px-4"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-border h-1.5 w-full max-w-xs overflow-hidden rounded-full">
                          <motion.div
                            className="bg-primary h-full"
                            initial={{ width: '0%' }}
                            animate={{
                              width: PROGRESS_WIDTHS[loadingStep]
                            }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          />
                        </div>
                        <motion.span
                          key={loadingStep}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-muted-foreground text-xs font-medium"
                        >
                          {loadingStep === 'analyzing' && 'Analyzing data patterns...'}
                          {loadingStep === 'generating' && 'Crafting visualization...'}
                          {loadingStep === 'finalizing' && 'Polishing chart details...'}
                        </motion.span>
                      </div>
                    </motion.div>
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
                <div className="text-muted-foreground font-mono text-sm">{charts.length} items</div>
              </div>

              <AnimatePresence mode="popLayout">
                {charts.length > 0 ? (
                  <motion.div className="grid auto-rows-[minmax(400px,auto)] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {charts.map((chart, i) => (
                      <motion.div
                        key={chart.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        layout
                        className={i === 0 || i % 7 === 0 ? 'md:col-span-2 xl:col-span-2' : ''}
                      >
                        <ChartCard chart={chart} onDelete={() => handleDelete(chart.id!)} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card/20 text-muted-foreground relative flex h-96 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/10 backdrop-blur-sm"
                  >
                    <div className="to-primary/5 pointer-events-none absolute inset-0 bg-linear-to-b from-transparent" />
                    <div className="bg-primary/10 ring-primary/20 mb-4 rounded-full p-4 ring-1">
                      <Database className="text-primary h-8 w-8" />
                    </div>
                    <p className="text-foreground text-lg font-medium">Ready to Visualize</p>
                    <p className="text-sm opacity-60">
                      Generate your first chart to build your dashboard.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                    className="border-destructive/20 bg-card/95 text-foreground fixed right-6 bottom-6 z-50 flex max-w-md items-start gap-4 rounded-xl border p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur-md dark:ring-white/10"
                  >
                    <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-destructive mb-1 text-sm font-semibold">
                        Error Occurred
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-muted-foreground hover:bg-muted shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </PageContainer>
    </main>
  );
}
