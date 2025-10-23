import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Ultrasound Protocol Subgraph URL
// Replace with your actual deployed subgraph URL
const ULTRASOUND_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_ULTRASOUND_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/ultrasound-protocol/version/latest';

// Uniswap V3 Subgraph URL for price data
const UNISWAP_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_UNISWAP_SUBGRAPH_URL ||
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

// Client for Ultrasound Protocol data
export const ultrasoundClient = new ApolloClient({
  link: new HttpLink({
    uri: ULTRASOUND_SUBGRAPH_URL,
  }),
  cache: new InMemoryCache(),
});

// Client for Uniswap price data
export const uniswapClient = new ApolloClient({
  link: new HttpLink({
    uri: UNISWAP_SUBGRAPH_URL,
  }),
  cache: new InMemoryCache(),
});
