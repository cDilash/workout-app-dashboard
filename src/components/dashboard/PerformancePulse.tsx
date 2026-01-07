'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { getPerformancePulse, PerformanceInsight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TrendUp, WarningCircle, Activity, CaretRight } from 'phosphor-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface PerformancePulseProps {
  workouts: Workout[];
  className?: string;
}

export function PerformancePulse({ workouts, className }: PerformancePulseProps) {
  const insights = useMemo(() => getPerformancePulse(workouts), [workouts]);
  
  const trending = insights.filter(i => i.status === 'trending');
  const stalled = insights.filter(i => i.status === 'stalled');

  if (insights.length === 0) return null;

  return (
    <div className={cn("bw-card rounded-xl flex flex-col", className)}>
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-white" weight="bold" />
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Performance Pulse</h3>
          <InfoTooltip content="Identifies exercises with significant growth (>5% e1RM) or plateaus (0% growth in 4 weeks)." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-900">
        {/* Trending Section */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Trending Up</span>
          </div>
          
          <div className="space-y-4">
            {trending.length > 0 ? trending.slice(0, 4).map(item => (
              <PulseItem key={item.id} item={item} />
            )) : (
              <p className="text-xs text-gray-600 font-bold uppercase italic tracking-widest py-4">No surge detected</p>
            )}
          </div>
        </div>

        {/* Stalled Section */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-gray-700" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Needs Focus</span>
          </div>

          <div className="space-y-4">
            {stalled.length > 0 ? stalled.slice(0, 4).map(item => (
              <PulseItem key={item.id} item={item} />
            )) : (
              <p className="text-xs text-gray-600 font-bold uppercase italic tracking-widest py-4">All metrics climbing</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PulseItem({ item }: { item: PerformanceInsight }) {
  const isTrending = item.status === 'trending';
  
  return (
    <div className="group flex items-center justify-between p-3 rounded-lg border border-gray-900 hover:border-gray-700 transition-all bg-black/40">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "w-8 h-8 rounded flex items-center justify-center shrink-0",
          isTrending ? "bg-white text-black" : "bg-gray-900 text-gray-500"
        )}>
          {isTrending ? <TrendUp size={16} weight="bold" /> : <WarningCircle size={16} weight="bold" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-white uppercase truncate tracking-tight">{item.name}</p>
          <p className="text-[9px] font-bold text-gray-600 uppercase mt-0.5">Last: {item.lastPerformed}</p>
        </div>
      </div>
      
      <div className="text-right ml-4">
        <p className={cn(
          "text-xs font-black tracking-tighter",
          isTrending ? "text-white" : "text-gray-500"
        )}>
          {isTrending ? `+${item.change.toFixed(1)}%` : 'STALLED'}
        </p>
        <CaretRight size={10} className="text-gray-800 ml-auto mt-1" weight="bold" />
      </div>
    </div>
  );
}
