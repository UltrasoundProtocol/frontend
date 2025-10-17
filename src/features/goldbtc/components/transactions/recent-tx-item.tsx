import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentTx } from '../../types';

interface RecentTxItemProps {
  tx: RecentTx;
  className?: string;
}

export function RecentTxItem({ tx, className }: RecentTxItemProps) {
  const isDeposit = tx.type.toLowerCase().includes('deposit');

  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            isDeposit
              ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
          )}
        >
          {isDeposit ? (
            <ArrowDownToLine className="h-4 w-4" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{tx.type}</p>
          <p className="text-xs text-muted-foreground">{tx.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-sm font-semibold',
            isDeposit
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {isDeposit ? '+' : '-'}
          {tx.amount}
        </p>
        <p className="text-xs text-muted-foreground">{tx.asset}</p>
      </div>
    </div>
  );
}
