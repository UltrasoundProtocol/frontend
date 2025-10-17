import { cn } from '@/lib/utils';
import { fmtMoney } from '../../utils/format';
import type { Holding } from '../../types';

interface HoldingRowProps {
  holding: Holding;
  className?: string;
}

export function HoldingRow({ holding, className }: HoldingRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <div className="flex items-center gap-3">
        {holding.iconSrc && (
          <img
            src={holding.iconSrc}
            alt={holding.symbol}
            className="h-6 w-6 rounded-full"
          />
        )}
        <span className="font-medium">{holding.symbol}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{holding.qty.toFixed(4)}</p>
        <p className="text-xs text-muted-foreground">${fmtMoney(holding.fiat)}</p>
      </div>
    </div>
  );
}
