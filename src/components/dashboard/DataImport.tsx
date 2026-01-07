'use client';

import React, { useCallback, useState } from 'react';
import { UploadSimple, FileText, Warning } from 'phosphor-react';
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Workout Dashboard</h1>
          <p className="text-gray-500 mt-2">Upload your workout data to see your stats.</p>
        </div>

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-gray-800",
            isDragging 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500",
            error ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : ""
          )}
        >
          <input
            type="file"
            accept=".json"
            className="hidden"
            id="file-upload"
            onChange={onInputChange}
          />
          
          <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full">
            <div className={cn(
              "p-4 rounded-full mb-4",
              isDragging ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            )}>
              <UploadSimple size={48} weight="light" />
            </div>
            
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Drop your export file here
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              or click to browse
            </p>
            
            <div className="flex items-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
              <FileText size={14} className="mr-1" />
              <span>Only .json files supported</span>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg flex items-center text-sm">
            <Warning size={20} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
