import { useQuery, gql } from '@apollo/client';
import { useMemo } from 'react';

const USER_APY_QUERY = gql`
  query GetUserAPY($address: ID!) {
    user(id: $address) {
      totalUnits
      totalDeposited
      totalWithdrawn
      firstDepositAt
      deposits {
        timestamp
        stablecoinAmount
        sharesIssued
      }
      withdrawals {
        timestamp
        shares
      }
    }

    protocol(id: "protocol") {
      currentStrategyValue
    }
  }
`;

export interface UserAPYData {
  apy: number;
  currentValue: number;
  totalDeposited: number;
  daysSinceFirstDeposit: number;
}

export function useUserAPY(userAddress: string | undefined) {
  const { data, loading, error, refetch } = useQuery(USER_APY_QUERY, {
    variables: { address: userAddress?.toLowerCase() || '' },
    skip: !userAddress,
    pollInterval: 30000,
  });

  const userAPY = useMemo((): UserAPYData | null => {
    if (!data?.user || !data?.protocol) return null;

    const user = data.user;
    const currentSV = parseFloat(data.protocol.currentStrategyValue);
    const totalUnits = parseFloat(user.totalUnits);
    const totalDeposited = parseFloat(user.totalDeposited);

    if (totalUnits === 0 || totalDeposited === 0) return null;

    // User_current_value = user.total_units × strategy_value_current
    const userCurrentValue = totalUnits * currentSV;

    // Weighted_avg_entry = User_total_deposited / user.total_units
    const weightedAvgEntry = totalDeposited / totalUnits;

    // Days since first deposit
    const firstDepositTimestamp = parseInt(user.firstDepositAt);
    const daysSinceFirstDeposit =
      (Date.now() / 1000 - firstDepositTimestamp) / 86400;

    if (daysSinceFirstDeposit === 0 || weightedAvgEntry === 0) return null;

    // User_APY = ((strategy_value_current / Weighted_avg_entry)^(365/days) - 1) × 100
    const ratio = currentSV / weightedAvgEntry;
    const exponent = 365 / daysSinceFirstDeposit;
    const apy = (Math.pow(ratio, exponent) - 1) * 100;

    return {
      apy,
      currentValue: userCurrentValue,
      totalDeposited,
      daysSinceFirstDeposit,
    };
  }, [data]);

  return {
    userAPY,
    loading,
    error,
    refetch,
  };
}
