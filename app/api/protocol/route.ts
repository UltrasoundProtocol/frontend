import { NextResponse } from 'next/server';

const ULTRASOUND_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_ULTRASOUND_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/ultrasound-protocol/version/latest';

const PROTOCOL_QUERY = `
  query GetProtocolData {
    protocol(id: "protocol") {
      totalValueLocked
      asset0Balance
      asset1Balance
      currentStrategyValue
      previousStrategyValue
      strategyValueUpdatedAt
      totalDeposits
      totalWithdrawals
      totalRebalances
      volume24h
      daysLive
      paused
      targetRatio
      rebalanceThreshold
      totalSupply
    }

    dailySnapshots(first: 7, orderBy: date, orderDirection: desc) {
      date
      totalValueLocked
      depositVolume
      withdrawalVolume
    }
  }
`;

export async function GET() {
  try {
    const response = await fetch(ULTRASOUND_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: PROTOCOL_QUERY,
      }),
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Subgraph request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'Failed to fetch protocol data', details: data.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error fetching protocol data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
