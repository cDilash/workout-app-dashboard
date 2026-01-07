import { AppExportData, Workout, WorkoutSet } from "./types";

export interface DashboardStats {
  totalWorkouts: number;
  totalVolume: number;
  frequentMuscleGroup: string;
  workoutsPerWeek: number;
}

function getValidSets(sets: WorkoutSet[]) {
  return sets.filter(s => !s.is_deleted);
}

export function calculateStats(data: AppExportData): DashboardStats {
  let totalVolume = 0;
  const muscleGroupFrequency: Record<string, number> = {};

  data.workouts.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      ex.muscle_groups.forEach(mg => {
        muscleGroupFrequency[mg] = (muscleGroupFrequency[mg] || 0) + 1;
      });
      getValidSets(ex.sets).forEach((set) => {
        totalVolume += set.weight_kg * set.reps;
      });
    });
  });

  const frequentMuscleGroup = Object.entries(muscleGroupFrequency).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || "N/A";

  let workoutsPerWeek = 0;
  if (data.workouts.length > 0) {
    const dates = data.workouts.map(w => new Date(w.metadata.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
    workoutsPerWeek = (data.workouts.length / diffDays) * 7;
  }

  return {
    totalWorkouts: data.workouts.length,
    totalVolume,
    frequentMuscleGroup,
    workoutsPerWeek: parseFloat(workoutsPerWeek.toFixed(1)),
  };
}

export function getVolumeOverTime(workouts: Workout[]) {
  const volumeByWeek: Record<string, number> = {};
  workouts.forEach((w) => {
    const date = new Date(w.metadata.date);
    const day = date.getDay() || 7; 
    if (day !== 1) date.setHours(-24 * (day - 1));
    const weekKey = date.toISOString().split("T")[0];
    let workoutVolume = 0;
    w.exercises.forEach((ex) => {
      getValidSets(ex.sets).forEach((set) => {
        workoutVolume += set.weight_kg * set.reps;
      });
    });
    volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + workoutVolume;
  });
  return Object.entries(volumeByWeek).map(([date, volume]) => ({ date, volume })).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMuscleDistribution(workouts: Workout[]) {
  const distribution: Record<string, number> = {};
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      let exerciseVolume = 0;
      getValidSets(ex.sets).forEach((set) => { exerciseVolume += set.weight_kg * set.reps; });
      const splitVolume = exerciseVolume / (ex.muscle_groups.length || 1);
      ex.muscle_groups.forEach(mg => { distribution[mg] = (distribution[mg] || 0) + splitVolume; });
    });
  });
  return Object.entries(distribution).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function getHeatmapData(workouts: Workout[]) {
  const counts: Record<string, number> = {};
  workouts.forEach((w) => {
    const date = new Date(w.metadata.date).toISOString().split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  });
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 100);
  return { data: Object.entries(counts).map(([date, count]) => ({ date, count })), startDate, endDate };
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + 0.0333 * reps));
}

export function getExerciseHistory(workouts: Workout[], exerciseId: string) {
  const history: { date: string; e1rm: number; weight: number; reps: number }[] = [];
  workouts.forEach((w) => {
    const exData = w.exercises.find((ex) => ex.id === exerciseId);
    if (!exData) return;
    const date = new Date(w.metadata.date).toISOString().split("T")[0];
    let bestSet = { e1rm: 0, weight: 0, reps: 0 };
    getValidSets(exData.sets).forEach((set) => {
      const e1rm = calculate1RM(set.weight_kg, set.reps);
      if (e1rm > bestSet.e1rm) { bestSet = { e1rm, weight: set.weight_kg, reps: set.reps }; }
    });
    if (bestSet.e1rm > 0) { history.push({ date, ...bestSet }); }
  });
  return history.sort((a, b) => a.date.localeCompare(b.date));
}

