'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PoolInfoItem } from '../../types';

interface PoolInfoListProps {
  items: PoolInfoItem[];
  className?: string;
}

export function PoolInfoList({ items, className }: PoolInfoListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Pool Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {item.value}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm font-medium">{item.value}</span>
              )}
              {item.isCopyable && item.onCopy && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-pointer"
                  onClick={item.onCopy}
                  aria-label={`Copy ${item.label}`}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
