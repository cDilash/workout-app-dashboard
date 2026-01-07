'use client';

import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
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
import { Target, Trash, MagnifyingGlass, CaretDown } from 'phosphor-react';

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
      <div className="bg-black border border-gray-800 p-4 rounded shadow-2xl">
        <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <p className="text-sm font-bold text-white">
              Est. 1RM: {payload[0].value} {unit}
            </p>
          </div>
          <p className="text-xs text-gray-500 ml-4">
            Best Set: {payload[0].payload.weight}{unit} x {payload[0].payload.reps}
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
    <div className={cn("bw-card rounded-xl p-6", className)}>
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">STRENGTH PROGRESSION</h3>
            <InfoTooltip content="Estimated 1RM (Rep Max) is a theoretical calculation of the maximum weight you could lift for a single rep, based on your best performance each day." />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             {/* Searchable Select */}
             <div className="relative w-full sm:w-64 z-20">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full bg-black border border-gray-800 hover:border-gray-600 rounded py-2 px-3 text-left text-xs font-bold uppercase text-white focus:outline-none flex justify-between items-center transition-all"
                >
                  <span className="truncate">{selectedName}</span>
                  <CaretDown size={12} className="text-gray-500" weight="bold" />
                </button>

                {isOpen && (
                  <div className="absolute mt-1 w-full bg-black border border-gray-800 rounded shadow-xl max-h-60 overflow-hidden flex flex-col z-50">
                    <div className="p-2 border-b border-gray-800 sticky top-0 bg-black z-10">
                      <div className="relative">
                        <MagnifyingGlass size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          placeholder="SEARCH..."
                          value={searchTerm}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      {filteredExercises.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => {
                            setSelectedExerciseId(ex.id);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs font-bold uppercase rounded transition-colors",
                            ex.id === selectedExerciseId 
                              ? "bg-white text-black" 
                              : "text-gray-500 hover:bg-gray-900 hover:text-white"
                          )}
                        >
                          {ex.name}
                        </button>
                      ))}
                      {filteredExercises.length === 0 && (
                        <div className="p-4 text-xs text-gray-500 text-center uppercase">No exercises found</div>
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
                 "p-2 rounded border transition-all duration-200",
                 currentGoal 
                   ? "bg-white text-black border-white" 
                   : "bg-black border-gray-800 text-gray-500 hover:text-white hover:border-gray-600"
               )}
               title="Set Goal"
             >
               <Target size={16} weight={currentGoal ? "fill" : "regular"} />
             </button>
          </div>
        </div>

        {/* Goal UI Panel */}
        {isGoalOpen && (
          <div className="flex items-center gap-3 bg-gray-900 p-3 rounded border border-gray-800 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Target 1RM:</span>
            <div className="relative">
              <input 
                type="number" 
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={currentGoal ? `${displayGoal}` : "100"}
                className="w-24 px-3 py-1.5 text-xs border border-gray-700 rounded bg-black text-white placeholder:text-gray-700 focus:outline-none focus:border-white"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">{unitPreference}</span>
            </div>
            
            <button 
              onClick={handleSaveGoal}
              className="ml-auto px-4 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition-all uppercase"
            >
              Save
            </button>
            {currentGoal && (
              <button 
                onClick={() => removeGoal(selectedExerciseId)}
                className="p-1.5 text-gray-500 hover:text-white transition-colors"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        )}

        {/* Goal Progress Bar */}
        {currentGoal && displayGoal && (
          <div className="w-full">
            <div className="flex justify-between text-[10px] font-bold uppercase mb-2 px-1">
              <span className="text-gray-500">Current Max: <strong className="text-white">{currentMax} {unitPreference}</strong></span>
              <span className="text-white">{progressPercent.toFixed(0)}% to {displayGoal} {unitPreference}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-[350px] w-full">
        {data.length < 2 ? (
          <div className="flex items-center justify-center h-full text-gray-600 border border-dashed border-gray-800 rounded bg-gray-900/50 uppercase text-xs font-bold tracking-widest">
            Not enough history
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorE1rm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
                tickLine={false}
                axisLine={false}
                tickMargin={15}
                minTickGap={30}
              />
              <YAxis 
                domain={[
                  (dataMin: number) => Math.floor(dataMin - 5),
                  (dataMax: number) => displayGoal ? Math.max(dataMax, displayGoal * 1.1) : 'auto'
                ]}
                tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip unit={unitPreference} />} cursor={{ stroke: '#525252', strokeWidth: 1 }} />
              <Legend verticalAlign="top" height={36} iconType="rect" />
              {displayGoal && (
                <ReferenceLine y={displayGoal} stroke="#525252" strokeDasharray="3 3">
                  <Label value="GOAL" position="insideTopLeft" fill="#525252" fontSize={10} fontWeight="bold" offset={10} />
                </ReferenceLine>
              )}
              <Area
                name="Estimated 1RM"
                type="monotone"
                dataKey="e1rm"
                stroke="#ffffff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorE1rm)"
                dot={{ fill: '#000000', strokeWidth: 2, stroke: '#ffffff', r: 3 }}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}