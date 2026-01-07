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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
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
    <div className={cn("bw-card rounded-xl p-4 max-w-sm mx-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">Activity</h3>
          <InfoTooltip content="Monthly training consistency. Light grey indicates completed sessions." />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{monthName.slice(0,3)} {year}</span>
          <div className="flex gap-1">
            <button onClick={() => changeMonth(-1)} className="p-0.5 hover:bg-white/10 rounded border border-gray-800 transition-colors">
              <CaretLeft size={12} weight="bold" />
            </button>
            <button onClick={() => changeMonth(1)} className="p-0.5 hover:bg-white/10 rounded border border-gray-800 transition-colors">
              <CaretRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[9px] font-black text-gray-700 mb-1">
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
                "aspect-square flex flex-col items-center justify-center rounded-md border text-[10px] font-bold transition-all",
                hasWorkout 
                  ? "bg-gray-300 text-black border-gray-300" 
                  : "bg-transparent text-gray-600 border-gray-900",
                isToday && !hasWorkout && "border-white/40 text-white"
              )}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
