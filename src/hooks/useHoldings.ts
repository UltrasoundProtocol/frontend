import { useMemo } from 'react';
import { useUserData } from './useUserData';

export interface HoldingsData {
  lpBalance: number;
  sharePercentage: number;
  asset0Holdings: number;
  asset1Holdings: number;
}

export function useHoldings(userAddress: string | undefined) {
  const { userData, loading, error, refetch } = useUserData(userAddress);

  const holdings = useMemo((): HoldingsData | null => {
    if (!userData) return null;

    const lpBalance = parseFloat(userData.lpBalance);
    const totalSupply = parseFloat(userData.protocol.totalSupply);

    if (totalSupply === 0) return null;

    const sharePercentage = (lpBalance / totalSupply) * 100;

    const asset0Balance = parseFloat(userData.protocol.asset0Balance);
    const asset1Balance = parseFloat(userData.protocol.asset1Balance);

    // User's proportional holdings
    const userAsset0 = (asset0Balance * lpBalance) / totalSupply;
    const userAsset1 = (asset1Balance * lpBalance) / totalSupply;

    return {
      lpBalance,
      sharePercentage,
      asset0Holdings: userAsset0,
      asset1Holdings: userAsset1,
    };
  }, [userData]);

  return {
    holdings,
    loading,
    error,
    refetch,
  };
}
