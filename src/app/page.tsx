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

export default function Home() {
  const data = useDashboardStore((state) => state.data);
  const clearData = useDashboardStore((state) => state.clearData);
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const setUnitPreference = useDashboardStore((state) => state.setUnitPreference);

  const stats = useMemo(() => data ? calculateStats(data) : null, [data]);

  if (!data || !stats) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <DataImport />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Barbell size={20} weight="bold" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Workout Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUnitPreference(unitPreference === 'kg' ? 'lbs' : 'kg')}
              className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowsLeftRight size={16} className="mr-2" />
              {unitPreference.toUpperCase()}
            </button>
            
            <button 
              onClick={clearData}
              className="flex items-center text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md transition-colors"
            >
              <Trash size={16} className="mr-1.5" />
              Clear Data
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            colorClassName="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          />
          <StatCard 
            title="Total Volume" 
            value={`${(formatWeight(stats.totalVolume, unitPreference) / 1000).toFixed(1)}k`} 
            icon={TrendUp}
            description={`${unitPreference} (total weight lifted)`}
            colorClassName="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          />
          <StatCard 
            title="Most Frequent" 
            value={stats.frequentMuscleGroup} 
            icon={Barbell}
            description="Focus muscle group"
            colorClassName="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
          />
          <StatCard 
            title="Frequency" 
            value={`${stats.workoutsPerWeek}`} 
            icon={Fire}
            description="Workouts per week"
            colorClassName="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <VolumeChart workouts={data.workouts} />
          <MuscleDistributionChart workouts={data.workouts} />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <IntensityChart workouts={data.workouts} />
          <RepRangeChart workouts={data.workouts} />
        </div>

        {/* Program Balance & Fatigue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ProgramBalanceChart workouts={data.workouts} />
          <FatigueChart workouts={data.workouts} />
        </div>

        {/* Strength Progression */}
        <div className="mb-8">
          <StrengthProgressChart workouts={data.workouts} />
        </div>

        {/* Data Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <YearInLift workouts={data.workouts} />
          <ExportCenter />
        </div>
      </div>
    </main>
  );
}