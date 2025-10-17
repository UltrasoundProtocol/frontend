import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fmtMoney, fmtPct } from '../../utils/format';
import { KeyValueRow } from './key-value-row';
import { HoldingRow } from './holding-row';
import type { Holding } from '../../types';

interface PositionCardProps {
  totalBalance: number;
  userApy: number;
  pnl: number;
  holdings: Holding[];
  lpTokens?: number | string;
  className?: string;
}

export function PositionCard({
  totalBalance,
  userApy,
  pnl,
  holdings,
  lpTokens,
  className,
}: PositionCardProps) {
  const pnlIsPositive = pnl >= 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Your Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="space-y-3">
          <KeyValueRow
            label="Total Balance"
            value={`$${fmtMoney(totalBalance)}`}
          />
          <KeyValueRow
            label="User APY"
            value={
              <span className="text-green-600 dark:text-green-400">
                {fmtPct(userApy)}
              </span>
            }
          />
          <KeyValueRow
            label="Gain/Loss"
            value={
              <span
                className={cn(
                  pnlIsPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {pnlIsPositive ? '+' : ''}${fmtMoney(Math.abs(pnl))}
              </span>
            }
          />
        </div>

        {/* Holdings */}
        <div>
          <h4 className="mb-2 text-sm font-semibold">Holdings</h4>
          <div className="divide-y rounded-lg border">
            {holdings.map((holding) => (
              <HoldingRow key={holding.symbol} holding={holding} />
            ))}
          </div>
        </div>

        {/* LP Tokens */}
        {lpTokens !== undefined && (
          <KeyValueRow
            label="LP Tokens"
            value={
              typeof lpTokens === 'number'
                ? fmtMoney(lpTokens, 2)
                : lpTokens
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
