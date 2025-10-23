import { useUserData } from './useUserData';

export function useTotalBalance(userAddress: string | undefined) {
  const { userData, loading, error, refetch } = useUserData(userAddress);

  return {
    lpBalance: userData?.lpBalance || '0',
    totalUnits: userData?.totalUnits || '0',
    loading,
    error,
    refetch,
  };
}
