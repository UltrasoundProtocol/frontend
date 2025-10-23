import { useQuery, gql } from '@apollo/client';

const USER_BALANCE_QUERY = gql`
  query GetUserBalance($address: ID!) {
    user(id: $address) {
      lpBalance
      totalUnits
    }
  }
`;

export function useTotalBalance(userAddress: string | undefined) {
  const { data, loading, error, refetch } = useQuery(USER_BALANCE_QUERY, {
    variables: { address: userAddress?.toLowerCase() || '' },
    skip: !userAddress,
    pollInterval: 30000,
  });

  return {
    lpBalance: data?.user?.lpBalance || '0',
    totalUnits: data?.user?.totalUnits || '0',
    loading,
    error,
    refetch,
  };
}
