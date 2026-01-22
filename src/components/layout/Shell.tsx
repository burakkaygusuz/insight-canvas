import { SettingsModal } from '@/components/SettingsModal';
import { cn } from '@/lib/utils';
import { ApiConfig } from '@/types/ai';
import { Sparkles } from 'lucide-react';

export function BackgroundAmbience() {
  return (
    <div className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
      <div className="bg-primary/20 absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full opacity-50 mix-blend-screen blur-[120px]" />
      <div className="bg-secondary/30 absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-40 mix-blend-screen blur-[100px]" />
    </div>
  );
}

interface DashboardHeaderProps {
  onNavigate: () => void;
  config: ApiConfig;
  onConfigSave: (config: ApiConfig) => void;
  showSettings: boolean;
}

export function DashboardHeader({
  onNavigate,
  config,
  onConfigSave,
  showSettings
}: Readonly<DashboardHeaderProps>) {
  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          type="button"
          className={cn(
            'focus:ring-primary flex items-center gap-2 rounded-lg p-1 transition-opacity',
            'hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          )}
          onClick={onNavigate}
        >
          <div className="bg-primary/10 rounded-lg p-2">
            <Sparkles className="text-primary h-5 w-5" />
          </div>
          <h1 className="from-primary bg-linear-to-r via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
            InsightCanvas
          </h1>
        </button>
        {showSettings && <SettingsModal config={config} onSave={onConfigSave} />}
      </div>
    </header>
  );
}

export function PageContainer({ className, children }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start px-4 py-12',
        className
      )}
    >
      {children}
    </div>
  );
}
