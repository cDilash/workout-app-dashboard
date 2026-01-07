'use client';

import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Workout } from '@/lib/types';
import { getMuscleDistribution, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDashboardStore } from '@/stores/dashboard-store';

interface MuscleDistributionChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  payload?: { value: ValueType; payload: { name: string; value: number } }[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{payload[0].payload.name}</p>
        <p className="text-sm text-purple-600 dark:text-purple-400">
          Volume: {payload[0].value && (Number(payload[0].value) / 1000).toFixed(1)}k {unit}
        </p>
      </div>
    );
  }
  return null;
};

export function MuscleDistributionChart({ workouts, className }: MuscleDistributionChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = getMuscleDistribution(workouts);

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      value: formatWeight(d.value, unitPreference)
    }));
  }, [rawData, unitPreference]);

  if (data.length < 3) {
    // Radar charts need at least 3 points to look good
    return (
      <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center min-h-[300px]", className)}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 self-start">Muscle Split</h3>
        <p className="text-gray-400 text-sm">Need at least 3 muscle groups to show distribution</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Muscle Split ({unitPreference})</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" className="dark:opacity-10" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'auto']} 
              tick={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} />
            <Radar
              name="Volume"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
