'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { getYearInLiftStats } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Trophy, Barbell, CalendarCheck, Fire } from 'phosphor-react';

interface YearInLiftProps {
  workouts: Workout[];
  className?: string;
}

export function YearInLift({ workouts, className }: YearInLiftProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const stats = useMemo(() => getYearInLiftStats(workouts), [workouts]);

  if (!stats) return null;

  return (
    <div className={cn("bw-card rounded-xl p-8 relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Trophy size={120} weight="fill" className="text-white" />
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-black text-white mb-1 tracking-tighter uppercase">Year In Lift</h3>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">2025 Performance Review</p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Barbell size={16} className="text-white" weight="fill" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Load</span>
            </div>
            <p className="text-2xl font-bold text-white">{(stats.totalVolume / 1000).toFixed(0)}k <span className="text-sm text-gray-500">{unitPreference}</span></p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck size={16} className="text-white" weight="fill" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fire size={16} className="text-white" weight="fill" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Days</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeDays}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-white" weight="fill" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top Move</span>
            </div>
            <p className="text-xl font-bold text-white truncate">{stats.topExercise}</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800">
           <p className="text-xs font-medium text-gray-400 italic">
             &quot;Consistency is the bridge between goals and accomplishment.&quot;
           </p>
        </div>
      </div>
    </div>
  );
}