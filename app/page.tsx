'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { GoldShell } from '@/src/features/goldbtc/components/layout/gold-shell';
import { GoldHeader } from '@/src/features/goldbtc/components/layout/gold-header';
import { GoldFooter } from '@/src/features/goldbtc/components/layout/gold-footer';
import { KpiGrid } from '@/src/features/goldbtc/components/kpi/kpi-grid';
import { TokenPriceList } from '@/src/features/goldbtc/components/token-pool/token-price-list';
import { PoolInfoList } from '@/src/features/goldbtc/components/token-pool/pool-info-list';
import { MetricToggle } from '@/src/features/goldbtc/components/chart/metric-toggle';
import { PerformanceChart } from '@/src/features/goldbtc/components/chart/performance-chart';
import { RebalanceTable } from '@/src/features/goldbtc/components/rebalance/rebalance-table';
import { PositionCard } from '@/src/features/goldbtc/components/position/position-card';
import { ActionTabs } from '@/src/features/goldbtc/components/action/action-tabs';
import { ActionForm } from '@/src/features/goldbtc/components/action/action-form';
import { RecentTxList } from '@/src/features/goldbtc/components/transactions/recent-tx-list';
import { shortAddr, fromUSDC, fromBigDecimal } from '@/src/features/goldbtc/utils/format';
import { transformDailySnapshotsToChartData, extractChartLabels } from '@/src/features/goldbtc/utils/chartData';
import type { MetricKey } from '@/src/features/goldbtc/types';
import {
  useCompleteProtocolData,
  useProtocolData,
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
  useRebalanceHistory,
} from '@/src/hooks';
import { CONTRACTS } from '@/src/lib/config';

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('tvl');
  const [actionTab, setActionTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [formData, setFormData] = useState({
    amount: undefined as number | undefined,
    asset: 'USDC',
  });
  const [needsApproval, setNeedsApproval] = useState(true);

  // Get connected wallet address
  const { address: userAddress } = useAccount();

  // Fetch protocol data
  const { data: protocolData, loading: protocolLoading } = useCompleteProtocolData();

  // Also get raw protocol data for dailySnapshots
  const { protocolData: rawProtocolData } = useProtocolData();

  // Fetch user-specific data (only if wallet is connected)
  const { lpBalance, refetch: refetchBalance } = useTotalBalance(userAddress);
  const { userAPY, refetch: refetchAPY } = useUserAPY(userAddress);
  const { gainLoss, refetch: refetchGainLoss } = useGainLoss(userAddress);
  const { holdings: userHoldings, refetch: refetchHoldings } = useHoldings(userAddress);
  const { deposits, withdrawals, refetch: refetchHistory } = useHistory(userAddress);

  // Fetch rebalance history
  const { rebalanceEvents } = useRebalanceHistory(10);

  // Fetch token balances for deposit/withdraw
  const { balanceFormatted: usdcBalance, refetch: refetchUSDC } = useUSDCBalance();
  const { balanceFormatted: wbtcBalance, refetch: refetchWBTC } = useWBTCBalance();
  const { balanceFormatted: paxgBalance, refetch: refetchPAXG } = usePAXGBalance();

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
      setFormData({ amount: undefined, asset: 'USDC' }); // Clear form
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
      setFormData({ amount: undefined, asset: 'USDC' }); // Clear form
      // Refresh all data after 3 seconds (allow time for subgraph to index)
      setTimeout(() => {
        refetchAllData();
      }, 3000);
    }
  }, [isWithdrawConfirmed]);

  // Full contract address
  const contractAddress = CONTRACTS.VAULT;

  // Prepare KPI data
  const kpiItems = [
    {
      label: 'TVL',
      value: protocolData?.tvlFormatted || '$0.00',
      icon: <Image src="/icons/TVL_Icon.svg" alt="TVL" width={16} height={16} />,
    },
    {
      label: 'Protocol APY',
      value: protocolData ? `${protocolData.protocolAPY.toFixed(2)}%` : '0.00%',
      trend: protocolData && protocolData.protocolAPY > 0 ? ('up' as const) : ('none' as const),
      icon: <Image src="/icons/APY_Icon.svg" alt="APY" width={16} height={16} />,
    },
    {
      label: 'Deviation',
      value: protocolData ? (
        <>
          Vault Ratio: {protocolData.ratioDeviation.toFixed(2)}%
          <br />
          Price Ratio: {protocolData.priceDeviation.toFixed(2)}%
        </>
      ) : (
        <>
          Ratio: 0.00%
          <br />
          Price: 0.00%
        </>
      ),
      trend: protocolData && protocolData.ratioDeviation > 2 ? ('up' as const) : ('none' as const),
      icon: <Image src="/icons/Deviation_Icon.svg" alt="Deviation" width={16} height={16} />,
    },
    {
      label: 'Current Proportion',
      value: protocolData ? (
        <>
          <span className="block">WBTC {protocolData.currentProportion.wbtc.toFixed(0)}% / PAXG {protocolData.currentProportion.paxg.toFixed(0)}%</span>
          <span className="block text-sm font-light text-muted-foreground mt-1">
            {protocolData.wbtcBalance.toFixed(4)} WBTC
            <br />
            {protocolData.paxgBalance.toFixed(4)} PAXG
          </span>
        </>
      ) : (
        'WBTC 50% / PAXG 50%'
      ),
      icon: <Image src="/icons/Proportion_Icon.svg" alt="Proportion" width={16} height={16} />,
    },
  ];

  const tokenPrices = protocolData
    ? [
      {
        symbol: 'WBTC',
        price: protocolData.wbtcPrice,
        changePct: protocolData.wbtcPriceChange,
        iconSrc: '/icons/BTC_Icon.svg',
      },
      {
        symbol: 'PAXG',
        price: protocolData.paxgPrice,
        changePct: protocolData.paxgPriceChange,
        iconSrc: '/icons/XAUT_Icon.svg',
      },
    ]
    : [
      // Placeholder data while loading
      {
        symbol: 'WBTC',
        price: 0,
        changePct: 0,
        iconSrc: '/icons/BTC_Icon.svg',
      },
      {
        symbol: 'PAXG',
        price: 0,
        changePct: 0,
        iconSrc: '/icons/XAUT_Icon.svg',
      },
    ];

  const poolInfo = [
    {
      label: '24h Volume' as const,
      value: protocolData
        ? `$${parseFloat(protocolData.volume24h || '0').toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
        : '$0.00',
    },
    {
      label: 'Pool TVL' as const,
      value: protocolData?.tvlFormatted || '$0.00',
    },
    {
      label: 'Contract Address' as const,
      value: shortAddr(contractAddress),
      isCopyable: true,
      onCopy: () => {
        navigator.clipboard.writeText(contractAddress);
        toast.success('Contract address copied to clipboard!');
      },
      href: `https://etherscan.io/address/${contractAddress}`,
    },
  ];

  // Transform daily snapshots into chart data based on selected metric
  const chartSeries = rawProtocolData?.dailySnapshots
    ? transformDailySnapshotsToChartData(rawProtocolData.dailySnapshots, selectedMetric)
    : [];

  // Extract x-axis labels from snapshots
  const chartLabels = rawProtocolData?.dailySnapshots
    ? extractChartLabels(rawProtocolData.dailySnapshots)
    : [];

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

  const handleFormChange = (fields: { amount?: number; asset?: string }) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    if (fields.asset) {
      setNeedsApproval(true);
    }
  };

  const getAssetBalance = () => {
    switch (formData.asset) {
      case 'USDC':
        return usdcBalance;
      case 'WBTC':
        return wbtcBalance;
      case 'XAUT':
        return paxgBalance;
      default:
        return 0;
    }
  };

  const handleSelectPct = (pct: number) => {
    const balance = actionTab === 'deposit' ? getAssetBalance() : parseFloat(lpBalance) || 0;
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
        if (formData.asset === 'USDC') {
          if (needsApproval) {
            await depositUSDC(formData.amount);
          } else {
            await executeDeposit(formData.amount);
          }
          // Data will auto-refresh via useEffect when isDepositConfirmed becomes true
        } else {
          toast.error('Only USDC deposits are supported currently');
        }
      } else {
        // Withdraw
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
      {/* KPI Section */}
      <KpiGrid items={kpiItems} className="mb-6" />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* Token & Pool Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <TokenPriceList items={tokenPrices} />
            <PoolInfoList items={poolInfo} />
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <MetricToggle
              value={selectedMetric}
              onChange={setSelectedMetric}
            />
            <PerformanceChart
              metric={selectedMetric}
              series={chartSeries}
              xLabels={chartLabels}
              yLabel=""
            />
          </div>

          {/* Rebalance History */}
          <RebalanceTable rows={rebalanceEvents} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          {/* Position */}
          <PositionCard
            totalBalance={gainLoss?.currentValue || 0}
            userApy={userAPY?.apy || 0}
            pnl={gainLoss?.profit || 0}
            holdings={holdings}
            lpTokens={parseFloat(lpBalance) || 0}
          />

          {/* Deposit/Withdraw */}
          <ActionTabs value={actionTab} onChange={setActionTab}>
            <div className="mt-4">
              <ActionForm
                kind={actionTab}
                amount={formData.amount}
                asset={formData.asset}
                balance={actionTab === 'deposit' ? getAssetBalance() : parseFloat(lpBalance) || 0}
                min={actionTab === 'deposit' ? 10 : 0.01}
                max={actionTab === 'deposit' ? getAssetBalance() : parseFloat(lpBalance) || 0}
                receivePreview={
                  formData.amount
                    ? actionTab === 'deposit'
                      ? `~${(formData.amount * 0.98).toFixed(4)} BV-LP`
                      : `~${(formData.amount * 0.98).toFixed(4)} USDC value`
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
      </div>
    </GoldShell>
  );
}
