import { useEffect, useState } from 'react';

export interface ProtocolData {
  tvl: string;
  asset0Balance: string;
  asset1Balance: string;
  apy: number;
  deviation: number;
  volume24h: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRebalances: number;
  paused: boolean;
  targetRatio: number;
  rebalanceThreshold: number;
  totalSupply: string;
  daysLive: number;
  dailySnapshots: Array<{
    date: string;
    totalValueLocked: string;
    depositVolume: string;
    withdrawalVolume: string;
    strategyValue: string;
    asset0Balance: string;
    asset1Balance: string;
    asset0Price: string;
    asset1Price: string;
    currentRatio0: string;
    currentRatio1: string;
  }>;
}

export function useProtocolData() {
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/protocol');

      if (!response.ok) {
        throw new Error('Failed to fetch protocol data');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const protocol = data.protocol;

      if (!protocol) {
        setProtocolData(null);
        return;
      }

      // Calculate APY
      const currentSV = parseFloat(protocol.currentStrategyValue);
      const previousSV = parseFloat(protocol.previousStrategyValue);
      const daysLive = parseInt(protocol.daysLive);

      let apy = 0;
      if (previousSV > 0 && daysLive > 0) {
        const ratio = currentSV / previousSV;
        const exponent = 365 / daysLive;
        apy = (Math.pow(ratio, exponent) - 1) * 100;
      }

      setProtocolData({
        tvl: protocol.totalValueLocked,
        asset0Balance: protocol.asset0Balance,
        asset1Balance: protocol.asset1Balance,
        apy,
        deviation: 0, // Will be calculated with prices
        volume24h: protocol.volume24h,
        totalDeposits: parseInt(protocol.totalDeposits),
        totalWithdrawals: parseInt(protocol.totalWithdrawals),
        totalRebalances: parseInt(protocol.totalRebalances),
        paused: protocol.paused,
        targetRatio: parseInt(protocol.targetRatio),
        rebalanceThreshold: parseInt(protocol.rebalanceThreshold),
        totalSupply: protocol.totalSupply,
        daysLive,
        dailySnapshots: data.dailySnapshots || [],
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setProtocolData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    protocolData,
    loading,
    error,
    refetch: fetchData,
  };
}
