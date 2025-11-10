import { useMemo } from 'react';
import { useProtocolData } from './useProtocolData';
import { usePrices } from './usePrices';
import { DECIMALS } from '@/src/lib/config';

export interface CompleteProtocolData {
  // Price data
  wbtcPrice: number;
  paxgPrice: number;
  wbtcPriceChange: number;
  paxgPriceChange: number;

  // Protocol balances
  wbtcBalance: number;
  paxgBalance: number;

  // Computed metrics
  tvl: number;
  tvlFormatted: string;
  protocolAPY: number;
  ratioDeviation: number; // Deviation from 50/50 target
  priceDeviation: number; // Max price change between assets
  currentProportion: {
    wbtc: number;
    paxg: number;
  };

  // Raw data
  volume24h: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRebalances: number;
  paused: boolean;

  // Loading states
  loading: boolean;
  error: any;
}

export function useCompleteProtocolData() {
  const { protocolData, loading: protocolLoading, error: protocolError } = useProtocolData();
  const { pricesData, loading: pricesLoading, error: pricesError } = usePrices();

  const completeData = useMemo((): CompleteProtocolData | null => {
    // Allow showing prices even if protocol data isn't loaded yet
    if (!pricesData) return null;

    // Parse balances (accounting for decimals) - default to 0 if protocol data not loaded
    const wbtcBalance = protocolData ? parseFloat(protocolData.asset0Balance) / Math.pow(10, DECIMALS.WBTC) : 0;
    const paxgBalance = protocolData ? parseFloat(protocolData.asset1Balance) / Math.pow(10, DECIMALS.PAXG) : 0;

    // Calculate TVL in USD
    const wbtcValueUSD = wbtcBalance * pricesData.wbtc.price;
    const paxgValueUSD = paxgBalance * pricesData.paxg.price;
    const tvl = wbtcValueUSD + paxgValueUSD;

    // Calculate ratio deviation from 50/50
    // Ratio Deviation = abs(wbtcValueUSD / tvl - 0.5) * 100
    const wbtcRatio = tvl > 0 ? wbtcValueUSD / tvl : 0.5;
    const ratioDeviation = Math.abs(wbtcRatio - 0.5) * 100;

    // Calculate price deviation (max 24h price change between the two assets)
    const priceDeviation = Math.max(
      Math.abs(pricesData.wbtc.changePct),
      Math.abs(pricesData.paxg.changePct)
    );

    // Calculate current proportion
    const currentProportion = {
      wbtc: tvl > 0 ? (wbtcValueUSD / tvl) * 100 : 50,
      paxg: tvl > 0 ? (paxgValueUSD / tvl) * 100 : 50,
    };

    // Format TVL
    const tvlFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(tvl);

    return {
      // Price data
      wbtcPrice: pricesData.wbtc.price,
      paxgPrice: pricesData.paxg.price,
      wbtcPriceChange: pricesData.wbtc.changePct,
      paxgPriceChange: pricesData.paxg.changePct,

      // Protocol balances
      wbtcBalance,
      paxgBalance,

      // Computed metrics
      tvl,
      tvlFormatted,
      protocolAPY: protocolData?.apy || 0,
      ratioDeviation,
      priceDeviation,
      currentProportion,

      // Raw data
      volume24h: protocolData?.volume24h || '0',
      totalDeposits: protocolData?.totalDeposits || 0,
      totalWithdrawals: protocolData?.totalWithdrawals || 0,
      totalRebalances: protocolData?.totalRebalances || 0,
      paused: protocolData?.paused || false,

      // Loading states
      loading: false,
      error: null,
    };
  }, [protocolData, pricesData]);

  return {
    data: completeData,
    loading: protocolLoading || pricesLoading,
    error: protocolError || pricesError,
  };
}
