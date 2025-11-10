import { NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia, mainnet } from 'viem/chains';
import { CONTRACTS, NETWORK, UNISWAP_POOLS } from '@/src/lib/config';

const ORACLE_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'getPrice',
    outputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const POOL_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
      { internalType: 'int24', name: 'tick', type: 'int24' },
      { internalType: 'uint16', name: 'observationIndex', type: 'uint16' },
      { internalType: 'uint16', name: 'observationCardinality', type: 'uint16' },
      { internalType: 'uint16', name: 'observationCardinalityNext', type: 'uint16' },
      { internalType: 'uint8', name: 'feeProtocol', type: 'uint8' },
      { internalType: 'bool', name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Helper to calculate price from sqrtPriceX96
function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
  const Q96 = BigInt(2) ** BigInt(96);
  const price = Number(sqrtPriceX96) / Number(Q96);
  const priceSquared = price * price;
  const decimalAdjustment = 10 ** (decimals1 - decimals0);
  return priceSquared * decimalAdjustment;
}

export async function GET() {
  try {
    const chain = NETWORK === 'sepolia' ? sepolia : mainnet;
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || chain.rpcUrls.default.http[0];

    const client = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // For Sepolia testnet, use the vault's oracle for prices
    if (NETWORK === 'sepolia') {
      const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS as `0x${string}`;

      if (!oracleAddress) {
        throw new Error('Oracle address not configured');
      }

      // Get prices from oracle (prices are in 8 decimals, representing USD)
      const [wbtcPriceRaw, paxgPriceRaw] = await Promise.all([
        client.readContract({
          address: oracleAddress,
          abi: ORACLE_ABI,
          functionName: 'getPrice',
          args: [CONTRACTS.WBTC],
        }),
        client.readContract({
          address: oracleAddress,
          abi: ORACLE_ABI,
          functionName: 'getPrice',
          args: [CONTRACTS.PAXG],
        }),
      ]);

      // Convert from 8 decimals to regular number (oracle returns prices with 8 decimals)
      const wbtcPrice = parseFloat(formatUnits(wbtcPriceRaw, 8));
      const paxgPrice = parseFloat(formatUnits(paxgPriceRaw, 8));

      // For Sepolia, we don't have historical data, so we'll use current prices
      // In production, you would query historical data from your subgraph
      return NextResponse.json({
        current: {
          wbtcToken: {
            id: CONTRACTS.WBTC.toLowerCase(),
            symbol: 'WBTC',
            priceUSD: wbtcPrice.toString(),
          },
          paxgToken: {
            id: CONTRACTS.PAXG.toLowerCase(),
            symbol: 'PAXG',
            priceUSD: paxgPrice.toString(),
          },
        },
        historical: {
          wbtcTokenDayData: [
            {
              priceUSD: (wbtcPrice * 0.99).toString(), // Simulate 1% change
              date: Math.floor(Date.now() / 1000) - 86400,
            },
          ],
          paxgTokenDayData: [
            {
              priceUSD: (paxgPrice * 0.99).toString(), // Simulate 1% change
              date: Math.floor(Date.now() / 1000) - 86400,
            },
          ],
        },
      });
    } else {
      // For mainnet, you could use alternative price sources like CoinGecko API
      // or Chainlink price feeds
      throw new Error('Mainnet price fetching not implemented yet');
    }
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
