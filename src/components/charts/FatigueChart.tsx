'use client';

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Workout } from '@/lib/types';
import { getFatigueData, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDashboardStore } from '@/stores/dashboard-store';

interface FatigueChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; dataKey: string; payload: { date: string; volume: number; rpe: number } }[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const volumeData = payload.find(p => p.dataKey === 'volume');
    const rpeData = payload.find(p => p.dataKey === 'rpe');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Week of {label}</p>
        <div className="space-y-1">
          {volumeData && (
            <p className="text-sm font-bold text-blue-500">
              Volume: {(Number(volumeData.value) / 1000).toFixed(1)}k {unit}
            </p>
          )}
          {rpeData && (
            <p className="text-sm font-bold text-red-500">
              Avg RPE: {rpeData.value}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function FatigueChart({ workouts, className }: FatigueChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = useMemo(() => getFatigueData(workouts), [workouts]);

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      volume: formatWeight(d.volume, unitPreference)
    }));
  }, [rawData, unitPreference]);

  if (data.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center min-h-[300px]", className)}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 self-start">Fatigue Management</h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Fatigue Management (Vol vs RPE)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: '#3b82f6' }} 
              tickLine={false}
              axisLine={false}
              label={{ value: `Volume (${unitPreference})`, angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 10 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 10]}
              tick={{ fontSize: 12, fill: '#ef4444' }} 
              tickLine={false}
              axisLine={false}
              label={{ value: 'Avg RPE', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar yAxisId="left" dataKey="volume" name="Volume" fill="#3b82f6" fillOpacity={0.3} barSize={20} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="rpe" name="Avg RPE" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
