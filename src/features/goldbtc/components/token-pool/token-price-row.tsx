import { cn } from '@/lib/utils';
import { fmtMoney, fmtPct } from '../../utils/format';
import type { TokenPrice } from '../../types';

interface TokenPriceRowProps {
  item: TokenPrice;
  className?: string;
}

export function TokenPriceRow({ item, className }: TokenPriceRowProps) {
  const isPositive = item.changePct >= 0;

  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <div className="flex items-center gap-3">
        {item.iconSrc && (
          <img
            src={item.iconSrc}
            alt={item.symbol}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="font-medium">{item.symbol}</span>
      </div>
      <div className="text-right">
        <p className="font-semibold">${fmtMoney(item.price)}</p>
        <p
          className={cn(
            'text-sm',
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {fmtPct(item.changePct)}
        </p>
      </div>
    </div>
  );
}
