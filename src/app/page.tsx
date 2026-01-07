'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { DataImport } from '@/components/dashboard/DataImport';
import { StatCard } from '@/components/dashboard/StatCard';
import { WorkoutHeatmap } from '@/components/dashboard/WorkoutHeatmap';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { MuscleDistributionChart } from '@/components/charts/MuscleDistributionChart';
import { StrengthProgressChart } from '@/components/charts/StrengthProgressChart';
import { RepRangeChart } from '@/components/charts/RepRangeChart';
import { IntensityChart } from '@/components/charts/IntensityChart';
import { ProgramBalanceChart } from '@/components/charts/ProgramBalanceChart';
import { FatigueChart } from '@/components/charts/FatigueChart';
import { SweetSpotChart } from '@/components/charts/SweetSpotChart';
import { PersonalRecords } from '@/components/dashboard/PersonalRecords';
import { CoachingReport } from '@/components/dashboard/CoachingReport';
import { YearInLift } from '@/components/dashboard/YearInLift';
import { ExportCenter } from '@/components/dashboard/ExportCenter';
import { calculateStats, formatWeight } from '@/lib/stats';
import { 
  Trash, 
  Barbell, 
  CalendarCheck, 
  TrendUp, 
  Fire,
  ArrowsLeftRight
} from 'phosphor-react';

export default function Home() {
  const data = useDashboardStore((state) => state.data);
  const clearData = useDashboardStore((state) => state.clearData);
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const setUnitPreference = useDashboardStore((state) => state.setUnitPreference);

  const stats = useMemo(() => data ? calculateStats(data) : null, [data]);

  if (!data || !stats) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <DataImport />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <header className="sticky top-0 z-50 bw-glass mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
              <Barbell size={20} weight="fill" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">WORKOUT<span className="text-gray-500 font-normal ml-1">DASHBOARD</span></h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnitPreference(unitPreference === 'kg' ? 'lbs' : 'kg')}
              className="flex items-center text-xs font-bold text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
            >
              <ArrowsLeftRight size={14} className="mr-2" />
              {unitPreference}
            </button>
            
            <button 
              onClick={clearData}
              className="flex items-center text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash size={14} className="mr-2" />
              Reset
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Coaching Report */}
        <div className="mb-8">
          <CoachingReport workouts={data.workouts} />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Workouts" 
            value={stats.totalWorkouts} 
            icon={CalendarCheck}
            tooltip="The total number of training sessions completed in the history of your data."
          />
          <StatCard 
            title="Total Volume" 
            value={`${(formatWeight(stats.totalVolume, unitPreference) / 1000).toFixed(1)}k`} 
            icon={TrendUp}
            tooltip="Cumulative workload calculated as (Sets × Reps × Weight)."
            description={`${unitPreference} total load`}
          />
          <StatCard 
            title="Most Frequent" 
            value={stats.frequentMuscleGroup} 
            icon={Barbell}
            tooltip="The muscle group that has received the highest number of working sets."
            description="Focus muscle"
          />
          <StatCard 
            title="Consistency" 
            value={`${stats.workoutsPerWeek}`} 
            icon={Fire}
            tooltip="Your average workout consistency, measured as sessions per week."
            description="Workouts / week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <WorkoutHeatmap workouts={data.workouts} />
          </div>
          <div className="lg:col-span-1">
            <PersonalRecords workouts={data.workouts} className="h-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <VolumeChart workouts={data.workouts} />
          <MuscleDistributionChart workouts={data.workouts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <IntensityChart workouts={data.workouts} />
          <RepRangeChart workouts={data.workouts} />
        </div>

        {/* Growth Zone Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <SweetSpotChart workouts={data.workouts} />
          </div>
          <div className="lg:col-span-1">
            <ProgramBalanceChart workouts={data.workouts} />
          </div>
        </div>

        <div className="mb-8">
          <FatigueChart workouts={data.workouts} />
        </div>

        <div className="mb-8">
          <StrengthProgressChart workouts={data.workouts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <YearInLift workouts={data.workouts} />
          <ExportCenter />
        </div>
      </div>
    </main>
  );
}
