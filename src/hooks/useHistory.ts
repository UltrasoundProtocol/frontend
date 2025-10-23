import { useQuery, gql } from '@apollo/client';

const USER_HISTORY_QUERY = gql`
  query GetUserHistory($address: ID!) {
    user(id: $address) {
      deposits(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        stablecoinAmount
        sharesIssued
        transactionHash
        valueUSD
      }
      withdrawals(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        shares
        asset0Amount
        asset1Amount
        transactionHash
        valueUSD
      }
    }
  }
`;

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
  const { data, loading, error, refetch } = useQuery(USER_HISTORY_QUERY, {
    variables: { address: userAddress?.toLowerCase() || '' },
    skip: !userAddress,
  });

  return {
    deposits: (data?.user?.deposits || []) as Deposit[],
    withdrawals: (data?.user?.withdrawals || []) as Withdrawal[],
    loading,
    error,
    refetch,
  };
}
