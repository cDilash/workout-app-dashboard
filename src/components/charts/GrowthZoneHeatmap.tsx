'use client';

import React, { useMemo } from 'react';
import { Workout } from '@/lib/types';
import { getGrowthZoneHeatmap } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface GrowthZoneHeatmapProps {
  workouts: Workout[];
  className?: string;
}

const VOL_BUCKETS = ['0-5k', '5-10k', '10-15k', '15-20k', '20k+'];
const RPE_BUCKETS = ['8-10', '5-7', '1-4']; // Sorted high to low for Y-axis

export function GrowthZoneHeatmap({ workouts, className }: GrowthZoneHeatmapProps) {
  const data = useMemo(() => getGrowthZoneHeatmap(workouts), [workouts]);

  const maxCount = useMemo(() => {
    const counts = Object.values(data);
    return counts.length > 0 ? Math.max(...counts) : 1;
  }, [data]);

  const getOpacity = (count: number) => {
    if (count === 0) return 'opacity-0';
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'bg-white';
    if (ratio > 0.6) return 'bg-white/80';
    if (ratio > 0.4) return 'bg-white/60';
    if (ratio > 0.2) return 'bg-white/40';
    return 'bg-white/20';
  };

  return (
    <div className={cn("bw-card rounded-xl p-6 flex flex-col h-[480px]", className)}>
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Growth Zone Analysis</h3>
        <InfoTooltip content="Shows your training frequency across Volume vs RPE. Whiter cells indicate your most frequent training zones." />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Heatmap Grid */}
        <div className="flex-1 grid grid-cols-[60px_1fr] gap-4">
          {/* Y Axis Labels */}
          <div className="flex flex-col justify-between py-2">
            {RPE_BUCKETS.map(rpe => (
              <div key={rpe} className="text-[10px] font-black text-gray-500 text-right uppercase tracking-tighter">
                RPE {rpe}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-rows-3 gap-2">
            {RPE_BUCKETS.map(rpe => (
              <div key={rpe} className="grid grid-cols-5 gap-2">
                {VOL_BUCKETS.map(vol => {
                  const count = data[`${vol}|${rpe}`] || 0;
                  return (
                    <div
                      key={`${vol}-${rpe}`}
                      className={cn(
                        "rounded-lg border border-white/5 transition-all duration-500 relative group flex items-center justify-center",
                        count === 0 ? "bg-black" : getOpacity(count)
                      )}
                    >
                      {count > 0 && (
                        <span className={cn(
                          "text-[10px] font-black transition-opacity opacity-0 group-hover:opacity-100",
                          count / maxCount > 0.5 ? "text-black" : "text-white"
                        )}>
                          {count}
                        </span>
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute inset-0 z-10 cursor-help" title={`${vol} Vol @ RPE ${rpe}: ${count} sessions`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* X Axis Labels */}
        <div className="grid grid-cols-[60px_1fr] gap-4 mt-4">
          <div />
          <div className="grid grid-cols-5 gap-2">
            {VOL_BUCKETS.map(vol => (
              <div key={vol} className="text-[10px] font-black text-gray-500 text-center uppercase tracking-tighter">
                {vol}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Labels */}
      <div className="mt-8 flex items-center justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-6">
        <div className="flex gap-4">
          <span className="text-white">Bottom Left: Recovery</span>
          <span className="text-white">Center: Growth</span>
          <span className="text-white">Top Right: Overreaching</span>
        </div>
        <div className="text-right">
          <span>{workouts.length} Total Sessions</span>
        </div>
      </div>
    </div>
  );
}
