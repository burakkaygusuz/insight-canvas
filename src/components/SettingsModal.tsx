'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Settings } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

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
import { OllamaConfigSchema, safeValidate } from '@/lib/validation';
import { OllamaConfig } from '@/types/ollama';

interface SettingsModalProps {
  config: OllamaConfig;
  onSave: (config: OllamaConfig) => void;
}

export const SettingsModal = memo(function SettingsModal({
  config,
  onSave
}: Readonly<SettingsModalProps>) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [model, setModel] = useState(config.model);
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (newOpen) {
        setBaseUrl(config.baseUrl);
        setModel(config.model);
        setValidationError(null);
      }
    },
    [config.baseUrl, config.model]
  );

  const handleSave = useCallback(() => {
    const validation = safeValidate(OllamaConfigSchema, { baseUrl, model });

    if (!validation.success) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    onSave(validation.data);
    setOpen(false);
  }, [baseUrl, model, onSave]);

  const hasChanges = useMemo(
    () => baseUrl !== config.baseUrl || model !== config.model,
    [baseUrl, model, config]
  );

  const handleBaseUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseUrl(e.target.value);
    setValidationError(null);
  }, []);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setModel(e.target.value);
    setValidationError(null);
  }, []);

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
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>Ollama Configuration</DialogTitle>
                <DialogDescription>
                  Configure your local Ollama instance connection details.
                </DialogDescription>
              </DialogHeader>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="grid gap-4 py-4"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor="baseUrl" className="text-right">
                  Base URL
                </Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={handleBaseUrlChange}
                  className="col-span-3"
                  placeholder="http://localhost:11434"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Input
                  id="model"
                  value={model}
                  onChange={handleModelChange}
                  className="col-span-3"
                  placeholder="llama3"
                />
              </motion.div>
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
        )}
      </AnimatePresence>
    </Dialog>
  );
});
