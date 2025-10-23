import { useQuery, gql } from '@apollo/client';
import { useMemo } from 'react';
import { uniswapClient } from '@/src/lib/apollo/client';
import { CONTRACTS } from '@/src/lib/config';

// Query for current token prices from Uniswap V3
const PRICES_QUERY = gql`
  query GetTokenPrices(
    $wbtcAddress: String!
    $paxgAddress: String!
  ) {
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

// Query for historical prices (24h ago)
const HISTORICAL_PRICES_QUERY = gql`
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

export interface TokenPrice {
  symbol: string;
  price: number;
  changePct: number;
  priceYesterday: number;
}

export interface PricesData {
  wbtc: TokenPrice;
  paxg: TokenPrice;
  ethPrice: number;
}

export function usePrices() {
  // Get current prices
  const { data: currentData, loading: currentLoading, error: currentError } = useQuery(
    PRICES_QUERY,
    {
      client: uniswapClient,
      variables: {
        wbtcAddress: CONTRACTS.WBTC.toLowerCase(),
        paxgAddress: CONTRACTS.PAXG.toLowerCase(),
      },
      pollInterval: 30000, // Poll every 30 seconds
    }
  );

  // Get historical prices (24h ago)
  const timestamp24hAgo = Math.floor(Date.now() / 1000) - 86400;
  const { data: historicalData, loading: historicalLoading } = useQuery(
    HISTORICAL_PRICES_QUERY,
    {
      client: uniswapClient,
      variables: {
        wbtcAddress: CONTRACTS.WBTC.toLowerCase(),
        paxgAddress: CONTRACTS.PAXG.toLowerCase(),
        timestamp: timestamp24hAgo,
      },
      pollInterval: 300000, // Poll every 5 minutes
    }
  );

  const pricesData = useMemo((): PricesData | null => {
    if (!currentData?.wbtcToken || !currentData?.paxgToken || !currentData?.bundle) {
      return null;
    }

    const ethPriceUSD = parseFloat(currentData.bundle.ethPriceUSD);

    // Calculate current prices in USD
    const wbtcPriceUSD = parseFloat(currentData.wbtcToken.derivedETH) * ethPriceUSD;
    const paxgPriceUSD = parseFloat(currentData.paxgToken.derivedETH) * ethPriceUSD;

    // Get historical prices
    const wbtcPriceYesterday = historicalData?.wbtcTokenDayData?.[0]?.priceUSD
      ? parseFloat(historicalData.wbtcTokenDayData[0].priceUSD)
      : wbtcPriceUSD;

    const paxgPriceYesterday = historicalData?.paxgTokenDayData?.[0]?.priceUSD
      ? parseFloat(historicalData.paxgTokenDayData[0].priceUSD)
      : paxgPriceUSD;

    // Calculate 24h price change percentages
    const wbtcChangePct = wbtcPriceYesterday !== 0
      ? ((wbtcPriceUSD - wbtcPriceYesterday) / wbtcPriceYesterday) * 100
      : 0;

    const paxgChangePct = paxgPriceYesterday !== 0
      ? ((paxgPriceUSD - paxgPriceYesterday) / paxgPriceYesterday) * 100
      : 0;

    return {
      wbtc: {
        symbol: 'WBTC',
        price: wbtcPriceUSD,
        changePct: wbtcChangePct,
        priceYesterday: wbtcPriceYesterday,
      },
      paxg: {
        symbol: 'PAXG',
        price: paxgPriceUSD,
        changePct: paxgChangePct,
        priceYesterday: paxgPriceYesterday,
      },
      ethPrice: ethPriceUSD,
    };
  }, [currentData, historicalData]);

  return {
    pricesData,
    loading: currentLoading || historicalLoading,
    error: currentError,
  };
}
