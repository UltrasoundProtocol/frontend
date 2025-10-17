'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('tvl');
  const [actionTab, setActionTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [formData, setFormData] = useState({
    amount: undefined as number | undefined,
    asset: 'USDC',
  });

  // Full contract address
  const contractAddress = '0x7027DeB280C03AedE961f2c620BE72B3F684fBa';

  // Mock data
  const kpiItems = [
    {
      label: 'TVL',
      value: '$35,210,260.18',
      icon: <Image src="/icons/TVL_Icon.svg" alt="TVL" width={16} height={16} />,
    },
    {
      label: 'Protocol APY',
      value: '10.01%',
      trend: 'up' as const,
      hint: '+0.5%',
      icon: <Image src="/icons/APY_Icon.svg" alt="APY" width={16} height={16} />,
    },
    {
      label: 'Deviation',
      value: '+0.35%',
      trend: 'up' as const,
      icon: <Image src="/icons/Deviation_Icon.svg" alt="Deviation" width={16} height={16} />,
    },
    {
      label: 'Current Proportion',
      value: 'WBTC 65% / XAUT 35%',
      icon: <Image src="/icons/Proportion_Icon.svg" alt="Proportion" width={16} height={16} />,
    },
  ];

  const tokenPrices = [
    { symbol: 'WBTC', price: 68478.32, changePct: -0.12, iconSrc: '/icons/BTC_Icon.svg' },
    { symbol: 'XAUT', price: 2034.87, changePct: 0.23, iconSrc: '/icons/XAUT_Icon.svg' },
  ];

  const poolInfo = [
    { label: '24h Volume' as const, value: '$2,847,392.45' },
    { label: 'Pool TVL' as const, value: '$35,210,260.18' },
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

  const holdings = [
    { symbol: 'WBTC', qty: 0.1234, fiat: 8457.83 },
    { symbol: 'XAUT', qty: 2.1, fiat: 4273.23 },
    { symbol: 'LP Tokens', qty: 847.32, fiat: 847.32 },
  ];

  const recentTransactions = [
    { type: 'Deposit', date: 'Oct 10, 2024', amount: '+$5,000', asset: 'USDC' },
    { type: 'Deposit', date: 'Oct 5, 2024', amount: '+$1,000', asset: 'USDC' },
  ];

  const handleFormChange = (fields: { amount?: number; asset?: string }) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSelectPct = (pct: number) => {
    const balance = 5000;
    setFormData((prev) => ({
      ...prev,
      amount: (balance * pct) / 100,
    }));
  };

  const handleSubmit = () => {
    console.log('Submit:', actionTab, formData);
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
            totalBalance={12847.32}
            userApy={9.87}
            pnl={847.32}
            holdings={holdings}
            lpTokens={847.32}
          />

          {/* Deposit/Withdraw */}
          <ActionTabs value={actionTab} onChange={setActionTab}>
            <div className="mt-4">
              <ActionForm
                kind={actionTab}
                amount={formData.amount}
                asset={formData.asset}
                balance={5000}
                min={10}
                max={250000}
                receivePreview={
                  formData.amount
                    ? `${(formData.amount * 0.98).toFixed(2)} BTCGLD LP`
                    : undefined
                }
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
