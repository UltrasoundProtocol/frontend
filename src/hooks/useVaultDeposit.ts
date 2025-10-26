import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20ABI, BalancedVaultABI } from '@/src/lib/abis';
import { CONTRACTS, DECIMALS } from '@/src/lib/config';
import { toast } from 'sonner';

export function useVaultDeposit() {
  const { address } = useAccount();
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError
  } = useWriteContract();

  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const depositUSDC = async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const amountInWei = parseUnits(amount.toString(), DECIMALS.USDC);

      // Step 1: Approve USDC spending
      toast.info('Approving USDC...');
      await approve({
        address: CONTRACTS.USDC,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [CONTRACTS.VAULT, amountInWei],
      });

      // Wait for approval confirmation
      toast.info('Waiting for approval confirmation...');
      // The approval will be confirmed automatically by useWaitForTransactionReceipt

    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to deposit');
      throw error;
    }
  };

  const executeDeposit = async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const amountInWei = parseUnits(amount.toString(), DECIMALS.USDC);

      // Step 2: Execute deposit
      toast.info('Depositing to vault...');
      await deposit({
        address: CONTRACTS.VAULT,
        abi: BalancedVaultABI,
        functionName: 'deposit',
        args: [amountInWei],
        gas: BigInt(5000000), // Set explicit gas limit (5M gas) to avoid estimation issues
      });

      // Success will be shown after transaction confirmation
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to deposit');
      throw error;
    }
  };

  return {
    depositUSDC,
    executeDeposit,
    isApprovePending,
    isDepositPending,
    isApproveConfirming,
    isDepositConfirming,
    isApproveConfirmed,
    isDepositConfirmed,
    approveError,
    depositError,
    approveHash,
    depositHash,
  };
}
