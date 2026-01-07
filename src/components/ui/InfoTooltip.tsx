'use client';

import React, { useState } from 'react';
import { Info } from 'phosphor-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("inline-block relative ml-1.5", className)}>
      <Info 
        size={14} 
        className="text-gray-400 hover:text-blue-500 cursor-help transition-colors" 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded shadow-xl z-50 pointer-events-none border border-gray-700 font-normal">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
