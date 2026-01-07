'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Workout } from '@/lib/types';
import { getVolumeOverTime, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboard-store';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface VolumeChartProps {
  workouts: Workout[];
  className?: string;
}

// Recharts Tooltip props can be complex, simplifying for our usage
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; payload: { date: string; volume: number } }[]; 
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Week of {label}</p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {payload[0].value && (Number(payload[0].value) / 1000).toFixed(1)}k <span className="text-xs font-normal text-gray-500">{unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function VolumeChart({ workouts, className }: VolumeChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = getVolumeOverTime(workouts);

  const data = React.useMemo(() => {
    return rawData.map(d => ({
      ...d,
      volume: formatWeight(d.volume, unitPreference)
    }));
  }, [rawData, unitPreference]);

  // Format volume for Y-axis (e.g., 1000 -> 1k)
  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700", className)}>
        <p className="text-gray-400">Not enough data for volume trends</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Volume Progression ({unitPreference})</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={formatYAxis} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVolume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
