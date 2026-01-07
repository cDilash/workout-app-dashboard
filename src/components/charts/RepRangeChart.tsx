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
  Cell,
} from 'recharts';
import { Workout } from '@/lib/types';
import { getRepRangeDistribution } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface RepRangeChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  payload?: { value: ValueType; payload: { name: string; value: number } }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{payload[0].payload.name}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Sets: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function RepRangeChart({ workouts, className }: RepRangeChartProps) {
  const data = getRepRangeDistribution(workouts);
  const colors = ['#f87171', '#34d399', '#60a5fa', '#a78bfa']; // Red, Green, Blue, Purple

  if (data.every(d => d.value === 0)) {
     return (
      <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center min-h-[300px]", className)}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 self-start">Rep Ranges</h3>
        <p className="text-gray-400 text-sm">No valid sets found (non-warmup)</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <div className="flex items-center gap-1.5 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rep Range Distribution</h3>
        <InfoTooltip content="Breakdown of your sets into specific rep zones: Strength (1-5), Hypertrophy (6-12), Endurance (13-20), and Conditioning (20+). Excludes warmup sets." />
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}