'use client';

import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { Workout } from '@/lib/types';
import { getSweetSpotData, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboard-store';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface SweetSpotChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: { date: string; name: string; volume: number; rpe: number } }[];
  unit: string;
}

const CustomTooltip = ({ active, payload, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black border border-gray-800 p-4 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{data.date}</p>
        <p className="text-sm font-black text-white mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-xs text-gray-300">Volume: <span className="text-white font-bold">{(data.volume / 1000).toFixed(1)}k {unit}</span></p>
          <p className="text-xs text-gray-300">Avg RPE: <span className="text-white font-bold">{data.rpe}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export function SweetSpotChart({ workouts, className }: SweetSpotChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = useMemo(() => getSweetSpotData(workouts), [workouts]);

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      volume: formatWeight(d.volume, unitPreference)
    }));
  }, [rawData, unitPreference]);

  const maxVol = Math.max(...data.map(d => d.volume), 1);

  if (data.length < 5) {
    return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[400px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Growth Zone</h3>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Insufficient data points</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Growth Zone (Vol vs RPE)</h3>
        <InfoTooltip content="Plots every workout. Your 'Growth Zone' is the area where you perform high volume at a moderate-high effort (RPE 7-9). Points in the top-right corner indicate potential overreaching." />
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
            <XAxis 
              type="number" 
              dataKey="volume" 
              name="Volume" 
              unit={unitPreference} 
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'TOTAL VOLUME', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 9, fontWeight: 'black' }}
            />
            <YAxis 
              type="number" 
              dataKey="rpe" 
              name="Avg RPE" 
              domain={[0, 10]}
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'AVG RPE', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9, fontWeight: 'black' }}
            />
            <ZAxis type="number" range={[50, 400]} />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={{ strokeDasharray: '3 3', stroke: '#3f3f46' }} />
            
            <ReferenceArea x1={maxVol * 0.6} x2={maxVol} y1={7} y2={9} fill="#ffffff" fillOpacity={0.03} label={{ value: 'GROWTH', position: 'center', fill: '#ffffff', fontSize: 10, fontWeight: 'black', opacity: 0.2 }} />
            <ReferenceArea x1={maxVol * 0.6} x2={maxVol} y1={9} y2={10} fill="#ffffff" fillOpacity={0.08} label={{ value: 'RISK', position: 'center', fill: '#ffffff', fontSize: 10, fontWeight: 'black', opacity: 0.3 }} />
            
            <Scatter 
              name="Workouts" 
              data={data} 
              fill="#ffffff" 
              line={false}
              shape="circle"
              className="drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-900 pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-gray-300">Growth Zone (Center)</span>
          <span>High volume, sustainable effort.</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-gray-300">Risk Zone (Top Right)</span>
          <span>Maximum volume AND effort.</span>
        </div>
      </div>
    </div>
  );
}