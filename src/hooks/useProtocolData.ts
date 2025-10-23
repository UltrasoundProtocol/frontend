import { useQuery, gql } from '@apollo/client';
import { useMemo } from 'react';

const PROTOCOL_QUERY = gql`
  query GetProtocolData {
    protocol(id: "protocol") {
      totalValueLocked
      asset0Balance
      asset1Balance
      currentStrategyValue
      previousStrategyValue
      strategyValueUpdatedAt
      totalDeposits
      totalWithdrawals
      totalRebalances
      volume24h
      daysLive
      paused
      targetRatio
      rebalanceThreshold
      totalSupply
    }

    dailySnapshots(first: 7, orderBy: date, orderDirection: desc) {
      date
      totalValueLocked
      depositVolume
      withdrawalVolume
    }
  }
`;

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
  }>;
}

export function useProtocolData() {
  const { data, loading, error, refetch } = useQuery(PROTOCOL_QUERY, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  const protocolData = useMemo((): ProtocolData | null => {
    if (!data?.protocol) return null;

    const protocol = data.protocol;

    // Calculate APY
    // APY = ((Current_SV / Previous_SV)^(365/Days_Live) - 1) × 100
    const currentSV = parseFloat(protocol.currentStrategyValue);
    const previousSV = parseFloat(protocol.previousStrategyValue);
    const daysLive = parseInt(protocol.daysLive);

    let apy = 0;
    if (previousSV > 0 && daysLive > 0) {
      const ratio = currentSV / previousSV;
      const exponent = 365 / daysLive;
      apy = (Math.pow(ratio, exponent) - 1) * 100;
    }

    return {
      tvl: protocol.totalValueLocked,
      asset0Balance: protocol.asset0Balance,
      asset1Balance: protocol.asset1Balance,
      apy,
      deviation: 0, // Will be calculated with prices from usePrices hook
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
    };
  }, [data]);

  return {
    protocolData,
    loading,
    error,
    refetch,
  };
}
