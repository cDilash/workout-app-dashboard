'use client';

import React from 'react';
import { Workout } from '@/lib/types';
import { getHeatmapData } from '@/lib/stats';
import { cn } from '@/lib/utils';

interface WorkoutHeatmapProps {
  workouts: Workout[];
}

export function WorkoutHeatmap({ workouts }: WorkoutHeatmapProps) {
  const data = getHeatmapData(workouts);
  
  // Create an array for the last 100 days
  const today = new Date();
  const days = Array.from({ length: 100 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (99 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Activity (Last 100 Days)</h3>
      <div className="flex flex-wrap gap-1.5">
        {days.map((day) => {
          const count = data[day] || 0;
          return (
            <div
              key={day}
              title={`${day}: ${count} workouts`}
              className={cn(
                "w-3 h-3 rounded-sm transition-colors cursor-help",
                count === 0 && "bg-gray-100 dark:bg-gray-800",
                count === 1 && "bg-blue-200 dark:bg-blue-900/40",
                count === 2 && "bg-blue-400 dark:bg-blue-700",
                count >= 3 && "bg-blue-600 dark:bg-blue-500"
              )}
            />
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <span>No workout</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-500" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}
