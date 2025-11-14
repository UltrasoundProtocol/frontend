'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

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
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Vault' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

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
                className="h-auto w-auto max-w-[150px] md:max-w-[200px]"
                priority
              />
            ) : (
              <span className="text-lg">{brand.name}</span>
            )}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href
                    ? 'text-foreground border-b-2 border-primary pb-1'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle and Connect Button */}
          <div className="flex items-center gap-4 whitespace-nowrap">
            <ThemeToggle />
            {connectButton}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-4 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href
                  ? 'text-foreground border-b-2 border-primary pb-1'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
