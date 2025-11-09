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

// Sepolia testnet addresses (deployed for testing - Updated 2025-11-09)
const SEPOLIA_CONTRACTS = {
  VAULT: '0xf6ffB0B21d4c175A186F6d1Ec3b9F334583AF7dB' as `0x${string}`,
  LP_TOKEN: '0xFeAd78878B32411965765C34b19C70D5A6b6994A' as `0x${string}`,
  WBTC: '0x5009734C3fD390fc800A67972A374410ef8fdc9b' as `0x${string}`,
  PAXG: '0xE71daD6C3DcDBeFD1f0BDf93ba6d8021dBcCC926' as `0x${string}`,
  USDC: '0x20585140024f29C486F9267EB2A7CbD216f48856' as `0x${string}`,
  FEE_COLLECTOR: '0xd899ce2A3659635849dB19F2C72082743e9333A6' as `0x${string}`,
  ORACLE: '0x5075B552f6B8B1251d006DAa081a66E3Df1B57a8' as `0x${string}`,  // MockPriceOracle with dynamic prices from bot
  REBALANCER: '0x0Ab375e286Bd0810EdEE1Ffc066aabC361475db5' as `0x${string}`,
} as const;

const SEPOLIA_POOLS = {
  WBTC_USDC: '0xc7a092ED6e25794634bc4264bDC9991755bC991d' as `0x${string}`,  // New pool with correct price (0.05% fee)
  PAXG_USDC: '0x8E640764a61A162CA7A370E22f284E570a304703' as `0x${string}`,  // 0.05% fee pool
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
  LP_TOKEN: 6, // LP tokens are minted 1:1 with USDC (6 decimals)
} as const;

// Uniswap V3 pool addresses for price queries
export const UNISWAP_POOLS = NETWORK === 'sepolia' ? SEPOLIA_POOLS : MAINNET_POOLS;
