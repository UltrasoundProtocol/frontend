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

    // Convert from subgraph formats to human-readable numbers
    // totalUnits: LP tokens with 6 decimals
    const totalUnits = parseFloat(userData.totalUnits) / 1e6;

    // totalDeposited: USD value with 18 decimals (BigDecimal)
    const totalDeposited = parseFloat(userData.totalDeposited) / 1e18;

    // Calculate vault total value from protocol data
    // The protocol data already has TVL calculated from asset balances and prices
    const vaultTotalValue = protocolData.tvl;

    // totalSupply: LP tokens with 6 decimals
    const totalSupply = parseFloat(userData.protocol.totalSupply) / 1e6;

    // Calculate current value per LP token
    const valuePerToken = totalSupply > 0 ? vaultTotalValue / totalSupply : 0;

    // User_current_value = user.total_units × value_per_token
    const userCurrentValue = totalUnits * valuePerToken;

    // Protocol gain/loss: Compare current LP token value to initial value (1:1 with deposits)
    // When user deposits $X, they get $X worth of LP tokens (assuming no prior gains)
    // If LP tokens are now worth more/less, that's the protocol gain/loss
    //
    // Initial LP value = totalDeposited (what they put in)
    // Current LP value = userCurrentValue (what their LP tokens are worth now)
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
