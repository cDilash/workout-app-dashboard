'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Workout } from '@/lib/types';
import { getWeeklyHardSets } from '@/lib/stats';
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
  payload?: { value: ValueType }[];
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-gray-800 p-3 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-sm font-bold text-white">
          Hard Sets: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function IntensityChart({ workouts, className }: IntensityChartProps) {
  const data = useMemo(() => getWeeklyHardSets(workouts), [workouts]);

  if (data.length === 0) {
    return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Weekly Intensity</h3>
        <p className="text-gray-500 text-sm font-medium">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Weekly Intensity (Hard Sets)</h3>
        <InfoTooltip content="Counts the number of sets performed at a high effort (RPE 7+ or RIR 3-). Hard sets are the primary driver of muscle growth." />
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#171717' }} />
            <Bar dataKey="hardSets" fill="#ffffff" radius={[2, 2, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}