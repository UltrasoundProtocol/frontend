'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GoldHeaderProps {
  brand: {
    name: string;
    logoSrc?: string;
    href: string;
  };
  connectButton: ReactNode;
  className?: string;
}

export function GoldHeader({
  brand,
  connectButton,
  className,
}: GoldHeaderProps) {
  return (
    <header className={cn('border-b bg-background', className)}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href={brand.href}
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            {brand.logoSrc && (
              <img
                src={brand.logoSrc}
                alt={brand.name}
                className="h-8 w-8"
              />
            )}
            <span className="text-lg">{brand.name}</span>
          </Link>

          {/* Connect Button */}
          <div className="flex items-center gap-4">
            {connectButton}
          </div>
        </div>
      </div>
    </header>
  );
}
