import { AppExportData, Workout, WorkoutSet } from "./types";

export interface DashboardStats {
  totalWorkouts: number;
  totalVolume: number;
  frequentMuscleGroup: string;
  workoutsPerWeek: number;
}

// Helper to filter valid sets (not deleted)
// We generally count warmups for "Total Volume" but might exclude them for "Working Volume"
// For this MVP, we will count everything that isn't deleted.
function getValidSets(sets: WorkoutSet[]) {
  return sets.filter(s => !s.is_deleted);
}

export function calculateStats(data: AppExportData): DashboardStats {
  let totalVolume = 0;
  const muscleGroupFrequency: Record<string, number> = {};

  data.workouts.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      // Handle multiple muscle groups
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

  // Calculate workouts per week
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

  return Object.entries(volumeByWeek)
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getMuscleDistribution(workouts: Workout[]) {
  const distribution: Record<string, number> = {};

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      let exerciseVolume = 0;
      getValidSets(ex.sets).forEach((set) => {
        exerciseVolume += set.weight_kg * set.reps;
      });
      
      // Distribute volume evenly across muscle groups if multiple
      const splitVolume = exerciseVolume / (ex.muscle_groups.length || 1);
      
      ex.muscle_groups.forEach(mg => {
        distribution[mg] = (distribution[mg] || 0) + splitVolume;
      });
    });
  });

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getHeatmapData(workouts: Workout[]) {
  const counts: Record<string, number> = {};
  workouts.forEach((w) => {
    const date = new Date(w.metadata.date).toISOString().split("T")[0];
    counts[date] = (counts[date] || 0) + 1;
  });
  return counts;
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + 0.0333 * reps));
}

export function getExerciseHistory(workouts: Workout[], exerciseId: string) {
  const history: { date: string; e1rm: number; weight: number; reps: number }[] = [];

  workouts.forEach((w) => {
    const exerciseData = w.exercises.find((ex) => ex.id === exerciseId);
    if (!exerciseData) return;

    const date = new Date(w.metadata.date).toISOString().split("T")[0];
    
    let bestSet = { e1rm: 0, weight: 0, reps: 0 };
    
    getValidSets(exerciseData.sets).forEach((set) => {
      const e1rm = calculate1RM(set.weight_kg, set.reps);
      if (e1rm > bestSet.e1rm) {
        bestSet = { e1rm, weight: set.weight_kg, reps: set.reps };
      }
    });

    if (bestSet.e1rm > 0) {
      history.push({ date, ...bestSet });
    }
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

export function getAvailableExercises(workouts: Workout[]) {
  const exercises = new Map<string, { id: string; name: string }>();

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      if (!exercises.has(ex.id)) {
        exercises.set(ex.id, { id: ex.id, name: ex.name });
      }
    });
  });

  return Array.from(exercises.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Analytics Metrics

export function formatWeight(weightKg: number, unit: 'kg' | 'lbs'): number {
  if (unit === 'lbs') {
    return Math.round(weightKg * 2.20462);
  }
  return weightKg;
}

export function getMovementPatternDistribution(workouts: Workout[]) {
  const distribution: Record<string, number> = {};

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      const pattern = ex.movement_pattern || 'Other';
      let exerciseVolume = 0;
      getValidSets(ex.sets).forEach((set) => {
        exerciseVolume += set.weight_kg * set.reps;
      });
      
      distribution[pattern] = (distribution[pattern] || 0) + exerciseVolume;
    });
  });

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getFatigueData(workouts: Workout[]) {
  // Returns { date, volume, rpe }
  const data: { date: string; volume: number; rpe: number }[] = [];

  workouts.forEach((w) => {
    let sessionVolume = 0;
    let totalRpe = 0;
    let setWithRpeCount = 0;

    w.exercises.forEach((ex) => {
      getValidSets(ex.sets).forEach((s) => {
        sessionVolume += s.weight_kg * s.reps;
        if (s.rpe) {
          totalRpe += s.rpe;
          setWithRpeCount++;
        }
      });
    });

    if (sessionVolume > 0) {
      data.push({
        date: new Date(w.metadata.date).toISOString().split('T')[0],
        volume: sessionVolume,
        rpe: setWithRpeCount > 0 ? parseFloat((totalRpe / setWithRpeCount).toFixed(1)) : 0
      });
    }
  });

  return data.sort((a, b) => a.date.localeCompare(b.date));
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
      getValidSets(ex.sets).forEach((s) => {
        vol += s.weight_kg * s.reps;
      });

      const pattern = (ex.movement_pattern || '').toLowerCase();
      
      // Push vs Pull vs Legs Logic
      if (pattern.includes('squat') || pattern.includes('hinge') || pattern.includes('lunge') || pattern.includes('legs')) {
        weeklyBalance[weekKey].legs += vol;
      } else if (pattern.includes('push') || pattern.includes('press') || pattern.includes('chest') || pattern.includes('tricep') || pattern.includes('shoulder')) {
        weeklyBalance[weekKey].push += vol;
      } else if (pattern.includes('pull') || pattern.includes('row') || pattern.includes('back') || pattern.includes('bicep')) {
        weeklyBalance[weekKey].pull += vol;
      }

      // Compound vs Isolation Logic
      let isCompound = false;

      if (ex.mechanics) {
        // Priority: Explicit data from library
        isCompound = ex.mechanics === 'compound';
      } else {
        // Fallback: Heuristic based on pattern
        isCompound = 
          pattern.includes('squat') || 
          pattern.includes('hinge') || 
          pattern.includes('lunge') || 
          pattern.includes('horizontal push') || 
          pattern.includes('vertical push') || 
          pattern.includes('horizontal pull') || 
          pattern.includes('vertical pull') ||
          pattern.includes('press') ||
          pattern.includes('row') ||
          pattern.includes('deadlift');
      }

      if (isCompound) {
        weeklyBalance[weekKey].compound += vol;
      } else {
        weeklyBalance[weekKey].isolation += vol;
      }

    });
  });

  return Object.entries(weeklyBalance)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface CoachingReport {
  period: string;
  adherence: {
    count: number;
    rating: 'High' | 'Moderate' | 'Low';
    message: string;
  };
  focus: {
    muscle: string;
    percentage: number;
  };
  volumeTrend: {
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
  };
  recentPRs: number;
  insight: string;
}

