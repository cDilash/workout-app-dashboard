'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { getPersonalRecords, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { Trophy, Crown, Medal } from 'phosphor-react';
import { useDashboardStore } from '@/stores/dashboard-store';

interface PersonalRecordsProps {
  workouts: Workout[];
  className?: string;
}

export function PersonalRecords({ workouts, className }: PersonalRecordsProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawRecords = useMemo(() => getPersonalRecords(workouts), [workouts]);

  const records = useMemo(() => {
    return rawRecords.map(rec => ({
      ...rec,
      maxWeight: formatWeight(rec.maxWeight, unitPreference),
      maxE1RM: formatWeight(rec.maxE1RM, unitPreference),
      maxVolume: formatWeight(rec.maxVolume, unitPreference)
    }));
  }, [rawRecords, unitPreference]);

  // Determine the date of the most recent workout to flag "New" PRs
  const lastWorkoutDate = useMemo(() => {
    if (workouts.length === 0) return '';
    const dates = workouts.map(w => new Date(w.metadata.date).getTime());
    return new Date(Math.max(...dates)).toISOString().split('T')[0];
  }, [workouts]);

  const isNew = (date: string) => date === lastWorkoutDate;

  if (records.length === 0) return null;

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden", className)}>
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" weight="duotone" />
          Personal Records ({unitPreference})
        </h3>
        <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
          Based on import history
        </span>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto p-0 divide-y divide-gray-100 dark:divide-gray-800">
        {records.map((rec) => (
          <div key={rec.exerciseId} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              {rec.exerciseName}
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
              <PRMetric 
                label="Max Weight" 
                value={`${rec.maxWeight}${unitPreference}`} 
                date={rec.maxWeightDate} 
                isNew={isNew(rec.maxWeightDate)}
                icon={Crown}
                color="text-amber-500"
              />
              <PRMetric 
                label="Best e1RM" 
                value={`${rec.maxE1RM}${unitPreference}`} 
                date={rec.maxE1RMDate} 
                isNew={isNew(rec.maxE1RMDate)}
                icon={Medal}
                color="text-blue-500"
              />
               <PRMetric 
                label="Max Vol" 
                value={`${(rec.maxVolume / 1000).toFixed(1)}k`} 
                date={rec.maxVolumeDate} 
                isNew={isNew(rec.maxVolumeDate)}
                icon={Trophy}
                color="text-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PRMetric({ 
  label, 
  value, 
  date, 
  isNew, 
  icon: Icon,
  color
}: { 
  label: string; 
  value: string; 
  date: string; 
  isNew: boolean; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 flex flex-col items-center text-center relative overflow-hidden group">
      {isNew && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-md z-10">
          NEW!
        </div>
      )}
      <div className={cn("mb-1 p-1.5 rounded-full bg-white dark:bg-gray-700 shadow-sm", color)}>
        <Icon size={16} weight="duotone" />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
      <p className="text-[10px] text-gray-400 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{date}</p>
    </div>
  );
}
