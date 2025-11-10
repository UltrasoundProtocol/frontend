import { useMemo } from 'react';
import { useUserData } from './useUserData';
import { useCompleteProtocolData } from './useCompleteProtocolData';

export interface GainLossData {
  currentValue: number;
  totalDeposited: number;
  profit: number;
  profitPercentage: number;
  isProfit: boolean;
}

export function useGainLoss(userAddress: string | undefined) {
  const { userData, loading: userLoading, error: userError, refetch } = useUserData(userAddress);
  const { data: protocolData, loading: protocolLoading } = useCompleteProtocolData();

  const gainLoss = useMemo((): GainLossData | null => {
    if (!userData || !protocolData) return null;

    // Normalize values from subgraph
    // NOTE: userData.protocol.currentStrategyValue is WRONG (it equals totalSupply × 10^12)
    // Instead, use the correctly calculated TVL from protocolData (which uses asset prices)
    //
    // totalSupply: BigInt (6 decimals) - Total LP tokens in circulation
    // lpBalance: BigInt (6 decimals) - LP tokens owned by user
    // totalDeposited: BigDecimal (18 decimals) - USD deposited by user
    const vaultTVL = protocolData.tvl; // Already normalized and correctly calculated
    const totalSupply = parseFloat(userData.protocol.totalSupply) / 1e6;
    const lpBalance = parseFloat(userData.lpBalance) / 1e6;
    const totalDeposited = parseFloat(userData.totalDeposited) / 1e18;

    if (lpBalance === 0 || totalSupply === 0) return null;

    // Calculate current value per LP token
    const valuePerToken = vaultTVL / totalSupply;

    // Calculate user's current value: LP tokens × current value per token
    const userCurrentValue = lpBalance * valuePerToken;

    // Calculate gain/loss
    // Initial value = totalDeposited (what they put in)
    // Current value = userCurrentValue (what their LP tokens are worth now)
    // Profit = Current - Initial
    const profit = userCurrentValue - totalDeposited;

    // Profit percentage relative to initial investment
    const profitPercentage = totalDeposited > 0
      ? (profit / totalDeposited) * 100
      : 0;

    return {
      currentValue: userCurrentValue,
      totalDeposited,
      profit,
      profitPercentage,
      isProfit: profit >= 0,
    };
  }, [userData, protocolData]);

  return {
    gainLoss,
    loading: userLoading || protocolLoading,
    error: userError,
    refetch,
  };
}
