'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fmtMoney } from '../../utils/format';

interface ActionFormProps {
  kind: 'deposit' | 'withdraw';
  amount?: number;
  balance?: number;
  min?: number;
  max?: number;
  receivePreview?: string;
  validationMessage?: string;
  disabled?: boolean;
  onChange: (fields: { amount?: number }) => void;
  onSelectPct: (pct: number) => void;
  onSubmit: () => void;
  className?: string;
}

const percentages = [10, 25, 50, 75, 100];

export function ActionForm({
  kind,
  amount,
  balance,
  min,
  max,
  receivePreview,
  validationMessage,
  disabled = false,
  onChange,
  onSelectPct,
  onSubmit,
  className,
}: ActionFormProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base capitalize">{kind}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset info (non-selectable) */}
        <div className="space-y-2">
          <Label htmlFor="asset">
            {kind === 'deposit' ? 'Deposit Asset' : 'Withdraw'}
          </Label>
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {kind === 'deposit' ? (
              <span className="font-medium">USDC</span>
            ) : (
              <span className="font-medium">WBTC + PAXG</span>
            )}
          </div>
          {kind === 'withdraw' && (
            <p className="text-xs text-muted-foreground">
              Withdrawals return proportional amounts of both vault assets
            </p>
          )}
        </div>

        {/* Amount input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">
              {kind === 'deposit' ? 'Amount (USDC)' : 'Amount (LP Tokens)'}
            </Label>
            {balance !== undefined && (
              <span className="text-xs text-muted-foreground">
                Balance: {kind === 'deposit' ? `${fmtMoney(balance)} USDC` : `${fmtMoney(balance)} LP`}
              </span>
            )}
          </div>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange({ amount: isNaN(val) ? undefined : val });
            }}
            min={min}
            max={max}
            step="any"
            aria-describedby={validationMessage ? 'validation-message' : undefined}
          />

          {/* Quick percentage buttons */}
          <div className="flex flex-wrap gap-2">
            {percentages.map((pct) => (
              <Button
                key={pct}
                variant="secondary"
                size="sm"
                onClick={() => onSelectPct(pct)}
                type="button"
              >
                {pct}%
              </Button>
            ))}
          </div>

          {/* Min/Max hints */}
          {(min !== undefined || max !== undefined) && (
            <p className="text-xs text-muted-foreground">
              {min !== undefined && `Min: ${fmtMoney(min)}${kind === 'deposit' ? ' USDC' : ' LP'}`}
              {min !== undefined && max !== undefined && ' | '}
              {max !== undefined && `Max: ${fmtMoney(max)}${kind === 'deposit' ? ' USDC' : ' LP'}`}
            </p>
          )}

          {/* Testnet deposit guidance */}
          {kind === 'deposit' && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Testnet: Start with 10-50 USDC. Larger amounts may fail due to limited pool liquidity.
            </p>
          )}
        </div>

        {/* Validation message */}
        {validationMessage && (
          <p
            id="validation-message"
            className="text-sm text-destructive"
            role="alert"
          >
            {validationMessage}
          </p>
        )}

        {/* Receive preview */}
        {receivePreview && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">You'll receive</p>
            <p className="text-lg font-semibold">{receivePreview}</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          onClick={onSubmit}
          disabled={disabled || !amount || amount <= 0}
          className={cn(
            'w-full',
            kind === 'deposit' &&
              'bg-yellow-500 text-white hover:bg-yellow-600'
          )}
        >
          {kind === 'deposit' ? 'Deposit' : 'Withdraw'}
        </Button>
      </CardContent>
    </Card>
  );
}
