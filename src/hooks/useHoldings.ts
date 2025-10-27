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

    // LP tokens have 6 decimals (vault mints them 1:1 with USDC), stored as raw BigInt values in subgraph
    const lpBalanceRaw = parseFloat(userData.lpBalance);
    const totalSupplyRaw = parseFloat(userData.protocol.totalSupply);

    if (totalSupplyRaw === 0) return null;

    const sharePercentage = (lpBalanceRaw / totalSupplyRaw) * 100;

    // Asset balances are stored in their native decimals in subgraph
    // WBTC: 8 decimals, PAXG: 18 decimals
    const asset0BalanceRaw = parseFloat(userData.protocol.asset0Balance);
    const asset1BalanceRaw = parseFloat(userData.protocol.asset1Balance);

    // Calculate user's proportional holdings (still in raw units)
    const userAsset0Raw = (asset0BalanceRaw * lpBalanceRaw) / totalSupplyRaw;
    const userAsset1Raw = (asset1BalanceRaw * lpBalanceRaw) / totalSupplyRaw;

    // Convert from raw token amounts to human-readable amounts
    // WBTC: 8 decimals
    const userAsset0 = userAsset0Raw / 1e8;
    // PAXG: 18 decimals
    const userAsset1 = userAsset1Raw / 1e18;

    // Convert LP balance to human-readable format (6 decimals)
    const lpBalance = lpBalanceRaw / 1e6;

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
