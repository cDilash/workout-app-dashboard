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
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Week of {label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
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

      <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center min-h-[300px]", className)}>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 self-start">Program Balance</h3>

        <p className="text-gray-400 text-sm">No data available</p>

      </div>

    );

  }



  return (

    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>

      <div className="flex items-center justify-between mb-6">

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Program Balance</h3>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

          <button

            onClick={() => setMode('pattern')}

            className={cn(

              "px-3 py-1 text-xs font-medium rounded-md transition-colors",

              mode === 'pattern' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"

            )}

          >

            Push/Pull

          </button>

          <button

            onClick={() => setMode('type')}

            className={cn(

              "px-3 py-1 text-xs font-medium rounded-md transition-colors",

              mode === 'type' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"

            )}

          >

            Comp/Iso

          </button>

        </div>

      </div>



      <div className="h-[300px] w-full">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />

            <XAxis 

              dataKey="date" 

              tick={{ fontSize: 12, fill: '#6b7280' }} 

              tickLine={false}

              axisLine={false}

              minTickGap={30}

            />

            <YAxis 

              tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}

              tick={{ fontSize: 12, fill: '#6b7280' }} 

              tickLine={false}

              axisLine={false}

            />

            <Tooltip content={<CustomTooltip unit={unitPreference} />} />

            <Legend verticalAlign="top" height={36}/>

            

            {mode === 'pattern' ? (

              <>

                <Bar dataKey="push" name="Push" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />

                <Bar dataKey="pull" name="Pull" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />

                <Bar dataKey="legs" name="Legs" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />

              </>

            ) : (

              <>

                <Bar dataKey="compound" name="Compound" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />

                <Bar dataKey="isolation" name="Isolation" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />

              </>

            )}

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}
