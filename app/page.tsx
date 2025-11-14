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
import { shortAddr } from '@/src/features/goldbtc/utils/format';
import { transformDailySnapshotsToChartData, extractChartLabels } from '@/src/features/goldbtc/utils/chartData';
import type { MetricKey } from '@/src/features/goldbtc/types';
import {
  useCompleteProtocolData,
  useProtocolData,
  useRebalanceHistory,
} from '@/src/hooks';
import { CONTRACTS } from '@/src/lib/config';

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('tvl');

  // Fetch protocol data
  const { data: protocolData } = useCompleteProtocolData();

  // Also get raw protocol data for dailySnapshots
  const { protocolData: rawProtocolData } = useProtocolData();

  // Fetch rebalance history
  const { rebalanceEvents } = useRebalanceHistory(10);

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
          {protocolData.ratioDeviation.toFixed(2)}%
          <br />
          {/* Price Ratio: {protocolData.priceDeviation.toFixed(2)}% */}
        </>
      ) : (
        <>
          0.00%

        </>
      ),
      trend: protocolData && protocolData.ratioDeviation > 2 ? ('up' as const) : ('none' as const),
      icon: <Image src="/icons/Deviation_Icon.svg" alt="Deviation" width={16} height={16} />,
    },
    {
      label: 'Current Proportion',
      value: protocolData ? (
        <>
          <span className="flex items-center gap-2">
            <Image src="/icons/BTC_Icon.svg" alt="WBTC" width={30} height={30} className="rounded-full" />
            {protocolData.currentProportion.wbtc.toFixed(0)}% /
            <Image src="/icons/XAUT_Icon.svg" alt="PAXG" width={30} height={30} className="rounded-full" />
            {protocolData.currentProportion.paxg.toFixed(0)}%
          </span>
          <span className="block text-sm font-light text-muted-foreground mt-2">
            {protocolData.wbtcBalance.toFixed(4)} WBTC
          </span>
          <span className="block text-sm font-light text-muted-foreground mt-1">
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
    ? transformDailySnapshotsToChartData(
      rawProtocolData.dailySnapshots,
      selectedMetric,
      rawProtocolData.apy // Pass current APY for flat line comparison
    )
    : [];

  // Extract x-axis labels from snapshots
  const chartLabels = rawProtocolData?.dailySnapshots
    ? extractChartLabels(rawProtocolData.dailySnapshots)
    : [];

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
        {/* Left Column - Protocol Analytics */}
        <div className="space-y-6 lg:col-span-8 min-w-0">
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

        {/* Right Column - Token Prices & Pool Info */}
        <div className="space-y-6 lg:col-span-4 min-w-0">
          {/* Token Prices */}
          <TokenPriceList items={tokenPrices} className="min-w-0" />

          {/* Pool Info */}
          <PoolInfoList items={poolInfo} className="min-w-0" />
        </div>
      </div>
    </GoldShell>
  );
}
