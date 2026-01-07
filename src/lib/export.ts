import { AppExportData } from "./types";

/**
 * Converts an array of objects into a CSV string
 */
function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      const val = obj[header];
      if (typeof val === 'string') {
        const escaped = val.replace(/"/g, '""');
        return '"' + escaped + '"';
      }
      return String(val ?? '');
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Downloads a string as a file in the browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates the flat sets.csv as defined in DATA_HANDLING.md
 */
export function generateSetsCSV(data: AppExportData): string {
  const flatSets: Record<string, unknown>[] = [];

  data.workouts.forEach(w => {
    w.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        flatSets.push({
          workout_id: w.id,
          date: w.metadata.date,
          exercise_name: ex.name,
          movement_pattern: ex.movement_pattern || 'Other',
          set_number: s.set_number,
          weight_kg: s.weight_kg,
          reps: s.reps,
          rpe: s.rpe || '',
          rir: s.rir || '',
          is_warmup: s.is_warmup,
          is_deleted: s.is_deleted
        });
      });
    });
  });

  return convertToCSV(flatSets);
}

/**
 * Generates the workouts.csv
 */
export function generateWorkoutsCSV(data: AppExportData): string {
  const flatWorkouts: Record<string, unknown>[] = data.workouts.map(w => ({
    workout_id: w.id,
    date: w.metadata.date,
    timezone: w.metadata.timezone,
    bodyweight_kg: w.metadata.bodyweight_kg || '',
    sleep_hours: w.metadata.sleep_hours || '',
    readiness_score: w.metadata.readiness_score || '',
    notes: w.metadata.notes || ''
  }));

  return convertToCSV(flatWorkouts);
}
