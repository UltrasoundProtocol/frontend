'use client';

import { useState } from 'react';
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
import { shortAddr } from '@/src/features/goldbtc/utils/format';
import type { MetricKey } from '@/src/features/goldbtc/types';
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

  // Fetch user-specific data (only if wallet is connected)
  const { lpBalance } = useTotalBalance(userAddress);
  const { userAPY } = useUserAPY(userAddress);
  const { gainLoss } = useGainLoss(userAddress);
  const { holdings: userHoldings } = useHoldings(userAddress);
  const { deposits, withdrawals } = useHistory(userAddress);

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
  } = useVaultDeposit();

  const {
    withdrawFromVault,
    isWithdrawPending,
    isWithdrawConfirming,
  } = useVaultWithdraw();

  // Handle approval confirmation
  if (isApproveConfirmed && needsApproval && formData.amount) {
    setNeedsApproval(false);
    executeDeposit(formData.amount);
  }

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
      value: protocolData ? `${protocolData.deviation > 0 ? '+' : ''}${protocolData.deviation.toFixed(2)}%` : '0.00%',
      trend: protocolData && protocolData.deviation > 0 ? ('up' as const) : ('none' as const),
      icon: <Image src="/icons/Deviation_Icon.svg" alt="Deviation" width={16} height={16} />,
    },
    {
      label: 'Current Proportion',
      value: protocolData
        ? `WBTC ${protocolData.currentProportion.wbtc.toFixed(0)}% / PAXG ${protocolData.currentProportion.paxg.toFixed(0)}%`
        : 'WBTC 50% / PAXG 50%',
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
    : [];

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

  const chartSeries = [
    {
      id: 'tvl',
      label: 'TVL',
      points: [
        { x: 'Apr', y: 18 },
        { x: 'May', y: 22 },
        { x: 'Jun', y: 28 },
        { x: 'Jul', y: 30 },
        { x: 'Aug', y: 29 },
        { x: 'Sep', y: 33 },
        { x: 'Oct', y: 35 },
      ],
    },
  ];

  const rebalanceHistory = [
    {
      date: 'Oct 15, 2024',
      action: 'Rebalance',
      route: 'WBTC → XAUT',
      amount: '1.2 WBTC',
    },
    {
      date: 'Oct 12, 2024',
      action: 'Rebalance',
      route: 'XAUT → WBTC',
      amount: '43.3 XAUT',
    },
    {
      date: 'Oct 8, 2024',
      action: 'Rebalance',
      route: 'WBTC → XAUT',
      amount: '0.8 WBTC',
    },
  ];

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
      amount: `+$${parseFloat(deposit.stablecoinAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      asset: 'USDC',
    })),
    ...withdrawals.slice(0, 5).map((withdrawal) => ({
      type: 'Withdrawal',
      date: new Date(parseInt(withdrawal.timestamp) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount: `-$${parseFloat(withdrawal.valueUSD || '0').toLocaleString('en-US', {
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
          // Refresh balances after deposit
          setTimeout(() => {
            refetchUSDC();
          }, 2000);
        } else {
          toast.error('Only USDC deposits are supported currently');
        }
      } else {
        // Withdraw
        await withdrawFromVault(formData.amount);
        // Refresh balances after withdrawal
        setTimeout(() => {
          refetchUSDC();
          refetchWBTC();
          refetchPAXG();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <GoldShell
      header={
        <GoldHeader
          brand={{ name: 'ULTRASOUND', href: '/' }}
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
              xLabels={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
              yLabel=""
            />
          </div>

          {/* Rebalance History */}
          <RebalanceTable rows={rebalanceHistory} />
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
                min={actionTab === 'deposit' ? 1 : 0.01}
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
