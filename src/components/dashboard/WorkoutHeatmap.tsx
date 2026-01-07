'use client';

import React, { useMemo, useState } from 'react';
import { Workout } from '@/lib/types';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { CaretLeft, CaretRight } from 'phosphor-react';

interface WorkoutHeatmapProps {
  workouts: Workout[];
  className?: string;
}

export function WorkoutHeatmap({ workouts, className }: WorkoutHeatmapProps) {
  const [viewDate, setViewDate] = useState(new Date());

  // Map of date string -> number of workouts
  const workoutMap = useMemo(() => {
    const map = new Map<string, number>();
    workouts.forEach(w => {
      const d = new Date(w.metadata.date).toISOString().split('T')[0];
      map.set(d, (map.get(d) || 0) + 1);
    });
    return map;
  }, [workouts]);

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Adjust to start on Monday (0=Sun, 1=Mon... 6=Sat)
    // We want Mon=0, Tue=1 ... Sun=6
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    
    // Add padding for previous month
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // Add days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const changeMonth = (offset: number) => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + offset);
    setViewDate(next);
  };

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Activity Calendar</h3>
          <InfoTooltip content="A monthly view of your training consistency. Highlighted days indicate completed sessions." />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{monthName} {year}</span>
          <div className="flex gap-1">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-white hover:text-black rounded transition-colors border border-gray-800"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-white hover:text-black rounded transition-colors border border-gray-800"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-gray-600 mb-2 uppercase">
            {day}
          </div>
        ))}
        
        {calendarData.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} className="aspect-square" />;
          
          const dateStr = date.toISOString().split('T')[0];
          const hasWorkout = workoutMap.has(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div 
              key={dateStr}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all relative",
                hasWorkout 
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  : "bg-transparent text-gray-500 border-gray-900 hover:border-gray-700",
                isToday && !hasWorkout && "border-white/50 text-white"
              )}
            >
              {date.getDate()}
              {hasWorkout && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-black" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded bg-white border border-white" />
            <span>Workout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded border border-gray-800" />
            <span>Rest</span>
          </div>
        </div>
        <span>Total This Month: {calendarData.filter(d => d && workoutMap.has(d.toISOString().split('T')[0])).length}</span>
      </div>
    </div>
  );
}