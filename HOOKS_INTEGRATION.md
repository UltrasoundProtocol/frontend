# Frontend Hooks Integration

This document explains how the frontend hooks are integrated with the Ultrasound Protocol subgraph and Uniswap subgraph to fetch real-time data.

## Overview

The frontend uses custom React hooks to fetch data from:
1. **Ultrasound Protocol Subgraph** - Protocol and user data (TVL, balances, deposits, withdrawals)
2. **Uniswap V3 Subgraph** - Token prices for WBTC and PAXG

## Architecture

```
┌─────────────────┐
│   React Page    │
└────────┬────────┘
         │
         ├─── useCompleteProtocolData (combines protocol + prices)
         │    ├─── useProtocolData (Ultrasound SG)
         │    └─── usePrices (Uniswap SG)
         │
         ├─── useTotalBalance (Ultrasound SG)
         ├─── useUserAPY (Ultrasound SG)
         ├─── useGainLoss (Ultrasound SG)
         ├─── useHoldings (Ultrasound SG)
         └─── useHistory (Ultrasound SG)
```

## Setup

### 1. Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Ultrasound Protocol Subgraph
NEXT_PUBLIC_ULTRASOUND_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/ultrasound-protocol/version/latest

# Uniswap V3 Subgraph (for prices)
NEXT_PUBLIC_UNISWAP_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3

# Contract Addresses
NEXT_PUBLIC_VAULT_ADDRESS=0xYourVaultAddress
NEXT_PUBLIC_LP_TOKEN_ADDRESS=0xYourLPTokenAddress
```

### 2. Apollo Client Configuration

The Apollo Client is configured in `src/lib/apollo/client.ts` with two separate clients:
- `ultrasoundClient` - For protocol data
- `uniswapClient` - For price data

Both clients are wrapped in the app providers (`app/providers.tsx`).

## Available Hooks

### Protocol-Level Hooks

#### `useCompleteProtocolData()`

Returns complete protocol data including prices and computed metrics.

```typescript
const { data, loading, error } = useCompleteProtocolData();

// data contains:
{
  // Price data
  wbtcPrice: number;
  paxgPrice: number;
  wbtcPriceChange: number;    // 24h change %
  paxgPriceChange: number;    // 24h change %

  // Protocol balances
  wbtcBalance: number;
  paxgBalance: number;

  // Computed metrics
  tvl: number;                // Total value locked
  tvlFormatted: string;       // Formatted TVL string
  protocolAPY: number;        // Protocol APY %
  deviation: number;          // Deviation from 50/50 %
  currentProportion: {
    wbtc: number;             // WBTC percentage
    paxg: number;             // PAXG percentage
  };

  // Raw data
  volume24h: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRebalances: number;
  paused: boolean;
}
```

#### `useProtocolData()`

Lower-level hook that queries protocol data from Ultrasound subgraph.

```typescript
const { protocolData, loading, error, refetch } = useProtocolData();
```

#### `usePrices()`

Queries token prices from Uniswap V3 subgraph.

```typescript
const { pricesData, loading, error } = usePrices();

// pricesData contains:
{
  wbtc: {
    symbol: 'WBTC',
    price: number,
    changePct: number,        // 24h change
    priceYesterday: number
  },
  paxg: { ... },
  ethPrice: number
}
```

### User-Specific Hooks

All user hooks accept an optional `userAddress` parameter. If the address is undefined (user not connected), they return empty/zero values.

#### `useTotalBalance(userAddress)`

Gets user's LP token balance.

```typescript
const { lpBalance, totalUnits, loading, error } = useTotalBalance(userAddress);
```

#### `useUserAPY(userAddress)`

Calculates user's personal APY based on their deposit/withdrawal history.

```typescript
const { userAPY, loading, error } = useUserAPY(userAddress);

// userAPY contains:
{
  apy: number;                    // User's APY %
  currentValue: number;           // Current value of position
  totalDeposited: number;         // Total deposited
  daysSinceFirstDeposit: number;  // Days since first deposit
}
```

#### `useGainLoss(userAddress)`

Calculates user's profit/loss.

```typescript
const { gainLoss, loading, error } = useGainLoss(userAddress);

// gainLoss contains:
{
  currentValue: number;       // Current position value
  totalDeposited: number;     // Total amount deposited
  profit: number;             // Profit/loss amount
  profitPercentage: number;   // Profit/loss %
  isProfit: boolean;          // True if profit, false if loss
}
```

#### `useHoldings(userAddress)`

Gets user's proportional holdings of WBTC and PAXG.

```typescript
const { holdings, loading, error } = useHoldings(userAddress);

