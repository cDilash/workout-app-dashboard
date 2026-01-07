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
    <div className={cn("bw-card rounded-xl p-6 relative overflow-hidden group", className)}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{title}</p>
            {tooltip && (
              <div 
                className="relative cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={12} weight="bold" className="text-gray-600 hover:text-white transition-colors" />
                {showTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-white text-black text-[10px] font-medium rounded shadow-xl z-50 pointer-events-none">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tighter">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        {/* Minimalist Icon */}
        <div className="text-gray-700 group-hover:text-white transition-colors duration-300">
          <Icon size={24} weight="fill" />
        </div>
      </div>
    </div>
  );
}