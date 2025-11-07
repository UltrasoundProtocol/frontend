import { ReactNode } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | ReactNode;
  trend?: 'up' | 'down' | 'none';
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  trend = 'none',
  hint,
  icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {icon}
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {hint && (
              <p
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trend === 'up' && 'text-green-600 dark:text-green-400',
                  trend === 'down' && 'text-red-600 dark:text-red-400',
                  trend === 'none' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && <ArrowUp className="h-4 w-4" />}
                {trend === 'down' && <ArrowDown className="h-4 w-4" />}
                {hint}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
