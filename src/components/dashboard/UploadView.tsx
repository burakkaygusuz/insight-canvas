'use client';

import { motion } from 'framer-motion';
import { FileText, FileUp, Loader2 } from 'lucide-react';
import { RefObject } from 'react';

interface UploadViewProps {
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkipToDemo: () => void;
}

export function UploadView({
  isUploading,
  fileInputRef,
  onFileUpload,
  onSkipToDemo
}: Readonly<UploadViewProps>) {
  return (
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
          onChange={onFileUpload}
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
          onClick={onSkipToDemo}
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
        >
          Skip to Demo Data
        </button>
      </div>
    </motion.div>
  );
}
