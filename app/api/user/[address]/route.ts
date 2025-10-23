import { NextResponse } from 'next/server';

const ULTRASOUND_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_ULTRASOUND_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/ultrasound-protocol/version/latest';

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
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address.toLowerCase();

    const response = await fetch(ULTRASOUND_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: USER_QUERY,
        variables: { address },
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
        { error: 'Failed to fetch user data', details: data.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
