'use client';

import React, { useCallback, useState } from 'react';
import { UploadSimple, FileText, Warning, Barbell } from 'phosphor-react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { parseExportData } from '@/lib/parsers';
import { cn } from '@/lib/utils';

export function DataImport() {
  const setData = useDashboardStore((state) => state.setData);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseExportData(text);
      
      if (data) {
        setData(data);
        setError(null);
      } else {
        setError('Failed to parse file. Invalid format.');
      }
    };
    reader.readAsText(file);
  }, [setData]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl px-4 animate-in fade-in zoom-in duration-700">
      {/* Logo Area */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 mb-6">
          <Barbell size={40} weight="fill" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Workout<span className="text-blue-500 font-light italic ml-1">Dashboard</span></h1>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Data Analytics Hub</p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "glass-card glass-card-hover w-full rounded-[2.5rem] p-12 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
          isDragging 
            ? "border-blue-500/50 bg-blue-500/5 ring-4 ring-blue-500/10 scale-[1.02]" 
            : "border-white/10",
          error ? "border-red-500/50 bg-red-500/5" : ""
        )}
      >
        <input
          type="file"
          accept=".json"
          className="hidden"
          id="file-upload"
          onChange={onInputChange}
        />
        
        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full relative z-10">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
            isDragging 
              ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)]" 
              : "glass-card bg-white/5 text-gray-400"
          )}>
            <UploadSimple size={40} weight={isDragging ? "bold" : "light"} />
          </div>
          
          <p className="text-2xl font-bold text-white mb-2">
            Import Training History
          </p>
          <p className="text-gray-500 font-medium mb-8">
            Drag and drop your JSON export or <span className="text-blue-400 underline decoration-blue-400/30 underline-offset-4">browse files</span>
          </p>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <FileText size={14} className="mr-2 text-blue-500" />
                <span>Format: JSON (V1/V2)</span>
             </div>
             <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Barbell size={14} className="mr-2 text-blue-500" />
                <span>Privacy: Client-Side Only</span>
             </div>
          </div>
        </label>

        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {error && (
        <div className="mt-8 p-4 glass-card bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl flex items-center text-sm font-medium animate-in slide-in-from-bottom-2">
          <Warning size={20} weight="fill" className="mr-3 flex-shrink-0" />
          {error}
        </div>
      )}
      
      <p className="mt-12 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
        Secured by local encryption
      </p>
    </div>
  );
}