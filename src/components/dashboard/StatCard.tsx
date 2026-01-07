'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { IconProps, Info } from 'phosphor-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  description?: string;
  tooltip?: string; // New field for info icon
  className?: string;
  colorClassName?: string;
}

export function StatCard({ title, value, icon: Icon, description, tooltip, className, colorClassName }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm relative", className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            {tooltip && (
              <div 
                className="relative cursor-help group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={14} className="text-gray-400 hover:text-blue-500 transition-colors" />
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl z-50 pointer-events-none border border-gray-700">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg", colorClassName || "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400")}>
          <Icon size={24} weight="duotone" />
        </div>
      </div>
    </div>
  );
}