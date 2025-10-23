# Frontend Hooks Integration (Next.js API Routes)

This document explains how the frontend hooks are integrated with the Ultrasound Protocol subgraph and Uniswap subgraph using Next.js API routes.

## Overview

The frontend uses Next.js 15 API routes with custom React hooks to fetch data from:
1. **Ultrasound Protocol Subgraph** - Protocol and user data (TVL, balances, deposits, withdrawals)
2. **Uniswap V3 Subgraph** - Token prices for WBTC and PAXG

**No Apollo Client required** - Everything uses native `fetch` API.

## Architecture

```
┌─────────────────┐
│   React Page    │
└────────┬────────┘
         │
         ├─── useCompleteProtocolData (combines protocol + prices)
         │    ├─── useProtocolData → GET /api/protocol
         │    └─── usePrices → GET /api/prices
         │
         └─── User Hooks (all use shared useUserData)
              └─── useUserData → GET /api/user/[address]
                   ├─── useTotalBalance
                   ├─── useUserAPY
                   ├─── useGainLoss
                   ├─── useHoldings
                   └─── useHistory
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

### 2. API Routes Structure

The API routes are located in `app/api/`:

- **`app/api/protocol/route.ts`** - Fetches protocol data from Ultrasound subgraph
- **`app/api/prices/route.ts`** - Fetches token prices from Uniswap subgraph
- **`app/api/user/[address]/route.ts`** - Fetches user-specific data

All routes use:
- Native `fetch` API
- Next.js caching with `revalidate` option
- Server-side GraphQL queries
- Proper error handling

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

Lower-level hook that queries protocol data.

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

All user hooks accept an optional `userAddress` parameter and share a single `useUserData` hook internally for efficiency.

#### `useTotalBalance(userAddress)`

Gets user's LP token balance.

```typescript
const { lpBalance, totalUnits, loading, error } = useTotalBalance(userAddress);
```

#### `useUserAPY(userAddress)`

Calculates user's personal APY.

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
  isProfit: boolean;          // True if profit
}
```

#### `useHoldings(userAddress)`

Gets user's proportional holdings.

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
   ├─ Calls /api/protocol (fetches from Ultrasound subgraph)
   └─ Calls /api/prices (fetches from Uniswap subgraph)
3. API routes fetch from subgraphs and cache results
4. Data is combined and computed metrics are calculated
5. Page renders with live data
```

### User Data Flow

```
1. User connects wallet
2. userAddress becomes available
3. useUserData hook executes once:
   └─ Calls /api/user/[address]
4. All user hooks (useUserAPY, useGainLoss, etc.) derive from this data
5. Position card updates with user data
```

## API Route Details

### GET /api/protocol

Fetches protocol data from Ultrasound subgraph.

**Caching**: 30 seconds
**Returns**: Protocol entity + daily snapshots

### GET /api/prices

Fetches current and historical prices from Uniswap subgraph.

**Caching**:
- Current prices: 30 seconds
- Historical prices: 5 minutes

**Returns**: Current prices + 24h historical data

### GET /api/user/[address]

Fetches all user data in a single query.

**Parameters**: `address` - User wallet address
**Caching**: 30 seconds
**Returns**: User entity with deposits, withdrawals, and protocol data

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

All hooks automatically poll their respective endpoints:

- Protocol data: Every 30 seconds
- User data: Every 30 seconds (single query)
- Prices: Every 30 seconds

API routes cache responses to minimize subgraph requests.

## Error Handling

All hooks return an `error` object:

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

Some hooks provide a `refetch` function:

```typescript
const { data, refetch } = useProtocolData();

// Manually refresh data
await refetch();
```

## Benefits of Next.js API Routes

1. **No client-side dependencies** - No Apollo Client needed
2. **Server-side caching** - Reduce subgraph API calls
3. **Type-safe** - Full TypeScript support
4. **Better error handling** - Centralized error handling
5. **SSR compatible** - Works with server components
6. **Simplified setup** - Just use native fetch

## Testing

To test with mock data:

1. Update the subgraph URLs in `.env.local`
2. Ensure the subgraph is deployed and indexed
3. Start dev server: `npm run dev`
4. Connect a wallet that has interacted with the protocol
5. Verify data appears correctly

## Troubleshooting

### No data showing

1. Check `.env.local` has correct subgraph URLs
2. Verify the subgraph is deployed and synced
3. Check browser console for fetch errors
4. Verify contract addresses in `src/lib/config.ts`

### Prices not updating

1. Verify Uniswap subgraph URL is correct
2. Check WBTC/PAXG addresses match mainnet
3. Look for errors in browser console
4. Test `/api/prices` endpoint directly

### User data not showing

1. Ensure wallet is connected
2. Verify user has deposited to the vault
3. Check subgraph has indexed user's transactions
4. Test `/api/user/[address]` endpoint directly

## Next Steps

1. Deploy the Ultrasound subgraph
2. Update URLs in `.env.local`
3. Update contract addresses in `src/lib/config.ts`
4. Test with real data
5. Add loading states and error boundaries
