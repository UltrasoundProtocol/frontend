'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MetricKey } from '../../types';

interface MetricOption {
  key: MetricKey;
  label: string;
}

interface MetricToggleProps {
  value: MetricKey;
  onChange: (v: MetricKey) => void;
  options?: MetricOption[];
  className?: string;
}

const defaultOptions: MetricOption[] = [
  { key: 'tvl', label: 'TVL' },
  { key: 'apy', label: 'Protocol APY' },
  { key: 'deviation', label: 'Deviation' },
];

export function MetricToggle({
  value,
  onChange,
  options = defaultOptions,
  className,
}: MetricToggleProps) {
  return (
    <div
      className={cn('inline-flex rounded-lg border bg-muted p-1', className)}
      role="tablist"
      aria-label="Metric selection"
    >
      {options.map((option) => {
        const isActive = value === option.key;
        return (
          <Button
            key={option.key}
            variant="ghost"
            size="sm"
            onClick={() => onChange(option.key)}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
