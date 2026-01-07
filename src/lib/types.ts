// Canonical Data Definitions based on DATA_HANDLING.md

export interface WorkoutSet {
  set_id: string; // UUID
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number;
  rir?: number;
  rest_seconds?: number;
  tempo?: string; // e.g., "3010"
  is_warmup: boolean;
  is_failure: boolean;
  is_deleted: boolean;
}

export interface ExerciseData {
  id: string; // UUID
  name: string;
  movement_pattern?: string; // e.g., "Squat", "Push"
  mechanics?: 'compound' | 'isolation'; // New explicit field
  muscle_groups: string[];
  sets: WorkoutSet[];
}

export interface WorkoutMetadata {
  date: string; // ISO8601
  timezone: string;
  bodyweight_kg?: number;
  sleep_hours?: number;
  readiness_score?: number;
  notes?: string;
}

export interface Workout {
  id: string; // UUID
  schema_version: string;
  metadata: WorkoutMetadata;
  exercises: ExerciseData[];
}

export interface AppExportData {
  version: string; // Export format version
  workouts: Workout[];
}