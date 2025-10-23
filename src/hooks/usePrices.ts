import { useEffect, useState, useMemo } from 'react';

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
  const [pricesData, setPricesData] = useState<PricesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prices');

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const { current, historical } = data;

      if (!current?.wbtcToken || !current?.paxgToken || !current?.bundle) {
        setPricesData(null);
        return;
      }

      const ethPriceUSD = parseFloat(current.bundle.ethPriceUSD);

      // Calculate current prices in USD
      const wbtcPriceUSD = parseFloat(current.wbtcToken.derivedETH) * ethPriceUSD;
      const paxgPriceUSD = parseFloat(current.paxgToken.derivedETH) * ethPriceUSD;

      // Get historical prices
      const wbtcPriceYesterday = historical?.wbtcTokenDayData?.[0]?.priceUSD
        ? parseFloat(historical.wbtcTokenDayData[0].priceUSD)
        : wbtcPriceUSD;

      const paxgPriceYesterday = historical?.paxgTokenDayData?.[0]?.priceUSD
        ? parseFloat(historical.paxgTokenDayData[0].priceUSD)
        : paxgPriceUSD;

      // Calculate 24h price change percentages
      const wbtcChangePct = wbtcPriceYesterday !== 0
        ? ((wbtcPriceUSD - wbtcPriceYesterday) / wbtcPriceYesterday) * 100
        : 0;

      const paxgChangePct = paxgPriceYesterday !== 0
        ? ((paxgPriceUSD - paxgPriceYesterday) / paxgPriceYesterday) * 100
        : 0;

      setPricesData({
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
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPricesData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();

    // Poll every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    pricesData,
    loading,
    error,
  };
}
