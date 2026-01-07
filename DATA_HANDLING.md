# Data Handling Architecture (Web Dashboard)

> **Role:** Data Architect
> **Scope:** Web Dashboard (Consumer & Visualizer)
> **Objective:** Efficiently ingest, persist, and visualize workout data from the Mobile App.

## 1. Data Ingestion (Read-Only)

The Web App acts as a **Consumer**. It does not create or modify workout records (the "Source of Truth" is the Mobile App).

### Input Format: Canonical JSON Export
The dashboard must strictly validate imported files against the **Canonical Schema** (Version 2.0).

```json
{
  "version": "2.0",
  "workouts": [
    {
      "id": "uuid",
      "metadata": { "date": "ISO8601", "bodyweight_kg": 75.5, ... },
      "exercises": [
        {
          "id": "ex-uuid",
          "name": "Squat",
          "movement_pattern": "Squat",
          "mechanics": "compound",
          "muscle_groups": ["Legs"],
          "sets": [ ... ]
        }
      ]
    }
  ]
}
```

### Validation Rules
1.  **Strict Schema Check:** Reject files with missing `id` or invalid `date` formats.
2.  **Version Compatibility:** Gracefully handle older export versions (if possible) or prompt user to update mobile app.
3.  **Sanitization:** Ensure no malicious scripts in `notes` fields.

---

## 2. Browser Persistence (Client-Side Storage)

To ensure a seamless user experience (no need to re-upload on refresh), the dashboard must persist state locally.

### Strategy: `localStorage` (via Zustand Persist)
*   **Key:** `workout-dashboard-storage`
*   **Content:** The full parsed `AppExportData` object.
*   **Limit:** Browser LocalStorage is typically capped at ~5MB.
    *   *Mitigation:* If the JSON grows >5MB, switch to **IndexedDB** or compress the data string (LZ-string).
*   **Privacy:** Data lives **only** in the user's browser. No cloud upload.

---

## 3. Derived Metrics (Read-Time Computation)

The dashboard is the "Intelligence Layer". It computes metrics that are too expensive or complex for the mobile app to store.

**Principle:** Calculate on the fly. Do not store derived data.

### Compute Pipeline
1.  **Ingest:** Load JSON from Store.
2.  **Filter:** Exclude `is_deleted: true` sets.
3.  **Compute:**
    *   **Volume:** $\sum (weight\_kg \times reps)$
    *   **1RM:** Epley Formula.
    *   **Hard Sets:** Count of sets where RPE >= 7.
    *   **Consistency:** Weekly frequency calculations.
4.  **Render:** Pass clean, aggregated objects to Chart components.

---

## 4. Visualization Integrity

### Charting Rules
1.  **Units:** Always display units (kg/lbs) clearly. Use user preference if available (default to kg).
2.  **Time Series:** Sort strictly by `metadata.date` ascending.
3.  **Null Handling:**
    *   Missing `RPE` -> Treat as null (do not plot as 0).
    *   Missing `weight` -> Exclude from volume calculations.
4.  **Performance:**
    *   For datasets > 1000 workouts, utilize **Web Workers** for heavy aggregation logic to prevent UI freezing.
    *   Memoize expensive calculations (e.g., `getPersonalRecords`) using `useMemo`.

---

## 5. Security & Privacy

*   **Local Only:** The Web App is a "Static" SPA. Data never leaves the client.
*   **No Tracking:** Do not implement analytics that capture personal workout details.
*   **Clear Data:** Provide a prominent "Clear Data" button to wipe LocalStorage.