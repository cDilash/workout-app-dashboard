'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { IconProps, Info } from 'phosphor-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  description?: string;
  tooltip?: string;
  className?: string;
  colorClassName?: string;
}

export function StatCard({ title, value, icon: Icon, description, tooltip, className, colorClassName }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={cn("glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden", className)}>
      {/* Decorative Gradient Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
            {tooltip && (
              <div 
                className="relative cursor-help group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={14} weight="bold" className="text-gray-500 hover:text-white transition-colors" />
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 glass-card bg-black/80 text-white text-[10px] rounded-xl shadow-xl z-50 pointer-events-none">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1 font-medium">{description}</p>
          )}
        </div>
        
        {/* Minimalist Icon */}
        <div className={cn("p-3 rounded-2xl glass-card border-0 bg-white/5 text-white")}>
          <Icon size={24} weight="fill" className="opacity-80" />
        </div>
      </div>
    </div>
  );
}
