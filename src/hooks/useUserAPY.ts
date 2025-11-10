import { useMemo } from 'react';
import { useUserData } from './useUserData';
import { useCompleteProtocolData } from './useCompleteProtocolData';

export interface UserAPYData {
  apy: number;
  currentValue: number;
  totalDeposited: number;
  daysSinceFirstDeposit: number;
}

export function useUserAPY(userAddress: string | undefined) {
  const { userData, loading: userLoading, error, refetch } = useUserData(userAddress);
  const { data: protocolData, loading: protocolLoading } = useCompleteProtocolData();

  const userAPY = useMemo((): UserAPYData | null => {
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

    if (lpBalance === 0 || totalDeposited === 0 || totalSupply === 0) return null;

    // Calculate current value per LP token
    const valuePerToken = vaultTVL / totalSupply;

    // Calculate user's current value: LP tokens × current value per token
    const userCurrentValue = lpBalance * valuePerToken;

    // Calculate weighted average entry value per LP token
    // This is the average USD value per LP token at the time of deposits
    const weightedAvgEntry = totalDeposited / lpBalance;

    // Days since first deposit
    const firstDepositTimestamp = parseInt(userData.firstDepositAt);
    const daysSinceFirstDeposit =
      (Date.now() / 1000 - firstDepositTimestamp) / 86400;

    // Require at least 1 day of data to calculate meaningful APY
    // (otherwise the exponent becomes too large and causes overflow)
    if (daysSinceFirstDeposit < 1 || weightedAvgEntry === 0) return null;

    // User APY formula:
    // APY = [(1 + (V_LP,end - V_LP,start) / V_LP,start)^(365/days) - 1] × 100
    // Simplified: APY = [(V_LP,end / V_LP,start)^(365/days) - 1] × 100
    const ratio = valuePerToken / weightedAvgEntry;
    const exponent = 365 / daysSinceFirstDeposit;
    const apy = (Math.pow(ratio, exponent) - 1) * 100;

    return {
      apy,
      currentValue: userCurrentValue,
      totalDeposited,
      daysSinceFirstDeposit,
    };
  }, [userData, protocolData]);

  return {
    userAPY,
    loading: userLoading || protocolLoading,
    error,
    refetch,
  };
}
