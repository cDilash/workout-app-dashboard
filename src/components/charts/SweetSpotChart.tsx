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
  payload?: { payload: { date: string; volume: number; rpe: number; originalVolume: number } }[];
  unit: string;
}

const CustomTooltip = ({ active, payload, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black border border-gray-800 p-4 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{data.date}</p>
        <div className="space-y-1">
          <p className="text-xs text-gray-300">Volume: <span className="text-white font-bold">{(data.originalVolume / 1000).toFixed(1)}k {unit}</span></p>
          <p className="text-xs text-gray-300">Avg RPE: <span className="text-white font-bold">{data.rpe.toFixed(1)}</span></p>
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
    const coords: Record<string, number> = {};
    return rawData.map(d => {
      const vol = formatWeight(d.volume, unitPreference);
      const roundedRpe = Math.round(d.rpe * 2) / 2;
      const key = `${vol}-${roundedRpe}`;
      coords[key] = (coords[key] || 0) + 1;
      const count = coords[key];
      
      const jitterX = count > 1 ? (Math.sin(count) * (vol * 0.01)) : 0;
      const jitterY = count > 1 ? (Math.cos(count) * 0.1) : 0;

      return {
        ...d,
        originalVolume: vol,
        volume: vol + jitterX,
        rpe: d.rpe + jitterY,
      };
    }).sort((a, b) => a.volume - b.volume);
  }, [rawData, unitPreference]);

  const maxVol = Math.max(...data.map(d => d.originalVolume), 1);

  if (data.length < 5) {
    return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[450px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Growth Zone</h3>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Insufficient data points</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6 flex flex-col h-[480px]", className)}>
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Growth Zone (Vol vs RPE)</h3>
        <InfoTooltip content="Each dot is a workout. High volume at high intensity (RPE 7-9) is the primary driver of growth." />
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
            <XAxis 
              type="number" 
              dataKey="volume" 
              name="Volume" 
              unit={unitPreference} 
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'TOTAL VOLUME', position: 'insideBottom', offset: -5, fill: '#525252', fontSize: 9, fontWeight: 'black' }}
            />
            <YAxis 
              type="number" 
              dataKey="rpe" 
              name="Avg RPE" 
              domain={[0, 10.5]}
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'AVG RPE', angle: -90, position: 'insideLeft', fill: '#525252', fontSize: 9, fontWeight: 'black' }}
            />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={{ strokeDasharray: '3 3', stroke: '#3f3f46' }} />
            
            <ReferenceArea x1={maxVol * 0.6} x2={maxVol} y1={7} y2={9} fill="#ffffff" fillOpacity={0.02} label={{ value: 'GROWTH', position: 'center', fill: '#ffffff', fontSize: 10, fontWeight: 'black', opacity: 0.1 }} />
            <ReferenceArea x1={maxVol * 0.6} x2={maxVol} y1={9} y2={10.5} fill="#ffffff" fillOpacity={0.05} label={{ value: 'RISK', position: 'center', fill: '#ffffff', fontSize: 10, fontWeight: 'black', opacity: 0.2 }} />
            
            <Scatter 
              name="Workouts" 
              fill="#ffffff" 
              fillOpacity={0.4}
              line={false}
              shape="circle"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] hover:fill-opacity-100 transition-all duration-300"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex items-center justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-6">
        <div className="flex gap-4">
          <span className="text-gray-300">Intensity Plot</span>
          <span>Session Correlation</span>
        </div>
        <div className="text-right">
          <span>{data.length} Total Sessions</span>
        </div>
      </div>
    </div>
  );
}