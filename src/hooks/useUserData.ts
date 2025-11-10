import { useEffect, useState } from 'react';

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

export interface UserData {
  lpBalance: string;
  totalUnits: string;
  totalDeposited: string;
  totalWithdrawn: string;
  firstDepositAt: string;
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  protocol: {
    currentStrategyValue: string;
    asset0Balance: string;
    asset1Balance: string;
    totalSupply: string;
  };
}

export function useUserData(userAddress: string | undefined) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (address: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${address}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.user || !data.protocol) {
        setUserData(null);
        return;
      }

      setUserData({
        lpBalance: data.user.lpBalance || '0',
        totalUnits: data.user.totalUnits || '0',
        totalDeposited: data.user.totalDeposited || '0',
        totalWithdrawn: data.user.totalWithdrawn || '0',
        firstDepositAt: data.user.firstDepositAt || '0',
        deposits: data.user.deposits || [],
        withdrawals: data.user.withdrawals || [],
        protocol: {
          currentStrategyValue: data.protocol.currentStrategyValue,
          asset0Balance: data.protocol.asset0Balance,
          asset1Balance: data.protocol.asset1Balance,
          totalSupply: data.protocol.totalSupply,
        },
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userAddress) {
      setUserData(null);
      setLoading(false);
      return;
    }

    fetchData(userAddress);

    // Poll every 30 seconds
    const interval = setInterval(() => fetchData(userAddress), 30000);

    return () => clearInterval(interval);
  }, [userAddress]);

  return {
    userData,
    loading,
    error,
    refetch: userAddress ? () => fetchData(userAddress) : undefined,
  };
}
