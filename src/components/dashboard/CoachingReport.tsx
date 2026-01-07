'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { generateCoachingReport } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { Robot, TrendUp, TrendDown, Minus, Target, CheckCircle } from 'phosphor-react';

interface CoachingReportProps {
  workouts: Workout[];
  className?: string;
}

export function CoachingReport({ workouts, className }: CoachingReportProps) {
  const report = useMemo(() => generateCoachingReport(workouts), [workouts]);

  if (!report) return null;

  return (
    <div className={cn("bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg", className)}>
      <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          <Robot size={24} weight="duotone" className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Coach&apos;s Report</h3>
          <p className="text-xs text-blue-100 uppercase tracking-wider font-medium">{report.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Adherence */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Adherence</span>
            <CheckCircle size={18} className={cn(
              report.adherence.rating === 'High' ? "text-green-300" : 
              report.adherence.rating === 'Moderate' ? "text-yellow-300" : "text-red-300"
            )} weight="fill" />
          </div>
          <p className="text-2xl font-bold">{report.adherence.count} <span className="text-sm font-normal text-blue-200">sessions</span></p>
          <p className="text-xs text-blue-100 mt-1 opacity-80">{report.adherence.message}</p>
        </div>

        {/* Volume Trend */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Volume Trend</span>
             {report.volumeTrend.direction === 'up' && <TrendUp size={18} className="text-green-300" weight="bold" />}
             {report.volumeTrend.direction === 'down' && <TrendDown size={18} className="text-red-300" weight="bold" />}
             {report.volumeTrend.direction === 'stable' && <Minus size={18} className="text-yellow-300" weight="bold" />}
          </div>
          <p className="text-2xl font-bold">
            {report.volumeTrend.percentChange > 0 ? '+' : ''}{report.volumeTrend.percentChange.toFixed(0)}%
          </p>
          <p className="text-xs text-blue-100 mt-1 opacity-80">vs. previous 7 days</p>
        </div>

        {/* Focus */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Primary Focus</span>
            <Target size={18} className="text-purple-300" weight="duotone" />
          </div>
          <p className="text-xl font-bold truncate">{report.focus.muscle}</p>
          <p className="text-xs text-blue-100 mt-1 opacity-80">
            {(report.focus.percentage * 100).toFixed(0)}% of total volume
          </p>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-sm font-medium italic text-white/90">
          &quot;{report.insight}&quot;
        </p>
        {report.recentPRs > 0 && (
          <div className="mt-2 text-xs font-bold text-yellow-300 flex items-center gap-1">
            <Target size={12} weight="fill" />
            {report.recentPRs} New Personal Records set!
          </div>
        )}
      </div>
    </div>
  );
}
