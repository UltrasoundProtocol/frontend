import { useUserData } from './useUserData';

export function useTotalBalance(userAddress: string | undefined) {
  const { userData, loading, error, refetch } = useUserData(userAddress);

  // Convert LP balance from 6 decimals to human-readable format
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
