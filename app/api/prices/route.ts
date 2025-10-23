import { NextResponse } from 'next/server';
import { CONTRACTS } from '@/src/lib/config';

const UNISWAP_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_UNISWAP_SUBGRAPH_URL ||
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

const PRICES_QUERY = `
  query GetTokenPrices($wbtcAddress: String!, $paxgAddress: String!) {
    wbtcToken: token(id: $wbtcAddress) {
      id
      symbol
      derivedETH
    }
    paxgToken: token(id: $paxgAddress) {
      id
      symbol
      derivedETH
    }
    bundle(id: "1") {
      ethPriceUSD
    }
  }
`;

const HISTORICAL_PRICES_QUERY = `
  query GetHistoricalPrices(
    $wbtcAddress: String!
    $paxgAddress: String!
    $timestamp: Int!
  ) {
    wbtcTokenDayData: tokenDayDatas(
      first: 1
      where: { token: $wbtcAddress, date_lte: $timestamp }
      orderBy: date
      orderDirection: desc
    ) {
      priceUSD
      date
    }
    paxgTokenDayData: tokenDayDatas(
      first: 1
      where: { token: $paxgAddress, date_lte: $timestamp }
      orderBy: date
      orderDirection: desc
    ) {
      priceUSD
      date
    }
  }
`;

export async function GET() {
  try {
    const timestamp24hAgo = Math.floor(Date.now() / 1000) - 86400;

    // Fetch current prices
    const currentResponse = await fetch(UNISWAP_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: PRICES_QUERY,
        variables: {
          wbtcAddress: CONTRACTS.WBTC.toLowerCase(),
          paxgAddress: CONTRACTS.PAXG.toLowerCase(),
        },
      }),
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    // Fetch historical prices
    const historicalResponse = await fetch(UNISWAP_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: HISTORICAL_PRICES_QUERY,
        variables: {
          wbtcAddress: CONTRACTS.WBTC.toLowerCase(),
          paxgAddress: CONTRACTS.PAXG.toLowerCase(),
          timestamp: timestamp24hAgo,
        },
      }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!currentResponse.ok || !historicalResponse.ok) {
      throw new Error('Uniswap subgraph request failed');
    }

    const currentData = await currentResponse.json();
    const historicalData = await historicalResponse.json();

    if (currentData.errors || historicalData.errors) {
      console.error('GraphQL errors:', currentData.errors || historicalData.errors);
      return NextResponse.json(
        { error: 'Failed to fetch price data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      current: currentData.data,
      historical: historicalData.data,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
