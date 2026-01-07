'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { getYearlySummary, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Barbell, Calendar, Lightning, Trophy, ShareNetwork } from 'phosphor-react';

interface YearInLiftProps {
  workouts: Workout[];
  className?: string;
}

export function YearInLift({ workouts, className }: YearInLiftProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const summary = useMemo(() => getYearlySummary(workouts), [workouts]);

  if (!summary) return null;

  return (
    <div className={cn("bg-zinc-950 rounded-2xl p-8 text-white relative overflow-hidden", className)}>
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic uppercase leading-none">
              Year in <br />
              <span className="text-blue-500 underline decoration-purple-500">Lift</span>
            </h2>
            <p className="text-zinc-500 font-bold mt-2 tracking-widest uppercase text-xs">{summary.year}</p>
          </div>
          <div className="bg-zinc-800 p-3 rounded-full hover:bg-zinc-700 cursor-pointer transition-colors">
            <ShareNetwork size={20} weight="bold" />
          </div>
        </div>

        <div className="space-y-8">
          <StatRow 
            icon={Barbell} 
            label="Total Volume" 
            value={`${(formatWeight(summary.totalVolume, unitPreference) / 1000).toFixed(1)}k`} 
            unit={unitPreference}
            color="text-blue-400"
          />
          <StatRow 
            icon={Lightning} 
            label="Workouts Completed" 
            value={summary.totalWorkouts} 
            color="text-yellow-400"
          />
          <StatRow 
            icon={Trophy} 
            label="Favorite Muscle" 
            value={summary.topMuscle} 
            color="text-purple-400"
          />
          <StatRow 
            icon={Calendar} 
            label="Most Active Day" 
            value={summary.topDay} 
            color="text-green-400"
          />
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-between items-center text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
          <span>Workout Dashboard</span>
          <div className="flex gap-2">
            <span>{summary.totalSets} Sets</span>
            <span>•</span>
            <span>{summary.totalReps} Reps</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatRowProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}

function StatRow({ icon: Icon, label, value, unit, color }: StatRowProps) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={cn("p-3 rounded-xl bg-zinc-900 border border-zinc-800 transition-transform group-hover:scale-110", color)}>
        <Icon size={24} weight="fill" />
      </div>
      <div>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{label}</p>
        <p className="text-2xl font-black tabular-nums tracking-tight">
          {value} {unit && <span className="text-sm font-medium text-zinc-600">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
