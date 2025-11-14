'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { GoldShell } from '@/src/features/goldbtc/components/layout/gold-shell';
import { GoldHeader } from '@/src/features/goldbtc/components/layout/gold-header';
import { GoldFooter } from '@/src/features/goldbtc/components/layout/gold-footer';
import { PositionCard } from '@/src/features/goldbtc/components/position/position-card';
import { ActionTabs } from '@/src/features/goldbtc/components/action/action-tabs';
import { ActionForm } from '@/src/features/goldbtc/components/action/action-form';
import { RecentTxList } from '@/src/features/goldbtc/components/transactions/recent-tx-list';
import { shortAddr, fromUSDC, fromBigDecimal } from '@/src/features/goldbtc/utils/format';
import {
  useCompleteProtocolData,
  useTotalBalance,
  useUserAPY,
  useGainLoss,
  useHoldings,
  useHistory,
  useUSDCBalance,
  useWBTCBalance,
  usePAXGBalance,
  useVaultDeposit,
  useVaultWithdraw,
} from '@/src/hooks';
import { CONTRACTS } from '@/src/lib/config';

export default function Portfolio() {
  const [actionTab, setActionTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [formData, setFormData] = useState({
    amount: undefined as number | undefined,
  });
  const [needsApproval, setNeedsApproval] = useState(true);

  // Get connected wallet address
  const { address: userAddress } = useAccount();

  // Fetch protocol data (needed for prices)
  const { data: protocolData } = useCompleteProtocolData();

  // Fetch user-specific data (only if wallet is connected)
  const { lpBalance, refetch: refetchBalance } = useTotalBalance(userAddress);
  const { userAPY, refetch: refetchAPY } = useUserAPY(userAddress);
  const { gainLoss, refetch: refetchGainLoss } = useGainLoss(userAddress);
  const { holdings: userHoldings, refetch: refetchHoldings } = useHoldings(userAddress);
  const { deposits, withdrawals, refetch: refetchHistory } = useHistory(userAddress);

  // Calculate value per LP token for withdrawal preview
  const lpBalanceNum = parseFloat(lpBalance) || 0;
  const valuePerLPToken = lpBalanceNum > 0 && gainLoss?.currentValue
    ? gainLoss.currentValue / lpBalanceNum
    : 1.0;

  // Fetch token balances for deposit/withdraw
  const { balanceFormatted: usdcBalance, refetch: refetchUSDC } = useUSDCBalance();
  const { refetch: refetchWBTC } = useWBTCBalance();
  const { refetch: refetchPAXG } = usePAXGBalance();

  // Contract interaction hooks
  const {
    depositUSDC,
    executeDeposit,
    isApprovePending,
    isDepositPending,
    isApproveConfirming,
    isDepositConfirming,
    isApproveConfirmed,
    isDepositConfirmed,
  } = useVaultDeposit();

  const {
    withdrawFromVault,
    isWithdrawPending,
    isWithdrawConfirming,
    isWithdrawConfirmed,
  } = useVaultWithdraw();

  // Handle approval confirmation and auto-execute deposit
  useEffect(() => {
    if (isApproveConfirmed && needsApproval && formData.amount) {
      setNeedsApproval(false);
      toast.success('Approval confirmed! Executing deposit...');
      executeDeposit(formData.amount);
    }
  }, [isApproveConfirmed, needsApproval, formData.amount, executeDeposit]);

  // Helper function to refetch all data after transactions
  const refetchAllData = () => {
    // Refetch token balances
    refetchUSDC();
    refetchWBTC();
    refetchPAXG();

    // Refetch user data from subgraph (if connected)
    if (userAddress) {
      refetchBalance?.();
      refetchAPY?.();
      refetchGainLoss?.();
      refetchHoldings?.();
      refetchHistory?.();
    }
  };

  // Handle deposit confirmation
  useEffect(() => {
    if (isDepositConfirmed) {
      toast.success('Deposit confirmed! Your LP tokens have been minted.');
      setNeedsApproval(true); // Reset for next deposit
      setFormData({ amount: undefined }); // Clear form
      // Refresh all data after 3 seconds (allow time for subgraph to index)
      setTimeout(() => {
        refetchAllData();
      }, 3000);
    }
  }, [isDepositConfirmed]);

  // Handle withdrawal confirmation
  useEffect(() => {
    if (isWithdrawConfirmed) {
      toast.success('Withdrawal confirmed! Assets have been sent to your wallet.');
      setFormData({ amount: undefined }); // Clear form
      // Refresh all data after 3 seconds (allow time for subgraph to index)
      setTimeout(() => {
        refetchAllData();
      }, 3000);
    }
  }, [isWithdrawConfirmed]);

  // Full contract address
  const contractAddress = CONTRACTS.VAULT;

  // Prepare user holdings data
  const holdings = userHoldings && protocolData
    ? [
      {
        symbol: 'WBTC',
        qty: userHoldings.asset0Holdings,
        fiat: userHoldings.asset0Holdings * protocolData.wbtcPrice,
        iconSrc: '/icons/BTC_Icon.svg',
      },
      {
        symbol: 'PAXG',
        qty: userHoldings.asset1Holdings,
        fiat: userHoldings.asset1Holdings * protocolData.paxgPrice,
        iconSrc: '/icons/XAUT_Icon.svg',
      },
    ]
    : [];

  // Prepare recent transactions from history
  const recentTransactions = [
    ...deposits.slice(0, 5).map((deposit) => ({
      type: 'Deposit',
      date: new Date(parseInt(deposit.timestamp) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount: `${fromUSDC(deposit.stablecoinAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USDC`,
      asset: 'USDC',
    })),
    ...withdrawals.slice(0, 5).map((withdrawal) => ({
      type: 'Withdrawal',
      date: new Date(parseInt(withdrawal.timestamp) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount: `$${fromBigDecimal(withdrawal.valueUSD || '0').toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      asset: 'WBTC+PAXG',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const handleFormChange = (fields: { amount?: number }) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSelectPct = (pct: number) => {
    const balance = actionTab === 'deposit' ? usdcBalance : parseFloat(lpBalance) || 0;
    setFormData((prev) => ({
      ...prev,
      amount: (balance * pct) / 100,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      if (actionTab === 'deposit') {
        // Only USDC deposits are supported
        if (needsApproval) {
          await depositUSDC(formData.amount);
        } else {
          await executeDeposit(formData.amount);
        }
        // Data will auto-refresh via useEffect when isDepositConfirmed becomes true
      } else {
        // Withdraw - returns both WBTC and PAXG
        await withdrawFromVault(formData.amount);
        // Data will auto-refresh via useEffect when isWithdrawConfirmed becomes true
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <GoldShell
      header={
        <GoldHeader
          brand={{ name: 'ULTRASOUND', logoSrc: '/Logo_inline.png', href: '/' }}
          connectButton={<ConnectButton />}
        />
      }
      footer={
        <GoldFooter
          leftText="© ULTRASOUND — All Rights Reserved."
          contract={{
            short: shortAddr(contractAddress),
            full: contractAddress,
            onCopy: () => {
              navigator.clipboard.writeText(contractAddress);
              toast.success('Contract address copied to clipboard!');
            },
            href: `https://etherscan.io/address/${contractAddress}`,
          }}
        />
      }
    >
      {/* Portfolio Content */}
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Position Card */}
        <PositionCard
          totalBalance={gainLoss?.currentValue || 0}
          userApy={userAPY?.apy || 0}
          pnl={gainLoss?.profit || 0}
          holdings={holdings}
          lpTokens={parseFloat(lpBalance) || 0}
        />

        {/* Deposit/Withdraw Actions */}
        <ActionTabs value={actionTab} onChange={setActionTab}>
          <div className="mt-4">
            <ActionForm
              kind={actionTab}
              amount={formData.amount}
              balance={actionTab === 'deposit' ? usdcBalance : parseFloat(lpBalance) || 0}
              min={actionTab === 'deposit' ? 10 : 0.01}
              max={actionTab === 'deposit' ? usdcBalance : parseFloat(lpBalance) || 0}
              receivePreview={
                formData.amount
                  ? actionTab === 'deposit'
                    ? `~${(formData.amount * 0.98).toFixed(4)} BV-LP`
                    : `~$${(formData.amount * valuePerLPToken * 0.98).toFixed(2)} USDC value`
                  : undefined
              }
              disabled={isApprovePending || isDepositPending || isApproveConfirming || isDepositConfirming || isWithdrawPending || isWithdrawConfirming}
              onChange={handleFormChange}
              onSelectPct={handleSelectPct}
              onSubmit={handleSubmit}
            />
          </div>
        </ActionTabs>

        {/* Recent Transactions */}
        <RecentTxList items={recentTransactions} />
      </div>
    </GoldShell>
  );
}
