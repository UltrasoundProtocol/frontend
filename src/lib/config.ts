// Contract addresses - Update these with actual deployed addresses
export const CONTRACTS = {
  VAULT: (process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
    '0x7027DeB280C03AedE961f2c620BE72B3F684fBa') as `0x${string}`,
  LP_TOKEN: (process.env.NEXT_PUBLIC_LP_TOKEN_ADDRESS || '') as `0x${string}`,
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
  PAXG: '0x45804880De22913dAFE09f4980848ECE6EcbAf78' as `0x${string}`,
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
} as const;

// Decimal places for each token
export const DECIMALS = {
  WBTC: 8,
  PAXG: 18,
  USDC: 6,
  LP_TOKEN: 18,
} as const;

// Uniswap V3 pool addresses for price queries
export const UNISWAP_POOLS = {
  WBTC_USDC: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35' as `0x${string}`,
  PAXG_USDC: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Update with actual pool
} as const;
