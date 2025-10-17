import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TokenPriceRow } from './token-price-row';
import type { TokenPrice } from '../../types';

interface TokenPriceListProps {
  items: TokenPrice[];
  className?: string;
}

export function TokenPriceList({ items, className }: TokenPriceListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Token Prices</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {items.map((item) => (
          <TokenPriceRow key={item.symbol} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}
