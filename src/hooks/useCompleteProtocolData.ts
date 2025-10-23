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
  deviation: number;
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
    if (!protocolData || !pricesData) return null;

    // Parse balances (accounting for decimals)
    const wbtcBalance = parseFloat(protocolData.asset0Balance) / Math.pow(10, DECIMALS.WBTC);
    const paxgBalance = parseFloat(protocolData.asset1Balance) / Math.pow(10, DECIMALS.PAXG);

    // Calculate TVL in USD
    const wbtcValueUSD = wbtcBalance * pricesData.wbtc.price;
    const paxgValueUSD = paxgBalance * pricesData.paxg.price;
    const tvl = wbtcValueUSD + paxgValueUSD;

    // Calculate deviation from 50/50
    // Deviation = abs(wbtcValueUSD / tvl - 0.5) * 100
    const wbtcRatio = tvl > 0 ? wbtcValueUSD / tvl : 0.5;
    const deviation = Math.abs(wbtcRatio - 0.5) * 100;

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
      protocolAPY: protocolData.apy,
      deviation,
      currentProportion,

      // Raw data
      volume24h: protocolData.volume24h,
      totalDeposits: protocolData.totalDeposits,
      totalWithdrawals: protocolData.totalWithdrawals,
      totalRebalances: protocolData.totalRebalances,
      paused: protocolData.paused,

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
