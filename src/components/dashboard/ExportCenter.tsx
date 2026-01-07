'use client';

import React from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { generateSetsCSV, generateWorkoutsCSV, downloadFile } from '@/lib/export';
import { FileCsv, DownloadSimple } from 'phosphor-react';
import { cn } from '@/lib/utils';

interface ExportCenterProps {
  className?: string;
}

export function ExportCenter({ className }: ExportCenterProps) {
  const data = useDashboardStore((state) => state.data);

  const handleExportSets = () => {
    if (!data) return;
    const csv = generateSetsCSV(data);
    downloadFile(csv, 'workout_sets.csv', 'text/csv');
  };

  const handleExportWorkouts = () => {
    if (!data) return;
    const csv = generateWorkoutsCSV(data);
    downloadFile(csv, 'workouts_metadata.csv', 'text/csv');
  };

  if (!data) return null;

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileCsv size={20} className="text-green-600" />
        Raw Data Export
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Download your workout history in flat CSV format for use in Excel, Python, or other analysis tools.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleExportSets}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <DownloadSimple size={18} />
          Sets Data (CSV)
        </button>
        <button
          onClick={handleExportWorkouts}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <DownloadSimple size={18} />
          Workouts Meta (CSV)
        </button>
      </div>
    </div>
  );
}
