'use client';

import React, { useMemo, useState } from 'react';
import { Workout } from '@/lib/types';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { CaretLeft, CaretRight, X, Barbell, Hash, TrendUp } from 'phosphor-react';
import { formatWeight } from '@/lib/stats';
import { useDashboardStore } from '@/stores/dashboard-store';

interface WorkoutHeatmapProps {
  workouts: Workout[];
  className?: string;
}

export function WorkoutHeatmap({ workouts, className }: WorkoutHeatmapProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Map of date string -> array of workouts
  const workoutMap = useMemo(() => {
    const map = new Map<string, Workout[]>();
    workouts.forEach(w => {
      const d = new Date(w.metadata.date).toISOString().split('T')[0];
      const existing = map.get(d) || [];
      map.set(d, [...existing, w]);
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

  const selectedWorkouts = selectedDate ? workoutMap.get(selectedDate) || [] : [];

  return (
    <div className={cn("bw-card rounded-xl p-6 flex flex-col h-[480px] overflow-hidden relative", className)}>
      {/* Calendar View */}
      <div className={cn("flex flex-col h-full transition-all duration-500", selectedDate ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Activity Calendar</h3>
            <InfoTooltip content="Click a training day to view workout details." />
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
                  <button 
                    key={dateStr}
                    onClick={() => hasWorkout && setSelectedDate(dateStr)}
                    disabled={!hasWorkout}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all duration-300",
                      hasWorkout 
                        ? "bg-gray-300 text-black border-gray-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:scale-110 cursor-pointer" 
                        : "bg-white/[0.07] text-gray-600 border-transparent cursor-default",
                      isToday && !hasWorkout && "border-white/60 text-white bg-white/10"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gray-300" />
              <span>Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-white/[0.07]" />
              <span>Rest</span>
            </div>
          </div>
          <div className="text-white font-black">
            Total Sessions: {calendarData.filter(d => d && workoutMap.has(d.toISOString().split('T')[0])).length}
          </div>
        </div>
      </div>

      {/* Workout Detail View */}
      {selectedDate && (
        <div className="absolute inset-0 bg-black z-20 flex flex-col p-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Session Summary</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{new Date(selectedDate).toLocaleDateString('default', { dateStyle: 'full' })}</p>
            </div>
            <button 
              onClick={() => setSelectedDate(null)}
              className="p-2 bg-white/5 hover:bg-white text-gray-400 hover:text-black rounded-full transition-all border border-white/10"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {selectedWorkouts.map((workout, wIdx) => {
              const totalVolume = workout.exercises.reduce((acc, ex) => {
                return acc + ex.sets.reduce((sAcc, s) => s.is_deleted ? sAcc : sAcc + (s.weight_kg * s.reps), 0);
              }, 0);
              const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => !s.is_deleted).length, 0);

              return (
                <div key={workout.id || wIdx} className="mb-8">
                  {/* Workout Stats Header */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <DetailStat icon={Barbell} label="Exercises" value={workout.exercises.length} />
                    <DetailStat icon={Hash} label="Total Sets" value={totalSets} />
                    <DetailStat 
                      icon={TrendUp} 
                      label="Volume" 
                      value={`${(formatWeight(totalVolume, unitPreference) / 1000).toFixed(1)}k`} 
                      unit={unitPreference}
                    />
                  </div>

                  {/* Exercise List */}
                  <div className="space-y-6">
                    {workout.exercises.map((ex, eIdx) => (
                      <div key={ex.id || eIdx} className="border-l-2 border-gray-800 pl-4">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-3">{ex.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {ex.sets.filter(s => !s.is_deleted).map((set, sIdx) => (
                            <div key={sIdx} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded text-[10px] font-bold text-gray-400">
                              <span className="text-white">{formatWeight(set.weight_kg, unitPreference)}{unitPreference}</span>
                              <span className="mx-1 text-gray-700">×</span>
                              <span className="text-white">{set.reps}</span>
                              {set.rpe && <span className="ml-2 text-gray-600">@RPE{set.rpe}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string | number, unit?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center">
      <div className="text-gray-500 mb-2">
        <Icon size={16} weight="fill" />
      </div>
      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-lg font-black text-white leading-none">
        {value}
        {unit && <span className="text-[10px] font-normal text-gray-500 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}