import { useQuery, gql } from '@apollo/client';
import { useMemo } from 'react';

const USER_GAINLOSS_QUERY = gql`
  query GetUserGainLoss($address: ID!) {
    user(id: $address) {
      totalUnits
      totalDeposited
      totalWithdrawn
    }

    protocol(id: "protocol") {
      currentStrategyValue
    }
  }
`;

export interface GainLossData {
  currentValue: number;
  totalDeposited: number;
  profit: number;
  profitPercentage: number;
  isProfit: boolean;
}

export function useGainLoss(userAddress: string | undefined) {
  const { data, loading, error, refetch } = useQuery(USER_GAINLOSS_QUERY, {
    variables: { address: userAddress?.toLowerCase() || '' },
    skip: !userAddress,
    pollInterval: 30000,
  });

  const gainLoss = useMemo((): GainLossData | null => {
    if (!data?.user || !data?.protocol) return null;

    const totalUnits = parseFloat(data.user.totalUnits);
    const totalDeposited = parseFloat(data.user.totalDeposited);
    const currentSV = parseFloat(data.protocol.currentStrategyValue);

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
  }, [data]);

  return {
    gainLoss,
    loading,
    error,
    refetch,
  };
}
