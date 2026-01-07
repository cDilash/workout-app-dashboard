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
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-xl px-4 animate-in fade-in zoom-in duration-500">
      {/* Logo Area */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-black mb-6">
          <Barbell size={32} weight="fill" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">WORKOUT<span className="text-gray-500 font-normal ml-2">DASHBOARD</span></h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Analytics Hub</p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "w-full rounded-xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer p-12",
          isDragging 
            ? "border-white bg-white/10" 
            : "border-gray-800 hover:border-gray-600 bg-transparent",
          error ? "border-red-500" : ""
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
            "mb-6 transition-colors duration-300",
            isDragging ? "text-white" : "text-gray-600"
          )}>
            <UploadSimple size={48} weight="light" />
          </div>
          
          <p className="text-lg font-bold text-white mb-2">
            Import Data
          </p>
          <p className="text-gray-500 text-sm mb-8">
            JSON Export V1.0 / V2.0
          </p>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-4 py-2 rounded border border-gray-800">
                <FileText size={14} className="mr-2 text-white" />
                <span>Client-Side Only</span>
             </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-900/20 border border-red-900 text-red-400 rounded flex items-center text-sm font-medium w-full justify-center">
          <Warning size={20} weight="fill" className="mr-3 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
