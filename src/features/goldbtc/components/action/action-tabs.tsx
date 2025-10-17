'use client';

import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ActionTabsProps {
  value: 'deposit' | 'withdraw';
  onChange: (v: 'deposit' | 'withdraw') => void;
  children: ReactNode;
  className?: string;
}

export function ActionTabs({
  value,
  onChange,
  children,
  className,
}: ActionTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as 'deposit' | 'withdraw')} className={className}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="deposit">Deposit</TabsTrigger>
        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
