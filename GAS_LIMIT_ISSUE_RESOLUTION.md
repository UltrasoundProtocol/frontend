# Gas Limit Issue Resolution - Deposit Functionality

## Problem Summary

When attempting to deposit USDC into the vault, the transaction fails with:
- **Error**: "transaction gas limit too high" (cap: 16777216, tx: 20979472)
- **Root Cause**: WBTC price oracle returning incorrect price ($0.0000001 instead of ~$97,000)

## Technical Analysis

### WBTC Pool Issue
The existing WBTC/USDC pool (0x3cE823245DCa9f6353C5cD51314F0b2D885AfC9f) was initialized with incorrect `sqrtPriceX96`:
- **Current**: 2.505e+33
- **Should be**: 2.544e+27 (for 1 WBTC = $97,000)

This causes:
1. Oracle to return price of $0.0000001
2. Rebalancer to calculate impossibly large swap amounts
3. Transaction gas estimation to exceed block gas limit

### Solution Implemented

**New WBTC/USDC Pool Created**:
- **Address**: `0xc7a092ED6e25794634bc4264bDC9991755bC991d`
- **Fee Tier**: 0.05% (500 bps)
- **Price**: Correctly initialized for 1 WBTC = $97,000
- **Status**: ✅ Created and initialized

**Remaining Steps**:
1. ⏳ Add liquidity to new pool
2. ⏳ Deploy new PriceOracleModule with new pool
3. ⏳ Update vault to use new oracle

## Current Workaround Options

### Option 1: Wait for Oracle Fix (Recommended)
The new pool has been created with correct pricing. Once the oracle is deployed and updated, deposits will work normally.

**Status**: In progress

### Option 2: Test with Contract Directly (Advanced)
Use `cast` to test deposits directly:
```bash
cd contracts
source .env
source deployments/sepolia.env

# Small test deposit (10 USDC)
AMOUNT="10000000"

# Approve
cast send $USDC "approve(address,uint256)" $VAULT_ADDRESS $AMOUNT \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --private-key "$SEPOLIA_PRIVATE_KEY"

# Attempt deposit (will likely fail until oracle is fixed)
cast send $VAULT_ADDRESS "deposit(uint256)" $AMOUNT \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --private-key "$SEPOLIA_PRIVATE_KEY" \
  --gas-limit 5000000
```

### Option 3: Mock Realistic Prices (For Testing)
For immediate frontend testing, we can:
1. Update the `/api/prices` endpoint to return hardcoded realistic prices
2. This allows UI testing without actual deposits

## Implementation Status

### ✅ Completed
1. Diagnosed root cause (WBTC pool price initialization)
2. Calculated correct sqrtPriceX96 for realistic BTC price
3. Created new WBTC/USDC pool with correct price (0xc7a092ED...)
4. Updated frontend with explicit gas limits
5. Added liquidity to PAXG pool (working correctly)
6. Minted 100,000 USDC to deployer for testing

### ⏳ In Progress
1. Deploy new PriceOracleModule pointing to new WBTC pool
2. Update vault to use new oracle via `updateModule()`
3. Add liquidity to new WBTC pool
4. Verify deposit functionality with realistic prices

### 📝 Next Steps

#### For Developers
1. Complete oracle deployment and vault update
2. Test small deposit (10 USDC) to verify functionality
3. Monitor gas usage and optimize if needed

#### For Testing
Once oracle is fixed:
1. Connect wallet to Sepolia testnet
2. Ensure you have Sepolia ETH for gas
3. Navigate to http://localhost:3000
4. Try depositing small amount (10-100 USDC)
5. Verify LP tokens are minted
6. Try withdrawal

## Price Comparison

| Asset | Current Oracle | Should Be | Status |
|-------|---------------|-----------|--------|
| WBTC  | $0.0000001    | ~$97,000  | ❌ Broken |
| PAXG  | $1,998.18     | ~$1,998   | ✅ Working |
| USDC  | $1.00         | $1.00     | ✅ Working |

## Files Modified

### Frontend
- `src/hooks/useVaultDeposit.ts` - Added explicit gas limit (5M gas)
- `app/api/prices/route.ts` - Updated to use oracle's `getPrice()` function
- `.env` - Updated contract addresses to latest deployment

### Contracts
- `script/fork/fix-wbtc-pool.sh` - Script to create new pool with correct price
- `script/fork/deploy-new-oracle.sh` - Script to deploy and configure new oracle

## Contract Addresses

### Current (With Broken WBTC Oracle)
- Vault: `0x9c6CBd8c945D87c377c6e5BC9B8019c99e73f27C`
- Oracle: `0x2D5c5e6BCD65D15dB9706BF8CBB8c7eB4FE67297`
- WBTC/USDC Pool: `0x3cE823245DCa9f6353C5cD51314F0b2D885AfC9f` (0.3% fee) ❌

### New (With Fixed WBTC Pricing)
- WBTC/USDC Pool: `0xc7a092ED6e25794634bc4264bDC9991755bC991d` (0.05% fee) ✅
- Oracle: ⏳ To be deployed
- Note: PAXG/USDC pool remains the same (already working)

## Technical Details

### Gas Limit Analysis
- **Sepolia Block Gas Limit**: 16,777,216
- **Attempted Transaction**: 20,979,472 (125% of limit!)
- **Normal Deposit**: ~500,000 - 1,000,000 gas
- **With Incorrect Price**: Causes extreme gas usage due to:
  - Massive swap amount calculations
  - Multiple failed swap attempts
  - Overflow protection checks

### Deposit Flow
1. User approves USDC spending → ✅ Works
2. Vault receives USDC → ✅ Works
3. Vault calls rebalancer to swap USDC → 50% WBTC + 50% PAXG
4. Rebalancer queries oracle for prices → ❌ WBTC price wrong
5. Rebalancer calculates swap amounts → ❌ Massive amounts
6. Uniswap swap fails or requires extreme gas → ❌ Transaction reverts

## Resolution Timeline

| Step | Status | Est. Time |
|------|--------|-----------|
| Create new WBTC pool | ✅ Done | - |
| Deploy new oracle | ⏳ In progress | 5 min |
| Update vault | ⏳ Pending | 2 min |
| Add liquidity | ⏳ Pending | 5 min |
| Test deposit | ⏳ Pending | 5 min |
| **Total** | | **~15-20 min** |

## Testing Checklist

Once oracle is fixed:
- [ ] WBTC price shows ~$97,000
- [ ] PAXG price shows ~$1,998
- [ ] Deposit 10 USDC succeeds
- [ ] LP tokens minted correctly
- [ ] Gas usage < 1M gas
- [ ] Withdrawal works correctly
- [ ] Balance updates properly

---

**Last Updated**: 2025-10-26
**Status**: 🟡 Awaiting oracle deployment
**Priority**: High - Blocks deposit testing
