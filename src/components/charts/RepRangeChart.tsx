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
      <div className="bg-black border border-gray-800 p-3 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{payload[0].payload.name}</p>
        <p className="text-sm font-bold text-white">
          Sets: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function RepRangeChart({ workouts, className }: RepRangeChartProps) {
  const data = getRepRangeDistribution(workouts);
  // Grey scale palette
  const colors = ['#ffffff', '#a3a3a3', '#525252', '#262626']; 

  if (data.every(d => d.value === 0)) {
     return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Rep Ranges</h3>
        <p className="text-gray-500 text-sm font-medium">No valid sets found</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Rep Range Distribution</h3>
        <InfoTooltip content="Breakdown of your sets into specific rep zones: Strength (1-5), Hypertrophy (6-12), Endurance (13-20), and Conditioning (20+). Excludes warmup sets." />
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#262626" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 10, fill: '#737373', fontWeight: 'bold' }} 
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#171717' }} />
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
