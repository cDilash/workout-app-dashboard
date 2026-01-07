import React from 'react';
import { cn } from '@/lib/utils';
import { IconProps } from 'phosphor-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  description?: string;
  className?: string;
  colorClassName?: string;
}

export function StatCard({ title, value, icon: Icon, description, className, colorClassName }: StatCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
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
