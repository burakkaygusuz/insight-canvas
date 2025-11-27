'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Settings } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/Select';
import { DEFAULT_MODELS, POPULAR_MODELS, PROVIDER_LABELS } from '@/lib/constants';
import { ApiConfigSchema, safeValidate } from '@/lib/validation';
import { AiProvider, ApiConfig } from '@/types/ai';

interface SettingsModalProps {
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export const SettingsModal = memo(function SettingsModal({
  config,
  onSave
}: Readonly<SettingsModalProps>) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<AiProvider>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey ?? '');
  const [model, setModel] = useState(config.model);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (newOpen) {
        setProvider(config.provider);
        setApiKey(config.apiKey ?? '');
        setModel(config.model);
        setBaseUrl(config.baseUrl ?? '');
        setValidationError(null);
      }
    },
    [config]
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      const newProvider = value as AiProvider;
      setProvider(newProvider);
      setModel(DEFAULT_MODELS[newProvider]);
      setValidationError(null);

      if (newProvider === config.provider) {
        setApiKey(config.apiKey ?? '');
        setBaseUrl(config.baseUrl ?? '');
      } else {
        setApiKey('');
        setBaseUrl('');
      }
    },
    [config]
  );

  const handleSave = useCallback(() => {
    const validation = safeValidate(ApiConfigSchema, {
      provider,
      apiKey,
      model,
      baseUrl
    });

    if (!validation.success) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    onSave(validation.data);
    setOpen(false);
  }, [provider, apiKey, model, baseUrl, onSave]);

  const hasChanges = useMemo(
    () =>
      provider !== config.provider ||
      apiKey !== (config.apiKey ?? '') ||
      model !== config.model ||
      baseUrl !== (config.baseUrl ?? ''),
    [provider, apiKey, model, baseUrl, config]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            <span className="sr-only">Settings</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>AI Provider Settings</DialogTitle>
            <DialogDescription>
              Configure your AI provider, API key, and model preferences.
            </DialogDescription>
          </DialogHeader>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="grid gap-4 py-4"
        >
          {/* Provider Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <div className="col-span-3">
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger id="provider" className="w-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* API Key Input */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-4 items-center gap-4"
          >
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationError(null);
              }}
              className="col-span-3"
              placeholder={
                provider === AiProvider.GOOGLE ? 'Leave empty to use env variable' : 'sk-...'
              }
            />
          </motion.div>

          {/* Base URL Input (Only for OpenAI Compatible) */}
          {provider === AiProvider.OPENAI_COMPATIBLE && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-4 items-center gap-4"
            >
              <Label htmlFor="baseUrl" className="text-right">
                Base URL
              </Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  setValidationError(null);
                }}
                className="col-span-3"
                placeholder="https://api.groq.com/openai/v1"
              />
            </motion.div>
          )}

          {/* Model Input */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="model" className="pt-3 text-right">
              Model
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setValidationError(null);
                }}
                placeholder={DEFAULT_MODELS[provider]}
              />
              <div className="flex flex-wrap gap-2">
                {POPULAR_MODELS[provider].map((modelName) => (
                  <Badge
                    key={modelName}
                    variant={model === modelName ? 'default' : 'secondary'}
                    className="cursor-pointer transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                    onClick={() => setModel(modelName)}
                  >
                    {modelName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">{validationError}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <DialogFooter>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" onClick={handleSave} disabled={!hasChanges}>
                Save changes
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
});
