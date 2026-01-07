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
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Activity Calendar</h3>
          <InfoTooltip content="Monthly training consistency. Grey blocks indicate completed sessions." />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{monthName} {year}</span>
          <div className="flex gap-1">
            <button 
              onClick={() => changeMonth(-1)} 
              className="p-1.5 hover:bg-white hover:text-black rounded-lg border border-gray-800 transition-all"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button 
              onClick={() => changeMonth(1)} 
              className="p-1.5 hover:bg-white hover:text-black rounded-lg border border-gray-800 transition-all"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-black text-gray-700 mb-2 uppercase tracking-tighter">
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
                    "aspect-square flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all duration-300",
                    hasWorkout 
                      ? "bg-gray-300 text-black border-gray-300 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                      : "bg-white/[0.07] text-gray-600 border-transparent hover:border-white/20",
                    isToday && !hasWorkout && "border-white/60 text-white bg-white/10"
                  )}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-300" />
            <span>Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-white/[0.07]" />
            <span>Rest</span>
          </div>
        </div>
        <div className="text-white font-black">
          Total: {calendarData.filter(d => d && workoutMap.has(d.toISOString().split('T')[0])).length}
        </div>
      </div>
    </div>
  );
}
