import { useQuery, gql } from '@apollo/client';
import { useMemo } from 'react';

const USER_HOLDINGS_QUERY = gql`
  query GetUserHoldings($address: ID!) {
    user(id: $address) {
      lpBalance
      totalUnits
    }

    protocol(id: "protocol") {
      asset0Balance
      asset1Balance
      totalSupply
    }
  }
`;

export interface HoldingsData {
  lpBalance: number;
  sharePercentage: number;
  asset0Holdings: number;
  asset1Holdings: number;
}

export function useHoldings(userAddress: string | undefined) {
  const { data, loading, error, refetch } = useQuery(USER_HOLDINGS_QUERY, {
    variables: { address: userAddress?.toLowerCase() || '' },
    skip: !userAddress,
    pollInterval: 30000,
  });

  const holdings = useMemo((): HoldingsData | null => {
    if (!data?.user || !data?.protocol) return null;

    const lpBalance = parseFloat(data.user.lpBalance);
    const totalSupply = parseFloat(data.protocol.totalSupply);

    if (totalSupply === 0) return null;

    const sharePercentage = (lpBalance / totalSupply) * 100;

    const asset0Balance = parseFloat(data.protocol.asset0Balance);
    const asset1Balance = parseFloat(data.protocol.asset1Balance);

    // User's proportional holdings
    const userAsset0 = (asset0Balance * lpBalance) / totalSupply;
    const userAsset1 = (asset1Balance * lpBalance) / totalSupply;

    return {
      lpBalance,
      sharePercentage,
      asset0Holdings: userAsset0,
      asset1Holdings: userAsset1,
    };
  }, [data]);

  return {
    holdings,
    loading,
    error,
    refetch,
  };
}
