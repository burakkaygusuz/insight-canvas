'use client';

import { generateSuggestionsAction } from '@/app/actions';
import { ChatView } from '@/components/dashboard/ChatView';
import { ConnectView } from '@/components/dashboard/ConnectView';
import { UploadView } from '@/components/dashboard/UploadView';
import { BackgroundAmbience, DashboardHeader, PageContainer } from '@/components/layout/Shell';
import { useLocalStorage } from '@/hooks/local-storage';
import { AiProvider } from '@/lib/constants';
import { DEMO_DATA, FileData, parseFile } from '@/lib/data-utils';
import { FileSchema, safeValidate } from '@/lib/validation';
import { ApiConfig, GeneratedChart } from '@/types/ai';
import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useCallback, useEffect, useOptimistic, useRef, useState } from 'react';

type DashboardState = 'connect' | 'upload' | 'chat';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [charts, setCharts] = useState<GeneratedChart[]>([]);
  const [optimisticCharts] = useOptimistic(charts, (state, newChart: GeneratedChart) => [
    newChart,
    ...state
  ]);

  const [config, setConfig] = useLocalStorage<ApiConfig>('ai-config', {
    provider: AiProvider.GOOGLE,
    model: 'gemini-3-flash',
    apiKey: '',
    baseUrl: ''
  });

  const [appState, setAppState] = useState<DashboardState>('connect');
  const [error, setError] = useState<string | null>(null);
  const [dynamicData, setDynamicData] = useState<FileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    'idle' | 'analyzing' | 'generating' | 'finalizing'
  >('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync app state with config and data
  useEffect(() => {
    if (!config.apiKey) {
      setAppState('connect');
    } else if (dynamicData) {
      setAppState('chat');
    } else {
      setAppState('upload');
    }
  }, [config.apiKey, dynamicData]);

  // Error auto-dismiss
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
      const validation = await safeValidate(FileSchema, file);
      if (!validation.success) throw new Error(validation.error);

      const parsed = await parseFile(file);
      setDynamicData(parsed);

      if (config.apiKey) {
        setIsGeneratingSuggestions(true);
        generateSuggestionsAction(config, parsed)
          .then((aiSuggestions) => {
            if (aiSuggestions?.length > 0) {
              setDynamicData((prev) => (prev ? { ...prev, suggestions: aiSuggestions } : null));
            }
          })
          .catch(console.error)
          .finally(() => setIsGeneratingSuggestions(false));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChartGenerated = useCallback((chart: GeneratedChart) => {
    setLoadingStep('finalizing');
    setTimeout(() => {
      setCharts((prev) => [{ ...chart, id: crypto.randomUUID() }, ...prev]);
      setLoadingStep('idle');
    }, 400);
  }, []);

  const handleChartError = useCallback((errMsg: string) => {
    setError(errMsg);
    setLoadingStep('idle');
  }, []);

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    if (isLoading) {
      setLoadingStep('analyzing');
      setTimeout(() => setLoadingStep('generating'), 800);
    }
  }, []);

  const handleDeleteChart = useCallback((id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

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
          {appState === 'connect' && <ConnectView config={config} onConfigSave={setConfig} />}

          {appState === 'upload' && (
            <UploadView
              isUploading={isUploading}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onSkipToDemo={() => {
                setDynamicData(DEMO_DATA);
                setAppState('chat');
              }}
            />
          )}

          {appState === 'chat' && (
            <ChatView
              dynamicData={dynamicData}
              config={config}
              onChartGenerated={handleChartGenerated}
              onChartError={handleChartError}
              onLoadingChange={handleLoadingChange}
              onResetData={() => {
                setDynamicData(null);
                setAppState('upload');
              }}
              query={query}
              setQuery={setQuery}
              isGeneratingSuggestions={isGeneratingSuggestions}
              loadingStep={loadingStep}
              optimisticCharts={optimisticCharts}
              onDeleteChart={handleDeleteChart}
            />
          )}
        </AnimatePresence>

        {/* Global Error Toast */}
        <AnimatePresence>
          {error && (
            <m.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="border-destructive/20 bg-card/95 text-foreground fixed right-6 bottom-6 z-50 flex max-w-md items-start gap-4 rounded-xl border p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur-md dark:ring-white/10"
            >
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <h4 className="text-destructive mb-1 text-sm font-semibold">Error Occurred</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-muted-foreground hover:bg-muted shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <X size={16} />
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </PageContainer>
    </main>
  );
}
