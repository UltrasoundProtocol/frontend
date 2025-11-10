import { NextResponse } from 'next/server';
import { serializeBigInts } from '@/src/lib/bigint-serializer';

const ULTRASOUND_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_ULTRASOUND_SUBGRAPH_URL ||
  'https://subgraph.satsuma-prod.com/1fbdab357f8a/giuliano--794168/ultrasound-protocol-sepolia/api';

const USER_QUERY = `
  query GetUserData($address: ID!) {
    user(id: $address) {
      lpBalance
      totalUnits
      totalDeposited
      totalWithdrawn
      firstDepositAt
      deposits(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        stablecoinAmount
        sharesIssued
        transactionHash
        valueUSD
      }
      withdrawals(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        shares
        asset0Amount
        asset1Amount
        transactionHash
        valueUSD
      }
    }

    protocol(id: "protocol") {
      currentStrategyValue
      asset0Balance
      asset1Balance
      totalSupply
    }
  }
`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: rawAddress } = await params;
    const address = rawAddress.toLowerCase();

    const response = await fetch(ULTRASOUND_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: USER_QUERY,
        variables: { address },
      }),
      cache: 'no-store', // Disable caching for real-time data
    });

    if (!response.ok) {
      throw new Error(`Subgraph request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: data.errors },
        { status: 500 }
      );
    }

    // Serialize BigInt values to strings
    const serializedData = serializeBigInts(data.data);
    return NextResponse.json(serializedData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
