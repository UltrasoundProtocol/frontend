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

// Sepolia testnet addresses (deployed for testing - Updated 2025-10-29)
const SEPOLIA_CONTRACTS = {
  VAULT: '0xA22A426896291f7b8425A617790541B1d7846E49' as `0x${string}`,
  LP_TOKEN: '0x138c006EbdccDd427Be31CA80ed13E656DDdc5D1' as `0x${string}`,
  WBTC: '0x3d86d71cCe39CfC7ab547289fdE21D0c3B182Cb1' as `0x${string}`,
  PAXG: '0xCa61a2012B0D28D5eC6F2985cA1014aE7EBad644' as `0x${string}`,
  USDC: '0x15c3892E7F6C1fD070cb1f381D01be335F364243' as `0x${string}`,
  FEE_COLLECTOR: '0x132C753CD4e45b95A50Cb2DC49257f176b79e494' as `0x${string}`,
  ORACLE: '0x47cFF4Fd8A7dAEA40bC38DeF49972706AA6Afdc6' as `0x${string}`,  // MockPriceOracle with dynamic prices from bot
  REBALANCER: '0x4b7967C4F76B5A5522d2ba8f8Ed705C5b34530C7' as `0x${string}`,
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
