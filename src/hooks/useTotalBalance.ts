import { useUserData } from './useUserData';

export function useTotalBalance(userAddress: string | undefined) {
  const { userData, loading, error, refetch } = useUserData(userAddress);

  // NOTE: LP tokens technically have 18 decimals on-chain, but due to a bug in VaultMath.calculateInitialShares(),
  // they are minted as if they have 6 decimals. We display them with 6 decimals to match actual behavior.
  const lpBalanceFormatted = userData?.lpBalance
    ? (parseFloat(userData.lpBalance) / 1e6).toFixed(6)
    : '0';

  return {
    lpBalance: lpBalanceFormatted,
    totalUnits: userData?.totalUnits || '0',
    loading,
    error,
    refetch,
  };
}
