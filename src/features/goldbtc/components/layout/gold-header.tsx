'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
            {brand.logoSrc ? (
              <Image
                src={brand.logoSrc}
                alt={brand.name}
                width={200}
                height={40}
                className="h-auto w-auto max-w-[130px] md:max-w-[200px]"
                priority
              />
            ) : (
              <span className="text-lg">{brand.name}</span>
            )}
          </Link>

          {/* Connect Button */}
          <div className="flex items-center gap-4 whitespace-nowrap">
            {connectButton}
          </div>
        </div>
      </div>
    </header>
  );
}