export function generateCoachingReport(workouts: Workout[]): CoachingReport | null {
  if (workouts.length === 0) return null;

  // Sort by date descending
  const sorted = [...workouts].sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
  const lastWorkoutDate = new Date(sorted[0].metadata.date);
  
  // Define "Current Week" as last 7 days from the most recent workout
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const currentPeriodStart = new Date(lastWorkoutDate.getTime() - oneWeekMs);
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - oneWeekMs);

  const currentWorkouts = sorted.filter(w => new Date(w.metadata.date) >= currentPeriodStart);
  const previousWorkouts = sorted.filter(w => {
    const d = new Date(w.metadata.date);
    return d >= previousPeriodStart && d < currentPeriodStart;
  });

  // 1. Adherence
  const count = currentWorkouts.length;
  let rating: 'High' | 'Moderate' | 'Low' = 'Moderate';
  let message = "Consistency is key. Try to aim for 3+ sessions.";
  if (count >= 4) {
    rating = 'High';
    message = "Excellent consistency! Keep this momentum going.";
  } else if (count >= 2) {
    rating = 'Moderate';
    message = "Solid effort. Adding one more session could boost progress.";
  } else {
    rating = 'Low';
  }

  // 2. Focus Area
  const muscleVol: Record<string, number> = {};
  let currentTotalVol = 0;
  currentWorkouts.forEach(w => {
    w.exercises.forEach(ex => {
      let vol = 0;
      getValidSets(ex.sets).forEach(s => vol += s.weight_kg * s.reps);
      currentTotalVol += vol;
      const splitVol = vol / (ex.muscle_groups.length || 1);
      ex.muscle_groups.forEach(mg => {
        muscleVol[mg] = (muscleVol[mg] || 0) + splitVol;
      });
    });
  });

  const topMuscle = Object.entries(muscleVol).sort((a, b) => b[1] - a[1])[0];
  const focusMuscle = topMuscle ? topMuscle[0] : "General";
  const focusPct = currentTotalVol > 0 ? (topMuscle ? topMuscle[1] / currentTotalVol : 0) : 0;

  // 3. Volume Trend
  let previousTotalVol = 0;
  previousWorkouts.forEach(w => {
    w.exercises.forEach(ex => {
      getValidSets(ex.sets).forEach(s => previousTotalVol += s.weight_kg * s.reps);
    });
  });

  let direction: 'up' | 'down' | 'stable' = 'stable';
  let percentChange = 0;
  if (previousTotalVol > 0) {
    percentChange = ((currentTotalVol - previousTotalVol) / previousTotalVol) * 100;
    if (percentChange > 10) direction = 'up';
    else if (percentChange < -10) direction = 'down';
  } else if (currentTotalVol > 0) {
    direction = 'up';
    percentChange = 100;
  }

  // 4. Recent PRs
  const allPRs = getPersonalRecords(workouts);
  // Count PRs that happened in the current period
  const recentPRCount = allPRs.filter(pr => {
    const weightDate = new Date(pr.maxWeightDate);
    const e1rmDate = new Date(pr.maxE1RMDate);
    const volDate = new Date(pr.maxVolumeDate);
    return (weightDate >= currentPeriodStart) || (e1rmDate >= currentPeriodStart) || (volDate >= currentPeriodStart);
  }).length;

  // 5. Dynamic Insight
  let insight = "";
  if (recentPRCount > 2) {
    insight = `You're on fire! Breaking ${recentPRCount} records this week indicates mostly optimal recovery.`;
  } else if (direction === 'down' && count >= 3) {
    insight = "Volume is down despite good attendance. This might be a healthy deload or intensity focus.";
  } else if (rating === 'High' && direction === 'up') {
    insight = "High volume and high frequency. Ensure you're eating and sleeping enough to support this load.";
  } else {
    insight = `Your primary focus this week was ${focusMuscle}. Consider balancing with antagonist work next week.`;
  }

  return {
    period: "Last 7 Days",
    adherence: { count, rating, message },
    focus: { muscle: focusMuscle, percentage: focusPct },
    volumeTrend: { direction, percentChange },
    recentPRs: recentPRCount,
    insight
  };
}

