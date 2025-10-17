'use client';

import { ReactNode } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GoldFooterProps {
  leftText: string;
  contract?: {
    short: string;
    full: string;
    onCopy?: () => void;
    href?: string;
  };
  socials?: ReactNode;
  className?: string;
}

export function GoldFooter({
  leftText,
  contract,
  socials,
  className,
}: GoldFooterProps) {
  return (
    <footer className={cn('border-t bg-background py-6', className)}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left text */}
          <p className="text-sm text-muted-foreground">{leftText}</p>

          {/* Contract address */}
          {contract && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Contract:
              </span>
              {contract.href ? (
                <a
                  href={contract.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-foreground hover:underline"
                >
                  {contract.short}
                </a>
              ) : (
                <span className="text-sm font-mono text-foreground">
                  {contract.short}
                </span>
              )}
              {contract.onCopy && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-pointer"
                  onClick={contract.onCopy}
                  aria-label="Copy contract address"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Social links */}
          {socials && (
            <div className="flex items-center gap-2">
              {socials}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
