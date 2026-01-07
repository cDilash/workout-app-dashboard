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
    <div className={cn("glass-card rounded-[2rem] p-8 relative overflow-hidden", className)}>
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
            <Robot size={32} weight="duotone" className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Intelligence Report</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{report.period}</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Generated Insights</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
          <Sparkle size={16} weight="fill" className="text-yellow-500 shadow-yellow-500/50" />
          <p className="text-xs font-bold text-gray-300 uppercase tracking-tight">Performance Score: <span className="text-white ml-1">{report.adherence.rating}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* Adherence */}
        <div className="group glass-card bg-white/5 rounded-3xl p-6 border-white/5 hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Consistency</span>
            <CheckCircle size={20} className={cn(
              report.adherence.rating === 'High' ? "text-green-400" : 
              report.adherence.rating === 'Moderate' ? "text-yellow-400" : "text-red-400"
            )} weight="fill" />
          </div>
          <p className="text-3xl font-black text-white">{report.adherence.count} <span className="text-sm font-medium text-gray-500 uppercase ml-1">sessions</span></p>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">{report.adherence.message}</p>
        </div>

        {/* Volume Trend */}
        <div className="group glass-card bg-white/5 rounded-3xl p-6 border-white/5 hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Growth Trend</span>
             {report.volumeTrend.direction === 'up' && <TrendUp size={20} className="text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" weight="bold" />}
             {report.volumeTrend.direction === 'down' && <TrendDown size={20} className="text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" weight="bold" />}
             {report.volumeTrend.direction === 'stable' && <Minus size={20} className="text-gray-400" weight="bold" />}
          </div>
          <p className="text-3xl font-black text-white">
            {report.volumeTrend.percentChange > 0 ? '+' : ''}{report.volumeTrend.percentChange.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">Workload change vs previous cycle</p>
        </div>

        {/* Focus */}
        <div className="group glass-card bg-white/5 rounded-3xl p-6 border-white/5 hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Primary Focus</span>
            <Target size={20} className="text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" weight="duotone" />
          </div>
          <p className="text-2xl font-black text-white truncate uppercase tracking-tight">{report.focus.muscle}</p>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Concentrating <span className="text-white font-bold">{(report.focus.percentage * 100).toFixed(0)}%</span> of total output
          </p>
        </div>
      </div>

      <div className="glass-card bg-white/5 rounded-[1.5rem] p-6 border-white/5 border-l-4 border-l-blue-500 relative z-10">
        <div className="flex items-start gap-4">
          <div className="mt-1">
             <Sparkle size={20} weight="fill" className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/90 leading-relaxed italic">
              &quot;{report.insight}&quot;
            </p>
            {report.recentPRs > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(Math.min(3, report.recentPRs))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-blue-600 border-2 border-black flex items-center justify-center text-[10px] font-black text-white">
                      PR
                    </div>
                  ))}
                </div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-wider ml-2">
                  {report.recentPRs} New Records Established
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}