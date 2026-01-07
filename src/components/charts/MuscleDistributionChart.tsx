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
import { InfoTooltip } from '@/components/ui/InfoTooltip';

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
      <div className="bg-black border border-gray-800 p-3 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{payload[0].payload.name}</p>
        <p className="text-sm font-bold text-white">
          {(Number(payload[0].value) / 1000).toFixed(1)}k {unit}
        </p>
      </div>
    );
  }
  return null;
};

export function MuscleDistributionChart({ workouts, className }: MuscleDistributionChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = useMemo(() => getMuscleDistribution(workouts), [workouts]);

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      value: formatWeight(d.value, unitPreference)
    }));
  }, [rawData, unitPreference]);

  if (data.length < 3) {
    return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Muscle Split</h3>
        <p className="text-gray-500 text-sm font-medium">Need at least 3 muscle groups</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Muscle Split ({unitPreference})</h3>
        <InfoTooltip content="A radar visualization showing the relative focus on each muscle group. A balanced shape indicates a well-rounded program." />
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#262626" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: '#737373', fontSize: 10, fontWeight: 'bold' }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'auto']} 
              tick={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={false} />
            <Radar
              name="Volume"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
              fill="#ffffff"
              fillOpacity={0.1}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
