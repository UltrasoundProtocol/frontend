import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RecentTxItem } from './recent-tx-item';
import type { RecentTx } from '../../types';

interface RecentTxListProps {
  items: RecentTx[];
  className?: string;
}

export function RecentTxList({ items, className }: RecentTxListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No recent transactions
          </p>
        ) : (
          <div className="divide-y">
            {items.map((tx, index) => (
              <RecentTxItem key={`${tx.date}-${index}`} tx={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
