import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GoldShellProps {
  children: ReactNode;
  header: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function GoldShell({ children, header, footer, className }: GoldShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {header}
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-2">
        {children}
      </main>
      {footer}
    </div>
  );
}