// holdings contains:
{
  lpBalance: number;          // LP token balance
  sharePercentage: number;    // % of total pool
  asset0Holdings: number;     // WBTC holdings
  asset1Holdings: number;     // PAXG holdings
}
```

#### `useHistory(userAddress)`

Gets user's transaction history.

```typescript
const { deposits, withdrawals, loading, error } = useHistory(userAddress);

// deposits: Array of deposit transactions
// withdrawals: Array of withdrawal transactions
```

## Data Flow

### General Data Flow

```
1. User visits page
2. useCompleteProtocolData() hook executes:
   ├─ Queries Ultrasound subgraph for protocol data
   └─ Queries Uniswap subgraph for prices
3. Data is combined and computed metrics are calculated:
   ├─ TVL = (WBTC balance × WBTC price) + (PAXG balance × PAXG price)
   ├─ Deviation = |WBTC value / TVL - 0.5| × 100
   └─ Current Proportion = percentage breakdown
4. Page renders with live data
```

### User Data Flow

```
1. User connects wallet
2. userAddress becomes available
3. User-specific hooks execute:
   ├─ useTotalBalance → LP balance
   ├─ useUserAPY → Personal APY calculation
   ├─ useGainLoss → Profit/loss calculation
   ├─ useHoldings → Asset holdings breakdown
   └─ useHistory → Transaction history
4. Position card updates with user data
```

## Calculations

### Protocol APY

```
APY = ((Current_SV / Previous_SV)^(365/Days_Live) - 1) × 100

Where:
- Current_SV = Current strategy value
- Previous_SV = Previous strategy value
- Days_Live = Days since protocol launch
```

### User APY

```
1. User_current_value = user.total_units × strategy_value_current
2. Weighted_avg_entry = User_total_deposited / user.total_units
3. User_APY = ((strategy_value_current / Weighted_avg_entry)^(365/days) - 1) × 100
```

### Deviation

```
Deviation = |WBTC_value / Total_value - 0.5| × 100

Where:
- WBTC_value = WBTC balance × WBTC price
- Total_value = WBTC_value + PAXG_value
```

### Gain/Loss

```
1. User_current_value = user.total_units × strategy_value_current
2. User_profit = User_current_value - User_total_deposited
3. Profit_percentage = (User_profit / User_total_deposited) × 100
```

## Polling

All hooks use Apollo's `pollInterval` option to automatically refresh data:

- Protocol data: Every 30 seconds
- User data: Every 30 seconds
- Prices: Current prices every 30 seconds, historical every 5 minutes

## Error Handling

All hooks return an `error` object that can be used for error handling:

```typescript
const { data, loading, error } = useCompleteProtocolData();

if (error) {
  console.error('Failed to fetch protocol data:', error);
  // Show error state to user
}
```

## Loading States

All hooks return a `loading` boolean:

```typescript
const { data, loading } = useCompleteProtocolData();

if (loading) {
  return <LoadingSpinner />;
}
```

## Refetching Data

Some hooks provide a `refetch` function to manually trigger a data refresh:

```typescript
const { data, refetch } = useProtocolData();

// Manually refresh data
await refetch();
```

## Testing

To test with mock data before the subgraph is deployed:

1. Update the subgraph URLs in `.env.local` to point to your test endpoints
2. Ensure the subgraph is deployed and indexed
3. Connect a wallet that has interacted with the protocol
4. Verify data appears correctly in the UI

## Troubleshooting

### No data showing

1. Check that subgraph URLs are correct in `.env.local`
2. Verify the subgraph is deployed and synced
3. Check browser console for GraphQL errors
4. Ensure contract addresses in `src/lib/config.ts` are correct

### Prices not updating

1. Verify Uniswap subgraph URL is correct
2. Check that WBTC and PAXG addresses in `src/lib/config.ts` match mainnet addresses
3. Look for errors in the browser console

### User data not showing

1. Ensure wallet is connected
2. Verify the user has deposited to the vault
3. Check that the subgraph has indexed the user's transactions

## Next Steps

1. Deploy the Ultrasound subgraph and update the URL in `.env.local`
2. Update contract addresses in `src/lib/config.ts`
3. Test with real data on mainnet or a testnet fork
4. Add error boundaries and loading states as needed
5. Implement data caching strategies for better performance
