import { cn } from '@/lib/utils';
import { KpiCard } from './kpi-card';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'none';
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

interface KpiGridProps {
  items: KpiCardProps[];
  className?: string;
}

export function KpiGrid({ items, className }: KpiGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {items.map((item, index) => (
        <KpiCard key={`${item.label}-${index}`} {...item} />
      ))}
    </div>
  );
}
