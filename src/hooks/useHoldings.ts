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

    // NOTE: LP tokens technically have 18 decimals on-chain, but due to a bug in VaultMath.calculateInitialShares(),
    // they are minted as if they have 6 decimals (1:1 with USDC amount, not scaled up by 10^12).
    // We display them with 6 decimals to match actual behavior.
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

    // Convert LP balance to display format (treating as 6 decimals to match actual minting behavior)
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
