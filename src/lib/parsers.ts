import { AppExportData } from "./types";
import { z, ZodError } from "zod";

// Zod Schema Definition matching Canonical JSON v2.0
const WorkoutMetadataSchema = z.object({
  date: z.string().datetime(), // ISO8601 validation
  timezone: z.string(),
  bodyweight_kg: z.number().optional(),
  sleep_hours: z.number().optional(),
  readiness_score: z.number().optional(),
  notes: z.string().optional(),
});

const WorkoutSetSchema = z.object({
  set_id: z.string(),
  set_number: z.number(),
  weight_kg: z.number(),
  reps: z.number(),
  rpe: z.number().optional(),
  rir: z.number().optional(),
  rest_seconds: z.number().optional(),
  tempo: z.string().optional(),
  is_warmup: z.boolean(),
  is_failure: z.boolean(),
  is_deleted: z.boolean(),
});

const ExerciseDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  movement_pattern: z.string().optional(),
  mechanics: z.enum(['compound', 'isolation']).optional(),
  muscle_groups: z.array(z.string()),
  sets: z.array(WorkoutSetSchema),
});

const WorkoutSchema = z.object({
  id: z.string(),
  schema_version: z.string(),
  metadata: WorkoutMetadataSchema,
  exercises: z.array(ExerciseDataSchema),
});

const AppExportDataSchema = z.object({

  version: z.string(),

  workouts: z.array(WorkoutSchema),

});



/**

 * Basic sanitization to strip HTML tags from user-provided notes.

 * Prevents XSS payloads from being persisted in localStorage.

 */

function sanitizeString(str: string): string {

  return str.replace(/<[^>]*>?/gm, '');

}



// Legacy Schema for v1.0

const WorkoutSchemaV1 = z.object({

  id: z.string(),

  name: z.string().optional(),

  startTime: z.string(),

  endTime: z.string().optional(),

  exercises: z.array(z.object({

    exercise: z.object({

      id: z.string(),

      name: z.string(),

      muscleGroup: z.string(),

    }),

    sets: z.array(z.object({

      id: z.string(),

      weight: z.number(),

      reps: z.number(),

    })),

  })),

});



const AppExportDataSchemaV1 = z.object({

  version: z.string(),

  workouts: z.array(WorkoutSchemaV1),

});



type V1Data = z.infer<typeof AppExportDataSchemaV1>;







function migrateV1toV2(data: V1Data): unknown {



  console.log("Migrating V1 export to V2...");



  return {





    version: "2.0",

    workouts: data.workouts.map((w) => ({

      id: w.id,

      schema_version: "1.0",

      metadata: {

        date: w.startTime,

        timezone: "UTC",

        notes: sanitizeString(w.name || ""),

      },

      exercises: w.exercises.map((ex) => ({

        id: ex.exercise.id,

        name: ex.exercise.name,

        muscle_groups: [ex.exercise.muscleGroup],

        sets: ex.sets.map((s) => ({

          set_id: s.id,

          set_number: 1, 

          weight_kg: s.weight,

          reps: s.reps,

          is_warmup: false,

          is_failure: false,

          is_deleted: false,

        }))

      }))

    }))

  };

}



export function parseExportData(jsonData: string): AppExportData | null {

  try {

    const parsed = JSON.parse(jsonData);



    // Check version

    if (parsed.version === "1.0" || parsed.version === "1.0.0") {

       try {

         const v1Data = AppExportDataSchemaV1.parse(parsed);

         const migrated = migrateV1toV2(v1Data);

         return AppExportDataSchema.parse(migrated) as AppExportData;

       } catch (migrationError) {

         console.error("Migration failed:", migrationError);

         return null;

       }

    }



    const validData = AppExportDataSchema.parse(parsed);

    

    // Sanitize metadata notes in v2

    validData.workouts.forEach(w => {

      if (w.metadata.notes) {

        w.metadata.notes = sanitizeString(w.metadata.notes);

      }

    });



    return validData as AppExportData;

  } catch (e) {

    if (e instanceof ZodError) {

      console.error("Validation Error:", e.issues);

    } else {

      console.error("Failed to parse export data", e);

    }

    return null;

  }

}


    