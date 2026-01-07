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

  // Update selected ID if exercises change (e.g. new import) and current selection is invalid
  React.useEffect(() => {
     if (exercises.length > 0 && !exercises.find(e => e.id === selectedExerciseId)) {
         setSelectedExerciseId(exercises[0].id);
     }
  }, [exercises, selectedExerciseId]);


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
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strength Progression ({unitPreference})</h3>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="block w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
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
