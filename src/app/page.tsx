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
import { cn } from '@/lib/utils';

export default function Home() {
  const data = useDashboardStore((state) => state.data);
  const clearData = useDashboardStore((state) => state.clearData);
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const setUnitPreference = useDashboardStore((state) => state.setUnitPreference);

  const stats = useMemo(() => data ? calculateStats(data) : null, [data]);

  if (!data || !stats) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>
        <DataImport />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
       {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto glass-card rounded-2xl px-6 h-16 flex items-center justify-between shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Barbell size={20} weight="fill" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-wide">Workout<span className="text-gray-500 font-light">Analytics</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUnitPreference(unitPreference === 'kg' ? 'lbs' : 'kg')}
              className="flex items-center text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-lg transition-all uppercase tracking-wider"
            >
              <ArrowsLeftRight size={14} className="mr-2 text-blue-400" />
              {unitPreference}
            </button>
            
            <button 
              onClick={clearData}
              className="flex items-center text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              <Trash size={14} className="mr-2" />
              Reset
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Coaching Report */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CoachingReport workouts={data.workouts} />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <StatCard 
            title="Total Workouts" 
            value={stats.totalWorkouts} 
            icon={CalendarCheck}
            tooltip="The total number of training sessions completed in the history of your data."
            colorClassName="bg-blue-500/10 text-blue-400"
          />
          <StatCard 
            title="Total Volume" 
            value={`${(formatWeight(stats.totalVolume, unitPreference) / 1000).toFixed(1)}k`} 
            icon={TrendUp}
            tooltip="Cumulative workload calculated as (Sets × Reps × Weight). A measure of total training stress."
            description={`${unitPreference} total load`}
            colorClassName="bg-green-500/10 text-green-400"
          />
          <StatCard 
            title="Most Frequent" 
            value={stats.frequentMuscleGroup} 
            icon={Barbell}
            tooltip="The muscle group that has received the highest number of working sets."
            description="Focus muscle"
            colorClassName="bg-purple-500/10 text-purple-400"
          />
          <StatCard 
            title="Consistency" 
            value={`${stats.workoutsPerWeek}`} 
            icon={Fire}
            tooltip="Your average workout consistency, measured as sessions per week since your first logged lift."
            description="Workouts / week"
            colorClassName="bg-orange-500/10 text-orange-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {/* Heatmap Section */}
          <div className="lg:col-span-2">
            <WorkoutHeatmap workouts={data.workouts} />
          </div>

          {/* Personal Records */}
          <div className="lg:col-span-1">
            <PersonalRecords workouts={data.workouts} className="h-full" />
          </div>
        </div>

        {/* Advanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <VolumeChart workouts={data.workouts} />
          <MuscleDistributionChart workouts={data.workouts} />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <IntensityChart workouts={data.workouts} />
          <RepRangeChart workouts={data.workouts} />
        </div>

        {/* Program Balance & Fatigue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <ProgramBalanceChart workouts={data.workouts} />
          <FatigueChart workouts={data.workouts} />
        </div>

        {/* Strength Progression */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <StrengthProgressChart workouts={data.workouts} />
        </div>

        {/* Data Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <YearInLift workouts={data.workouts} />
          <ExportCenter />
        </div>
      </div>
    </main>
  );
}
