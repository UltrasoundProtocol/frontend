import { useMemo } from 'react';
import { useUserData } from './useUserData';

export interface GainLossData {
  currentValue: number;
  totalDeposited: number;
  profit: number;
  profitPercentage: number;
  isProfit: boolean;
}

export function useGainLoss(userAddress: string | undefined) {
  const { userData, loading, error, refetch } = useUserData(userAddress);

  const gainLoss = useMemo((): GainLossData | null => {
    if (!userData) return null;

    const totalUnits = parseFloat(userData.totalUnits);
    const totalDeposited = parseFloat(userData.totalDeposited);
    const currentSV = parseFloat(userData.protocol.currentStrategyValue);

    // User_current_value = user.total_units × strategy_value_current
    const userCurrentValue = totalUnits * currentSV;

    // User_profit = User_current_value - User_total_deposited
    const profit = userCurrentValue - totalDeposited;

    // Profit percentage
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
  }, [userData]);

  return {
    gainLoss,
    loading,
    error,
    refetch,
  };
}
