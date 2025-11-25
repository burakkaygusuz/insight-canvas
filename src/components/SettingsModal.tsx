'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    setBaseUrl(config.baseUrl);
    setModel(config.model);
  }, [config]);

  const handleSave = useCallback(() => {
    onSave({ baseUrl, model });
    setOpen(false);
  }, [baseUrl, model, onSave]);

  const hasChanges = useMemo(
    () => baseUrl !== config.baseUrl || model !== config.model,
    [baseUrl, model, config]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                  onChange={(e) => setBaseUrl(e.target.value)}
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
                  onChange={(e) => setModel(e.target.value)}
                  className="col-span-3"
                  placeholder="llama3"
                />
              </motion.div>
            </motion.div>
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
