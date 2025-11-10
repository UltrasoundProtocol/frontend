import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { BalancedVaultABI } from '@/src/lib/abis';
import { CONTRACTS, DECIMALS } from '@/src/lib/config';
import { toast } from 'sonner';

export function useVaultWithdraw() {
  const { address } = useAccount();
  const {
    writeContract: withdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
    error: withdrawError
  } = useWriteContract();

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawConfirmed
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  const withdrawFromVault = async (shares: number) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      // LP tokens are minted with 6 decimals (1:1 with USDC)
      // even though the ERC20 contract technically supports 18 decimals
      const sharesInWei = parseUnits(shares.toString(), 6);

      toast.info('Withdrawing from vault...');
      await withdraw({
        address: CONTRACTS.VAULT,
        abi: BalancedVaultABI,
        functionName: 'withdraw',
        args: [sharesInWei],
        gas: BigInt(2000000), // Set explicit gas limit to avoid estimation issues
      });

      // Success toast will be shown by page.tsx after transaction confirmation
    } catch (error: any) {
      console.error('Withdraw error:', error);
      toast.error(error.message || 'Failed to withdraw');
      throw error;
    }
  };

  return {
    withdrawFromVault,
    isWithdrawPending,
    isWithdrawConfirming,
    isWithdrawConfirmed,
    withdrawError,
    withdrawHash,
  };
}