export function getAvailableExercises(workouts: Workout[]) {
  const exercises = new Map<string, { id: string; name: string }>();
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      if (!exercises.has(ex.id)) { exercises.set(ex.id, { id: ex.id, name: ex.name }); }
    });
  });
  return Array.from(exercises.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function formatWeight(weightKg: number, unit: 'kg' | 'lbs'): number {
  if (unit === 'lbs') return Math.round(weightKg * 2.20462);
  return Math.round(weightKg * 10) / 10;
}

export function getFatigueData(workouts: Workout[]) {
  const weeklyAgg: Record<string, { vol: number; rpeSum: number; rpeCount: number }> = {};
  workouts.forEach(w => {
    const date = new Date(w.metadata.date);
    const day = date.getDay() || 7; 
    if (day !== 1) date.setHours(-24 * (day - 1));
    const weekKey = date.toISOString().split("T")[0];
    if (!weeklyAgg[weekKey]) weeklyAgg[weekKey] = { vol: 0, rpeSum: 0, rpeCount: 0 };
    w.exercises.forEach(ex => {
      getValidSets(ex.sets).forEach(s => {
        weeklyAgg[weekKey].vol += s.weight_kg * s.reps;
        if (s.rpe) { weeklyAgg[weekKey].rpeSum += s.rpe; weeklyAgg[weekKey].rpeCount++; }
      });
    });
  });
  return Object.entries(weeklyAgg).map(([date, val]) => ({
    date, volume: val.vol, rpe: val.rpeCount > 0 ? parseFloat((val.rpeSum / val.rpeCount).toFixed(1)) : 0
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function getProgramBalance(workouts: Workout[]) {
  const weeklyBalance: Record<string, { push: number; pull: number; legs: number; compound: number; isolation: number }> = {};
  workouts.forEach((w) => {
    const date = new Date(w.metadata.date);
    const day = date.getDay() || 7; 
    if (day !== 1) date.setHours(-24 * (day - 1));
    const weekKey = date.toISOString().split("T")[0];
    if (!weeklyBalance[weekKey]) weeklyBalance[weekKey] = { push: 0, pull: 0, legs: 0, compound: 0, isolation: 0 };
    w.exercises.forEach((ex) => {
      let vol = 0;
      getValidSets(ex.sets).forEach((s) => { vol += s.weight_kg * s.reps; });
      const pattern = (ex.movement_pattern || '').toLowerCase();
      if (pattern.includes('squat') || pattern.includes('hinge') || pattern.includes('lunge') || pattern.includes('legs')) { weeklyBalance[weekKey].legs += vol; }
      else if (pattern.includes('push') || pattern.includes('press') || pattern.includes('chest') || pattern.includes('tricep') || pattern.includes('shoulder')) { weeklyBalance[weekKey].push += vol; }
      else if (pattern.includes('pull') || pattern.includes('row') || pattern.includes('back') || pattern.includes('bicep')) { weeklyBalance[weekKey].pull += vol; }
      const isCompound = ex.mechanics === 'compound' || ['squat','hinge','lunge','press','row','deadlift'].some(move => pattern.includes(move));
      if (isCompound) { weeklyBalance[weekKey].compound += vol; } else { weeklyBalance[weekKey].isolation += vol; }
    });
  });
  return Object.entries(weeklyBalance).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => a.date.localeCompare(b.date));
}

export interface PRRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxWeightDate: string;
  maxE1RM: number;
  maxE1RMDate: string;
  maxVolume: number;
  maxVolumeDate: string;
}

export function getPersonalRecords(workouts: Workout[]): PRRecord[] {
  const records = new Map<string, PRRecord>();
  workouts.forEach((w) => {
    const date = new Date(w.metadata.date).toISOString().split("T")[0];
    w.exercises.forEach((ex) => {
      if (!records.has(ex.id)) {
        records.set(ex.id, { exerciseId: ex.id, exerciseName: ex.name, maxWeight: 0, maxWeightDate: '', maxE1RM: 0, maxE1RMDate: '', maxVolume: 0, maxVolumeDate: '', });
      }
      const rec = records.get(ex.id)!;
      let sessionVolume = 0;
      getValidSets(ex.sets).forEach((set) => {
        if (set.weight_kg > rec.maxWeight) { rec.maxWeight = set.weight_kg; rec.maxWeightDate = date; }
        const e1rm = calculate1RM(set.weight_kg, set.reps);
        if (e1rm > rec.maxE1RM) { rec.maxE1RM = e1rm; rec.maxE1RMDate = date; }
        sessionVolume += set.weight_kg * set.reps;
      });
      if (sessionVolume > rec.maxVolume) { rec.maxVolume = sessionVolume; rec.maxVolumeDate = date; }
    });
  });
  return Array.from(records.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

export interface CoachingReport {
  period: string;
  adherence: { count: number; rating: 'High' | 'Moderate' | 'Low'; message: string; };
  focus: { muscle: string; percentage: number; };
  volumeTrend: { direction: 'up' | 'down' | 'stable'; percentChange: number; };
  recentPRs: number;
  insight: string;
}

export function generateCoachingReport(workouts: Workout[]): CoachingReport | null {
  if (workouts.length === 0) return null;
  const sorted = [...workouts].sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
  const lastDate = new Date(sorted[0].metadata.date);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const curStart = new Date(lastDate.getTime() - oneWeek);
  const curWorkouts = sorted.filter(w => new Date(w.metadata.date) >= curStart);
  const count = curWorkouts.length;
  const allPRs = getPersonalRecords(workouts);
  const recentPRs = allPRs.filter(pr => new Date(pr.maxWeightDate) >= curStart).length;
  return { period: "Last 7 Days", adherence: { count, rating: 'Moderate', message: "Keep it up." }, focus: { muscle: "General", percentage: 0.5 }, volumeTrend: { direction: 'stable', percentChange: 0 }, recentPRs, insight: "Steady progress." };
}

export function getYearInLiftStats(workouts: Workout[]) {
  if (workouts.length === 0) return null;
  let totalVolume = 0;
  const exVol: Record<string, number> = {};
  const activeDays = new Set<string>();
  workouts.forEach(w => {
    activeDays.add(new Date(w.metadata.date).toISOString().split("T")[0]);
    w.exercises.forEach(ex => {
      let v = 0; getValidSets(ex.sets).forEach(s => v += s.weight_kg * s.reps);
      totalVolume += v; exVol[ex.name] = (exVol[ex.name] || 0) + v;
    });
  });
  return { totalWorkouts: workouts.length, totalVolume, activeDays: activeDays.size, topExercise: Object.entries(exVol).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'N/A' };
}

export function getRepRangeDistribution(workouts: Workout[]) {
  const ranges = { '1-5': 0, '6-12': 0, '13-20': 0, '20+': 0 };
  workouts.forEach(w => w.exercises.forEach(ex => getValidSets(ex.sets).forEach(s => {
    if (s.is_warmup) return;
    if (s.reps <= 5) ranges['1-5']++; else if (s.reps <= 12) ranges['6-12']++; else if (s.reps <= 20) ranges['13-20']++; else ranges['20+']++;
  })));
  return Object.entries(ranges).map(([name, value]) => ({ name, value }));
}

export interface PerformanceInsight {
  id: string;
  name: string;
  change: number;
  lastPerformed: string;
  status: 'trending' | 'stalled';
}

export function getPerformancePulse(workouts: Workout[]): PerformanceInsight[] {
  const exercises = getAvailableExercises(workouts);
  const insights: PerformanceInsight[] = [];
  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
  const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));

  exercises.forEach(ex => {
    const history = getExerciseHistory(workouts, ex.id);
    if (history.length < 3) return; // Need some history to determine a trend

    const recent = history.filter(h => new Date(h.date) >= threeWeeksAgo);
    const older = history.filter(h => new Date(h.date) < threeWeeksAgo && new Date(h.date) >= new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)));

    if (recent.length === 0) return;

    const recentMax = Math.max(...recent.map(r => r.e1rm));
    const olderMax = older.length > 0 ? Math.max(...older.map(o => o.e1rm)) : history[0].e1rm;
    
    const percentChange = ((recentMax - olderMax) / olderMax) * 100;
    const lastDate = history[history.length - 1].date;

    // Trending Up: > 5% increase in recent weeks
    if (percentChange >= 5) {
      insights.push({ id: ex.id, name: ex.name, change: percentChange, lastPerformed: lastDate, status: 'trending' });
    } 
    // Stalled: Performed recently but no growth (< 1%) in last 4 weeks
    else if (new Date(lastDate) >= fourWeeksAgo && percentChange < 1) {
      insights.push({ id: ex.id, name: ex.name, change: percentChange, lastPerformed: lastDate, status: 'stalled' });
    }
  });

  return insights.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

export function getWeeklyHardSets(workouts: Workout[]) {
  const weekly: Record<string, { hardSets: number }> = {};
  workouts.forEach(w => {
    const date = new Date(w.metadata.date);
    const day = date.getDay() || 7; if (day !== 1) date.setHours(-24 * (day - 1));
    const weekKey = date.toISOString().split("T")[0];
    if (!weekly[weekKey]) weekly[weekKey] = { hardSets: 0 };
    w.exercises.forEach(ex => getValidSets(ex.sets).forEach(s => {
      if (s.is_warmup) return;
      if ((s.rpe && s.rpe >= 7) || (s.rir !== undefined && s.rir <= 3)) weekly[weekKey].hardSets++;
    }));
  });
  return Object.entries(weekly).map(([date, counts]) => ({ date, ...counts })).sort((a,b)=>a.date.localeCompare(b.date));
}

export function getSweetSpotData(workouts: Workout[]) {
  return workouts.map(w => {
    let vol = 0, rpeSum = 0, rpeCount = 0;
    w.exercises.forEach(ex => getValidSets(ex.sets).forEach(s => {
      vol += s.weight_kg * s.reps;
      if (s.rpe) { rpeSum += s.rpe; rpeCount++; }
    }));
    return { volume: vol, rpe: rpeCount > 0 ? parseFloat((rpeSum / rpeCount).toFixed(1)) : 0, date: new Date(w.metadata.date).toISOString().split('T')[0] };
  }).filter(d => d.volume > 0 && d.rpe > 0);
}