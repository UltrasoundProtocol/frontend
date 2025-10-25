// Network configuration
export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'mainnet') as 'mainnet' | 'sepolia';

// Mainnet addresses
const MAINNET_CONTRACTS = {
  VAULT: '0x7027DeB280C03AedE961f2c620BE72B3F684fBa' as `0x${string}`,
  LP_TOKEN: '' as `0x${string}`,
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
  PAXG: '0x45804880De22913dAFE09f4980848ECE6EcbAf78' as `0x${string}`,
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
  FEE_COLLECTOR: '' as `0x${string}`,
  ORACLE: '' as `0x${string}`,
  REBALANCER: '' as `0x${string}`,
} as const;

const MAINNET_POOLS = {
  WBTC_USDC: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35' as `0x${string}`,
  PAXG_USDC: '0x5aE13BAAEF0620FdaE1D355495Dc51a17adb4082' as `0x${string}`,
} as const;

// Sepolia testnet addresses (deployed for testing)
const SEPOLIA_CONTRACTS = {
  VAULT: '0x9c6CBd8c945D87c377c6e5BC9B8019c99e73f27C' as `0x${string}`,
  LP_TOKEN: '0xB6428C2a9FD3a7596C16925A9D4Ba574C8F0C44D' as `0x${string}`,
  WBTC: '0x8e6b801251cd6ac7a2d1f5084572f0dc804444a4' as `0x${string}`,
  PAXG: '0x5c740231f3de159076c343a7dde67431a77aae11' as `0x${string}`,
  USDC: '0x6e56771c53595862329446629b832b95a5da9d26' as `0x${string}`,
  FEE_COLLECTOR: '0x2eAd46c434E17b6EA9A07eD5961CC23995B11566' as `0x${string}`,
  ORACLE: '0xbe68271b78E93b356943E601Eaf1F562585cCF26' as `0x${string}`,
  REBALANCER: '0x959f9AC4105a83c27f1fb166E4475D2BBD17DA5E' as `0x${string}`,
} as const;

const SEPOLIA_POOLS = {
  WBTC_USDC: '0x3cE823245DCa9f6353C5cD51314F0b2D885AfC9f' as `0x${string}`,
  PAXG_USDC: '0x8E640764a61A162CA7A370E22f284E570a304703' as `0x${string}`,
} as const;

// Contract addresses - auto-selected based on NEXT_PUBLIC_NETWORK
export const CONTRACTS = {
  ...(NETWORK === 'sepolia' ? SEPOLIA_CONTRACTS : MAINNET_CONTRACTS),
  // Allow environment overrides
  VAULT: (process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
    (NETWORK === 'sepolia' ? SEPOLIA_CONTRACTS.VAULT : MAINNET_CONTRACTS.VAULT)) as `0x${string}`,
  LP_TOKEN: (process.env.NEXT_PUBLIC_LP_TOKEN_ADDRESS ||
    (NETWORK === 'sepolia' ? SEPOLIA_CONTRACTS.LP_TOKEN : MAINNET_CONTRACTS.LP_TOKEN)) as `0x${string}`,
} as const;

// Decimal places for each token
export const DECIMALS = {
  WBTC: 8,
  PAXG: 18,
  USDC: 6,
  LP_TOKEN: 18,
} as const;

// Uniswap V3 pool addresses for price queries
export const UNISWAP_POOLS = NETWORK === 'sepolia' ? SEPOLIA_POOLS : MAINNET_POOLS;
