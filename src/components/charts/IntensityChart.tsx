'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Workout } from '@/lib/types';
import { getHardSetsAnalysis } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface IntensityChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; payload: { date: string; hard: number; easy: number } }[];
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Week of {label}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-red-500">
            Hard Sets: {payload[0].value}
          </p>
           <p className="text-sm font-bold text-blue-400">
            Easy Sets: {payload[1]?.value}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function IntensityChart({ workouts, className }: IntensityChartProps) {
  const data = getHardSetsAnalysis(workouts);

  if (data.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center min-h-[300px]", className)}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 self-start">Training Intensity</h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <div className="flex items-center gap-1.5 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Intensity (Hard Sets)</h3>
        <InfoTooltip content="Counts the number of sets performed at a high effort (RPE 7+ or RIR 3-). Hard sets are the primary driver of muscle growth." />
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey="hard" name="Hard Sets (RPE 7+)" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
            <Bar dataKey="easy" name="Submax Sets" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
