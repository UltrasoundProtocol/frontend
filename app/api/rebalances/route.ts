import { NextResponse } from 'next/server';
import { serializeBigInts } from '@/src/lib/bigint-serializer';

const ULTRASOUND_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_ULTRASOUND_SUBGRAPH_URL ||
  'https://subgraph.satsuma-prod.com/1fbdab357f8a/giuliano--794168/ultrasound-protocol-sepolia/api';

const REBALANCES_QUERY = `
  query GetRebalanceEvents($first: Int!) {
    rebalanceEvents(
      first: $first,
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      timestamp
      blockNumber
      transactionHash
      amountSwapped
      amountReceived
      newRatio
      beforeAsset0Balance
      beforeAsset1Balance
      afterAsset0Balance
      afterAsset1Balance
      protocolFee
      keeperReward
      keeper
    }
  }
`;

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get('first') || '10', 10);

    const response = await fetch(ULTRASOUND_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: REBALANCES_QUERY,
        variables: { first },
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
        { error: 'Failed to fetch rebalance events', details: data.errors },
        { status: 500 }
      );
    }

    // Serialize BigInt values to strings
    const serializedData = serializeBigInts(data.data);
    return NextResponse.json(serializedData);
  } catch (error) {
    console.error('Error fetching rebalance events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
