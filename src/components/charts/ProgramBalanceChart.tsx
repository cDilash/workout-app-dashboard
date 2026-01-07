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
  Legend
} from 'recharts';
import { Workout } from '@/lib/types';
import { getProgramBalance, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDashboardStore } from '@/stores/dashboard-store';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface ProgramBalanceChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; name: string; color: string }[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-gray-800 p-3 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Week of {label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: {(Number(entry.value) / 1000).toFixed(1)}k {unit}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ProgramBalanceChart({ workouts, className }: ProgramBalanceChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const rawData = useMemo(() => getProgramBalance(workouts), [workouts]);
  const [mode, setMode] = React.useState<'pattern' | 'type'>('pattern');

  const data = useMemo(() => {
    return rawData.map(d => ({
      ...d,
      push: formatWeight(d.push, unitPreference),
      pull: formatWeight(d.pull, unitPreference),
      legs: formatWeight(d.legs, unitPreference),
      compound: formatWeight(d.compound, unitPreference),
      isolation: formatWeight(d.isolation, unitPreference),
    }));
  }, [rawData, unitPreference]);

  if (data.length === 0) {
    return (
      <div className={cn("bw-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]", className)}>
        <h3 className="text-lg font-bold text-white mb-6 self-start uppercase">Program Balance</h3>
        <p className="text-gray-500 text-sm font-medium">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Program Balance</h3>
          <InfoTooltip content="Shows how your total workload is distributed across movement categories." />
        </div>
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setMode('pattern')}
            className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors",
              mode === 'pattern' ? "bg-white text-black" : "text-gray-500 hover:text-white"
            )}
          >
            Push/Pull
          </button>
          <button
            onClick={() => setMode('type')}
            className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors",
              mode === 'type' ? "bg-white text-black" : "text-gray-500 hover:text-white"
            )}
          >
            Comp/Iso
          </button>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
            <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={{ fill: '#171717' }} />
            <Legend verticalAlign="top" height={36} iconType="rect" />
            
            {mode === 'pattern' ? (
              <>
                <Bar dataKey="push" name="PUSH" stackId="a" fill="#ffffff" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pull" name="PULL" stackId="a" fill="#a3a3a3" radius={[0, 0, 0, 0]} />
                <Bar dataKey="legs" name="LEGS" stackId="a" fill="#525252" radius={[2, 2, 0, 0]} />
              </>
            ) : (
              <>
                <Bar dataKey="compound" name="COMPOUND" stackId="a" fill="#ffffff" radius={[0, 0, 0, 0]} />
                <Bar dataKey="isolation" name="ISOLATION" stackId="a" fill="#525252" radius={[2, 2, 0, 0]} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
