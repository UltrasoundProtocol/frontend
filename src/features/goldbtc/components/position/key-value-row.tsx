import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KeyValueRowProps {
  label: string;
  value: string | ReactNode;
  className?: string;
}

export function KeyValueRow({ label, value, className }: KeyValueRowProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
