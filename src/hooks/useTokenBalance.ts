import { useAccount, useReadContract } from 'wagmi';
import { ERC20ABI } from '@/src/lib/abis';
import { CONTRACTS, DECIMALS } from '@/src/lib/config';

export function useTokenBalance(tokenAddress: `0x${string}` | undefined) {
  const { address } = useAccount();

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  });

  return {
    balance: balance ? Number(balance) : 0,
    isLoading,
    error,
    refetch,
  };
}

export function useUSDCBalance() {
  const result = useTokenBalance(CONTRACTS.USDC);
  return {
    ...result,
    balanceFormatted: result.balance / Math.pow(10, DECIMALS.USDC),
  };
}

export function useWBTCBalance() {
  const result = useTokenBalance(CONTRACTS.WBTC);
  return {
    ...result,
    balanceFormatted: result.balance / Math.pow(10, DECIMALS.WBTC),
  };
}

export function usePAXGBalance() {
  const result = useTokenBalance(CONTRACTS.PAXG);
  return {
    ...result,
    balanceFormatted: result.balance / Math.pow(10, DECIMALS.PAXG),
  };
}
