'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Workout } from '@/lib/types';
import { getVolumeOverTime, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDashboardStore } from '@/stores/dashboard-store';

interface VolumeChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; payload: { date: string; rawVolume: number } }[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-gray-800 p-3 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-sm font-bold text-white">
          Volume: {(Number(payload[0].value) / 1000).toFixed(1)}k {unit}
        </p>
      </div>
    );
  }
  return null;
};

export function VolumeChart({ workouts, className }: VolumeChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = useMemo(() => getVolumeOverTime(workouts), [workouts]);

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      volume: formatWeight(d.volume, unitPreference)
    }));
  }, [rawData, unitPreference]);

  if (data.length === 0) {
    return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Volume Load</h3>
        <p className="text-gray-500 text-sm font-medium">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight">Volume Load ({unitPreference})</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={{ stroke: '#525252' }} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#ffffff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVolume)"
              activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: 'black' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}