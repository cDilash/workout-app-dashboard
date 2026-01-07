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
    <div className={cn("bw-card rounded-xl flex flex-col", className)}>
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
          <Trophy size={20} className="text-white" weight="fill" />
          Personal Records
        </h3>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded border border-gray-800">
          ALL TIME
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-900">
        {records.map((rec) => (
          <div key={rec.exerciseId} className="p-5 hover:bg-white/5 transition-colors">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              {rec.exerciseName}
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
              <PRMetric 
                label="Weight" 
                value={`${rec.maxWeight}${unitPreference}`} 
                date={rec.maxWeightDate} 
                isNew={isNew(rec.maxWeightDate)}
                icon={Crown}
              />
              <PRMetric 
                label="e1RM" 
                value={`${rec.maxE1RM}${unitPreference}`} 
                date={rec.maxE1RMDate} 
                isNew={isNew(rec.maxE1RMDate)}
                icon={Medal}
              />
               <PRMetric 
                label="Volume" 
                value={`${(rec.maxVolume / 1000).toFixed(1)}k`} 
                date={rec.maxVolumeDate} 
                isNew={isNew(rec.maxVolumeDate)}
                icon={Trophy}
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
}: { 
  label: string; 
  value: string; 
  date: string; 
  isNew: boolean; 
  icon: React.ElementType;
}) {
  return (
    <div className={cn(
      "bg-black border rounded-lg p-3 flex flex-col items-center text-center relative overflow-hidden transition-all",
      isNew ? "border-white" : "border-gray-900"
    )}>
      {isNew && (
        <div className="absolute top-0 right-0 bg-white text-black text-[8px] font-black px-1.5 py-0.5 rounded-bl uppercase tracking-tighter">
          NEW
        </div>
      )}
      <div className="mb-2 text-gray-500">
        <Icon size={16} weight="fill" className={cn(isNew && "text-white")} />
      </div>
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-sm font-black text-white leading-tight">{value}</p>
      <p className="text-[9px] font-bold text-gray-700 mt-1 uppercase tracking-tighter">{date}</p>
    </div>
  );
}