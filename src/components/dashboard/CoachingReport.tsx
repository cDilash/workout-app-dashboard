'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { generateCoachingReport } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { Robot, TrendUp, TrendDown, Minus, Target, CheckCircle, Sparkle } from 'phosphor-react';

interface CoachingReportProps {
  workouts: Workout[];
  className?: string;
}

export function CoachingReport({ workouts, className }: CoachingReportProps) {
  const report = useMemo(() => generateCoachingReport(workouts), [workouts]);

  if (!report) return null;

  return (
    <div className={cn("bw-card rounded-xl p-8", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center">
            <Robot size={24} weight="fill" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">INTELLIGENCE REPORT</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{report.period}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Grade: <span className="text-white ml-1">{report.adherence.rating}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Adherence */}
        <div className="p-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Consistency</span>
            <CheckCircle size={16} className="text-white" weight="fill" />
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter">{report.adherence.count}</p>
          <p className="text-xs text-gray-400 mt-2 border-t border-gray-800 pt-2">{report.adherence.message}</p>
        </div>

        {/* Volume Trend */}
        <div className="p-0 border-l border-gray-800 pl-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Trend</span>
             {report.volumeTrend.direction === 'up' && <TrendUp size={16} className="text-white" weight="bold" />}
             {report.volumeTrend.direction === 'down' && <TrendDown size={16} className="text-white" weight="bold" />}
             {report.volumeTrend.direction === 'stable' && <Minus size={16} className="text-gray-500" weight="bold" />}
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter">
            {report.volumeTrend.percentChange > 0 ? '+' : ''}{report.volumeTrend.percentChange.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-2 border-t border-gray-800 pt-2">Volume vs last cycle</p>
        </div>

        {/* Focus */}
        <div className="p-0 border-l border-gray-800 pl-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Focus</span>
            <Target size={16} className="text-white" weight="fill" />
          </div>
          <p className="text-2xl font-bold text-white truncate uppercase tracking-tight pt-2">{report.focus.muscle}</p>
          <p className="text-xs text-gray-400 mt-3 border-t border-gray-800 pt-2">
            {(report.focus.percentage * 100).toFixed(0)}% of total output
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-start gap-4">
          <div className="mt-1">
             <Sparkle size={16} weight="fill" className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300 leading-relaxed">
              &quot;{report.insight}&quot;
            </p>
            {report.recentPRs > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded uppercase">
                  {report.recentPRs} New Records
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
