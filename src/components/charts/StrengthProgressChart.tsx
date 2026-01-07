'use client';

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Workout } from '@/lib/types';
import { getAvailableExercises, getExerciseHistory, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDashboardStore } from '@/stores/dashboard-store';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface StrengthProgressChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; payload: { date: string; e1rm: number; weight: number; reps: number } }[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            Est. 1RM: {payload[0].value} {unit}
          </p>
          <p className="text-xs text-gray-500">
            Set: {payload[0].payload.weight}{unit} x {payload[0].payload.reps}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function StrengthProgressChart({ workouts, className }: StrengthProgressChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const exercises = useMemo(() => getAvailableExercises(workouts), [workouts]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || '');
  const [searchTerm, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Update selected ID if exercises change (e.g. new import) and current selection is invalid
  React.useEffect(() => {
     if (exercises.length > 0 && !exercises.find(e => e.id === selectedExerciseId)) {
         setSelectedExerciseId(exercises[0].id);
     }
  }, [exercises, selectedExerciseId]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  const selectedName = exercises.find(e => e.id === selectedExerciseId)?.name || 'Select Exercise';

  const rawData = useMemo(() => {
    if (!selectedExerciseId) return [];
    return getExerciseHistory(workouts, selectedExerciseId);
  }, [workouts, selectedExerciseId]);

  const data = useMemo(() => {
    return rawData.map(d => ({
        ...d,
        e1rm: formatWeight(d.e1rm, unitPreference),
        weight: formatWeight(d.weight, unitPreference)
    }));
  }, [rawData, unitPreference]);


  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strength Progression</h3>
          <InfoTooltip content="Estimated 1RM (Rep Max) is a theoretical calculation of the maximum weight you could lift for a single rep, based on your best performance each day." />
        </div>
        
        {/* Searchable Select */}
        <div className="relative w-full sm:w-64 z-20">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
          >
            <span className="truncate">{selectedName}</span>
            <span className="ml-2 text-gray-400">▼</span>
          </button>

          {isOpen && (
            <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border-b border-gray-100 dark:border-gray-700 bg-transparent text-sm focus:outline-none dark:text-white"
                autoFocus
              />
              <div className="overflow-y-auto flex-1">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExerciseId(ex.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors",
                      ex.id === selectedExerciseId ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {ex.name}
                  </button>
                ))}
                {filteredExercises.length === 0 && (
                  <div className="p-3 text-sm text-gray-400 text-center">No exercises found</div>
                )}
              </div>
            </div>
          )}
          {isOpen && (
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
          )}
        </div>
      </div>

      <div className="h-[350px] w-full">
        {data.length < 2 ? (
          <div className="flex items-center justify-center h-full text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            Not enough history for this exercise (need at least 2 sessions)
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={['dataMin - 5', 'auto']}
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip unit={unitPreference} />} />
              <Legend verticalAlign="top" height={36}/>
              <Line
                name="Estimated 1RM"
                type="monotone"
                dataKey="e1rm"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
