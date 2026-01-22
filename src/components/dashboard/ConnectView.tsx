'use client';

import { ChartCard } from '@/components/ChartCard';
import { SettingsModal } from '@/components/SettingsModal';
import { ApiConfig } from '@/types/ai';
import { ArrowRight, Key, Sparkles } from 'lucide-react';
import * as m from 'motion/react-m';

interface ConnectViewProps {
  config: ApiConfig;
  onConfigSave: (config: ApiConfig) => void;
}

export function ConnectView({ config, onConfigSave }: Readonly<ConnectViewProps>) {
  return (
    <m.div
      key="connect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-4 grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center"
    >
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
            Transform raw CSVs into interactive visual stories in seconds. No code, just natural
            language.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SettingsModal
            config={config}
            onSave={onConfigSave}
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

      <div className="perspective-1000 relative hidden lg:block">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="bg-primary/30 absolute -bottom-20 -left-20 h-72 w-72 rounded-full blur-[100px]" />

        <m.div
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
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-tr from-white/10 to-transparent opacity-50 mix-blend-overlay" />
        </m.div>
      </div>
    </m.div>
  );
}
