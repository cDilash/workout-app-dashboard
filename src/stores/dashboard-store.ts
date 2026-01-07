import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { AppExportData } from '@/lib/types';
import LZString from 'lz-string';

interface DashboardState {
  data: AppExportData | null;
  unitPreference: 'kg' | 'lbs';
  goals: Record<string, number>; // exerciseId -> target weight (in kg)
  isLoading: boolean;
  setData: (data: AppExportData) => void;
  setUnitPreference: (unit: 'kg' | 'lbs') => void;
  setGoal: (exerciseId: string, weight: number) => void;
  removeGoal: (exerciseId: string) => void;
  clearData: () => void;
}

// Custom storage wrapper for compression
const compressedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    try {
      const decompressed = LZString.decompressFromUTF16(value);
      return decompressed || value;
    } catch (e) {
      console.warn("Failed to decompress storage, returning raw value", e);
      return value;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const compressed = LZString.compressToUTF16(value);
      localStorage.setItem(name, compressed);
    } catch (e) {
      console.error("Failed to compress and save to storage", e);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      data: null,
      unitPreference: 'kg',
      goals: {},
      isLoading: false,
      setData: (data) => set({ data }),
      setUnitPreference: (unit) => set({ unitPreference: unit }),
      setGoal: (id, weight) => set((state) => ({ goals: { ...state.goals, [id]: weight } })),
      removeGoal: (id) => set((state) => {
        const newGoals = { ...state.goals };
        delete newGoals[id];
        return { goals: newGoals };
      }),
      clearData: () => set({ data: null, goals: {} }),
    }),
    {
      name: 'workout-dashboard-storage',
      storage: createJSONStorage(() => compressedStorage),
      partialize: (state) => ({ 
        data: state.data, 
        unitPreference: state.unitPreference,
        goals: state.goals 
      }),
    }
  )
);
