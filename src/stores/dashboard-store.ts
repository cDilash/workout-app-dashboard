import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { AppExportData } from '@/lib/types';
import LZString from 'lz-string';

interface DashboardState {
  data: AppExportData | null;
  unitPreference: 'kg' | 'lbs';
  isLoading: boolean;
  setData: (data: AppExportData) => void;
  setUnitPreference: (unit: 'kg' | 'lbs') => void;
  clearData: () => void;
}

// Custom storage wrapper for compression
const compressedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    try {
      // Try decompressing; if null/empty (meaning it wasn't compressed or failed), return original
      // Note: lz-string returns null on invalid input or empty string.
      // However, for backward compatibility during dev, we might check if it's valid JSON first?
      // Actually, standard approach: try decompress. If it looks like JSON, good.
      // But LZString.decompressFromUTF16 returns null if it fails.
      
      const decompressed = LZString.decompressFromUTF16(value);
      return decompressed || value; // Fallback to raw value if decompression returns null (migration path)
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
      isLoading: false,
      setData: (data) => set({ data }),
      setUnitPreference: (unit) => set({ unitPreference: unit }),
      clearData: () => set({ data: null }),
    }),
    {
      name: 'workout-dashboard-storage',
      storage: createJSONStorage(() => compressedStorage),
      partialize: (state) => ({ 
        data: state.data,
        unitPreference: state.unitPreference 
      }),
    }
  )
);