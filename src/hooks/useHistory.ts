import { useUserData } from './useUserData';

export interface Deposit {
  id: string;
  timestamp: string;
  stablecoinAmount: string;
  sharesIssued: string;
  transactionHash: string;
  valueUSD: string;
}

export interface Withdrawal {
  id: string;
  timestamp: string;
  shares: string;
  asset0Amount: string;
  asset1Amount: string;
  transactionHash: string;
  valueUSD: string;
}

export function useHistory(userAddress: string | undefined) {
  const { userData, loading, error, refetch } = useUserData(userAddress);

  return {
    deposits: (userData?.deposits || []) as Deposit[],
    withdrawals: (userData?.withdrawals || []) as Withdrawal[],
    loading,
    error,
    refetch,
  };
}