export function getYearlySummary(workouts: Workout[]) {
  if (workouts.length === 0) return null;

  let totalVolume = 0;
  let totalReps = 0;
  let totalSets = 0;
  const muscleGroups: Record<string, number> = {};
  const dayFrequency: Record<number, number> = {}; // 0-6

  workouts.forEach(w => {
    const day = new Date(w.metadata.date).getDay();
    dayFrequency[day] = (dayFrequency[day] || 0) + 1;

    w.exercises.forEach(ex => {
      ex.muscle_groups.forEach(mg => {
        muscleGroups[mg] = (muscleGroups[mg] || 0) + 1;
      });

      getValidSets(ex.sets).forEach(s => {
        totalVolume += s.weight_kg * s.reps;
        totalReps += s.reps;
        totalSets += 1;
      });
    });
  });

  const topMuscle = Object.entries(muscleGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const topDayIndex = Object.entries(dayFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topDay = topDayIndex !== undefined ? dayNames[parseInt(topDayIndex)] : 'N/A';

  return {
    totalWorkouts: workouts.length,
    totalVolume,
    totalReps,
    totalSets,
    topMuscle,
    topDay,
    year: new Date(workouts[0].metadata.date).getFullYear()
  };
}

export function getRepRangeDistribution(workouts: Workout[]) {
  const ranges = {
    '1-5 (Strength)': 0,
    '6-12 (Hypertrophy)': 0,
    '13-20 (Endurance)': 0,
    '20+ (Conditioning)': 0,
  };

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      getValidSets(ex.sets).forEach((set) => {
        if (set.is_warmup) return; // Exclude warmups for training analysis

        if (set.reps <= 5) ranges['1-5 (Strength)']++;
        else if (set.reps <= 12) ranges['6-12 (Hypertrophy)']++;
        else if (set.reps <= 20) ranges['13-20 (Endurance)']++;
        else ranges['20+ (Conditioning)']++;
      });
    });
  });

  return Object.entries(ranges).map(([name, value]) => ({ name, value }));
}

export function getHardSetsAnalysis(workouts: Workout[]) {
  // Hard set = RPE >= 7 or RIR <= 3
  // Return hard sets vs easy sets per week
  const weeklyAnalysis: Record<string, { hard: number; easy: number }> = {};

  workouts.forEach((w) => {
    const date = new Date(w.metadata.date);
    const day = date.getDay() || 7; 
    if (day !== 1) date.setHours(-24 * (day - 1));
    const weekKey = date.toISOString().split("T")[0];

    if (!weeklyAnalysis[weekKey]) weeklyAnalysis[weekKey] = { hard: 0, easy: 0 };

    w.exercises.forEach((ex) => {
      getValidSets(ex.sets).forEach((set) => {
        if (set.is_warmup) return;

        const isHard = (set.rpe !== undefined && set.rpe >= 7) || (set.rir !== undefined && set.rir <= 3);
        
        if (isHard) {
          weeklyAnalysis[weekKey].hard++;
        } else {
          weeklyAnalysis[weekKey].easy++;
        }
      });
    });
  });

  return Object.entries(weeklyAnalysis)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
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
        records.set(ex.id, {
          exerciseId: ex.id,
          exerciseName: ex.name,
          maxWeight: 0,
          maxWeightDate: '',
          maxE1RM: 0,
          maxE1RMDate: '',
          maxVolume: 0,
          maxVolumeDate: '',
        });
      }

      const rec = records.get(ex.id)!;
      let sessionVolume = 0;

      getValidSets(ex.sets).forEach((set) => {
        // Max Weight
        if (set.weight_kg > rec.maxWeight) {
          rec.maxWeight = set.weight_kg;
          rec.maxWeightDate = date;
        }

        // Max Estimated 1RM
        const e1rm = calculate1RM(set.weight_kg, set.reps);
        if (e1rm > rec.maxE1RM) {
          rec.maxE1RM = e1rm;
          rec.maxE1RMDate = date;
        }

        sessionVolume += set.weight_kg * set.reps;
      });

      // Max Volume (Session)
      if (sessionVolume > rec.maxVolume) {
        rec.maxVolume = sessionVolume;
        rec.maxVolumeDate = date;
      }
    });
  });

  return Array.from(records.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}