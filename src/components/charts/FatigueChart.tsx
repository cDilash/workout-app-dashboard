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
import { InfoTooltip } from '@/components/ui/InfoTooltip';

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
      <div className="bg-black border border-gray-800 p-4 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Week of {label}</p>
        <div className="space-y-2">
          {volumeData && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <p className="text-sm font-bold text-white">
                {(Number(volumeData.value) / 1000).toFixed(1)}k <span className="text-gray-500 text-xs">{unit}</span>
              </p>
            </div>
          )}
          {rpeData && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <p className="text-sm font-bold text-white">
                RPE {rpeData.value}
              </p>
            </div>
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
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start">Fatigue Management</h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-bold text-white tracking-tight uppercase">Fatigue Management</h3>
        <InfoTooltip content="Compares weekly Volume (Training Stress) with Average RPE (Strain). If RPE rises while Volume falls, you may be overreaching." />
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
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
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
              tickLine={false}
              axisLine={false}
              label={{ value: `VOLUME (${unitPreference})`, angle: -90, position: 'insideLeft', fill: '#525252', fontSize: 9, fontWeight: 'bold', dy: 50 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 10]}
              tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
              tickLine={false}
              axisLine={false}
              label={{ value: 'AVG RPE', angle: 90, position: 'insideRight', fill: '#525252', fontSize: 9, fontWeight: 'bold', dy: -50 }}
            />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} iconType="rect" />
            
            <Bar 
              yAxisId="left" 
              dataKey="volume" 
              name="Volume" 
              fill="url(#volGradient)" 
              barSize={20} 
              radius={[2, 2, 0, 0]} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="rpe" 
              name="Avg RPE" 
              stroke="#737373" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#000000', strokeWidth: 2, stroke: '#737373' }} 
              activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
