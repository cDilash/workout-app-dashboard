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
    <div className={cn("bw-card rounded-xl p-6 flex flex-col h-[480px] overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white uppercase tracking-tight">Activity Calendar</h3>
          <InfoTooltip content="Monthly training consistency. Light grey indicates completed sessions." />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{monthName} {year}</span>
          <div className="flex gap-1">
            <button 
              onClick={() => changeMonth(-1)} 
              className="p-1 hover:bg-white hover:text-black rounded border border-gray-800 transition-all"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button 
              onClick={() => changeMonth(1)} 
              className="p-1 hover:bg-white hover:text-black rounded border border-gray-800 transition-all"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
              <div key={i} className="text-center text-[9px] font-black text-gray-700 mb-2 uppercase">
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
                    "aspect-square flex flex-col items-center justify-center rounded-lg border text-[10px] font-bold transition-all duration-200",
                    hasWorkout 
                      ? "bg-gray-300 text-black border-gray-300" 
                      : "bg-white/5 text-gray-600 border-white/5 hover:border-white/20",
                    isToday && !hasWorkout && "border-white text-white"
                  )}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-300" />
          <span>Session</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/5" />
          <span>Rest</span>
        </div>
      </div>
    </div>
  );
}