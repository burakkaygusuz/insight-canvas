'use client';

import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { GenerateActionState, generateChartAction } from '@/app/actions';
import { ApiConfig, GeneratedChart } from '@/types/ai';

const initialState: GenerateActionState = {
  success: false
};

interface ChatFormProps {
  config: ApiConfig;
  dynamicData: FileData | null;
  onChartGenerated: (chart: GeneratedChart) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
}

import { FileData } from '@/lib/data-utils';

function SubmitButton({ isPending }: Readonly<{ isPending: boolean }>) {
  const { pending } = useFormStatus();
  const isLoading = pending || isPending;

  return (
    <button
      type="submit"
      disabled={isLoading}
      className="bg-primary text-primary-foreground hover:bg-primary/90 absolute inset-y-2 right-2 flex items-center justify-center rounded-xl px-4 font-medium shadow-md transition-all disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
    </button>
  );
}

export function ChatForm({
  config,
  dynamicData,
  onChartGenerated,
  onError,
  onLoadingChange,
  query,
  setQuery
}: Readonly<ChatFormProps>) {
  const [state, formAction, isPending] = useActionState(generateChartAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    onLoadingChange(isPending);
  }, [isPending, onLoadingChange]);

  useEffect(() => {
    if (state.success && state.chart) {
      onChartGenerated(state.chart);
      setQuery(''); // Clear input on success
    } else if (state.error) {
      onError(state.error);
    }
  }, [state, onChartGenerated, onError, setQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form action={formAction} ref={formRef} className="group relative w-full">
      <input type="hidden" name="config" value={JSON.stringify(config)} />
      {dynamicData && (
        <input type="hidden" name="dynamicData" value={JSON.stringify(dynamicData)} />
      )}

      <div className="relative transition-transform duration-300 focus-within:scale-105">
        <div className="from-primary absolute -inset-0.5 rounded-2xl bg-linear-to-r to-purple-600 opacity-20 blur transition duration-500 group-focus-within:opacity-50"></div>
        <div className="bg-card relative rounded-2xl">
          <Sparkles className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <input
            name="prompt"
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
            autoComplete="off"
          />
          <SubmitButton isPending={isPending} />
        </div>
      </div>
    </form>
  );
}
