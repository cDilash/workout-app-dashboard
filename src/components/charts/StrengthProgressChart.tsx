'use client';

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Label
} from 'recharts';
import { Workout } from '@/lib/types';
import { getAvailableExercises, getExerciseHistory, formatWeight } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDashboardStore } from '@/stores/dashboard-store';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Target, Trash } from 'phosphor-react';

interface StrengthProgressChartProps {
  workouts: Workout[];
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  label?: string;
  payload?: { value: ValueType; payload: { date: string; e1rm: number; weight: number; reps: number } }[];
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            Est. 1RM: {payload[0].value} {unit}
          </p>
          <p className="text-xs text-gray-500">
            Set: {payload[0].payload.weight}{unit} x {payload[0].payload.reps}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function StrengthProgressChart({ workouts, className }: StrengthProgressChartProps) {
  const unitPreference = useDashboardStore((state) => state.unitPreference);
  const goals = useDashboardStore((state) => state.goals);
  const setGoal = useDashboardStore((state) => state.setGoal);
  const removeGoal = useDashboardStore((state) => state.removeGoal);

  const exercises = useMemo(() => getAvailableExercises(workouts), [workouts]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || '');
  const [searchTerm, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  // Update selected ID if exercises change (e.g. new import) and current selection is invalid
  React.useEffect(() => {
     if (exercises.length > 0 && !exercises.find(e => e.id === selectedExerciseId)) {
         setSelectedExerciseId(exercises[0].id);
     }
  }, [exercises, selectedExerciseId]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  const selectedName = exercises.find(e => e.id === selectedExerciseId)?.name || 'Select Exercise';
  const currentGoal = goals[selectedExerciseId];

  // Convert goal to display unit
  const displayGoal = currentGoal ? formatWeight(currentGoal, unitPreference) : null;

  const rawData = useMemo(() => {
    if (!selectedExerciseId) return [];
    return getExerciseHistory(workouts, selectedExerciseId);
  }, [workouts, selectedExerciseId]);

  const data = useMemo(() => {
    return rawData.map(d => ({
        ...d,
        e1rm: formatWeight(d.e1rm, unitPreference),
        weight: formatWeight(d.weight, unitPreference)
    }));
  }, [rawData, unitPreference]);

  const currentMax = data.length > 0 ? Math.max(...data.map(d => d.e1rm)) : 0;
  const progressPercent = displayGoal ? Math.min(100, (currentMax / displayGoal) * 100) : 0;

  const handleSaveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      // Store in kg
      const weightInKg = unitPreference === 'lbs' ? val / 2.20462 : val;
      setGoal(selectedExerciseId, weightInKg);
      setIsGoalOpen(false);
      setGoalInput('');
    }
  };

  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strength Progression</h3>
            <InfoTooltip content="Estimated 1RM (Rep Max) is a theoretical calculation of the maximum weight you could lift for a single rep, based on your best performance each day." />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             {/* Searchable Select */}
             <div className="relative w-full sm:w-64 z-20">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                >
                  <span className="truncate">{selectedName}</span>
                  <span className="ml-2 text-gray-400">▼</span>
                </button>

                {isOpen && (
                  <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearch(e.target.value)}
                      className="p-2 border-b border-gray-100 dark:border-gray-700 bg-transparent text-sm focus:outline-none dark:text-white"
                      autoFocus
                    />
                    <div className="overflow-y-auto flex-1">
                      {filteredExercises.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => {
                            setSelectedExerciseId(ex.id);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors",
                            ex.id === selectedExerciseId ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {ex.name}
                        </button>
                      ))}
                      {filteredExercises.length === 0 && (
                        <div className="p-3 text-sm text-gray-400 text-center">No exercises found</div>
                      )}
                    </div>
                  </div>
                )}
                {isOpen && (
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                )}
             </div>

             {/* Goal Button */}
             <button
               onClick={() => setIsGoalOpen(!isGoalOpen)}
               className={cn(
                 "p-2 rounded-lg border transition-colors",
                 currentGoal ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
               )}
               title="Set Goal"
             >
               <Target size={20} weight={currentGoal ? "fill" : "regular"} />
             </button>
          </div>
        </div>

        {/* Goal UI Panel */}
        {isGoalOpen && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target 1RM:</span>
            <input 
              type="number" 
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder={currentGoal ? `${displayGoal}` : "e.g. 100"}
              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <span className="text-xs text-gray-500">{unitPreference}</span>
            <button 
              onClick={handleSaveGoal}
              className="ml-auto px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
            >
              Save
            </button>
            {currentGoal && (
              <button 
                onClick={() => removeGoal(selectedExerciseId)}
                className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        )}

        {/* Goal Progress Bar */}
        {currentGoal && displayGoal && (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Current Max: <strong className="text-gray-900 dark:text-white">{currentMax}{unitPreference}</strong></span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{progressPercent.toFixed(0)}% to {displayGoal}{unitPreference}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-[350px] w-full">
        {data.length < 2 ? (
          <div className="flex items-center justify-center h-full text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            Not enough history for this exercise (need at least 2 sessions)
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
                domain={[
                  (dataMin: number) => Math.floor(dataMin - 5),
                  (dataMax: number) => displayGoal ? Math.max(dataMax, displayGoal * 1.1) : 'auto'
                ]}
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip unit={unitPreference} />} />
              <Legend verticalAlign="top" height={36}/>
              {displayGoal && (
                <ReferenceLine y={displayGoal} stroke="#10b981" strokeDasharray="3 3">
                  <Label value="Goal" position="insideTopLeft" fill="#10b981" fontSize={10} />
                </ReferenceLine>
              )}
              <Line
                name="Estimated 1RM"
                type="monotone"
                dataKey="e1rm"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}