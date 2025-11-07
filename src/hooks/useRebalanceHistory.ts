import { useEffect, useState } from 'react';
import type { RebalanceRow } from '@/src/features/goldbtc/types';

export interface RebalanceEvent {
  id: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
  amountSwapped: string;
  amountReceived: string;
  newRatio: string;
  beforeAsset0Balance: string;
  beforeAsset1Balance: string;
  afterAsset0Balance: string;
  afterAsset1Balance: string;
  protocolFee: string;
  keeperReward: string;
  keeper: string;
}

interface UseRebalanceHistoryResult {
  rebalanceEvents: RebalanceRow[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and transform rebalance events from the subgraph
 * @param first - Number of events to fetch (default: 10)
 * @returns Formatted rebalance events for display in the table
 */
export function useRebalanceHistory(first: number = 10): UseRebalanceHistoryResult {
  const [rebalanceEvents, setRebalanceEvents] = useState<RebalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rebalances?first=${first}`);

      if (!response.ok) {
        throw new Error('Failed to fetch rebalance events');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const events: RebalanceEvent[] = data.rebalanceEvents || [];

      // Transform raw rebalance events into table rows
      const transformedEvents: RebalanceRow[] = events.map((event) => {
        const timestamp = parseInt(event.timestamp);
        const date = new Date(timestamp * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        // Determine which direction the swap went
        const beforeAsset0 = BigInt(event.beforeAsset0Balance);
        const afterAsset0 = BigInt(event.afterAsset0Balance);
        const beforeAsset1 = BigInt(event.beforeAsset1Balance);
        const afterAsset1 = BigInt(event.afterAsset1Balance);

        const asset0Increased = afterAsset0 > beforeAsset0;
        const amountSwapped = BigInt(event.amountSwapped);
        const amountReceived = BigInt(event.amountReceived);

        // Format the swap direction and amounts
        let route: string;
        let amount: string;

        if (asset0Increased) {
          // PAXG -> WBTC
          route = 'PAXG → WBTC';
          // amountSwapped is in PAXG (8 decimals), amountReceived is in WBTC (8 decimals)
          amount = `${(Number(amountSwapped) / 1e8).toFixed(4)} PAXG`;
        } else {
          // WBTC -> PAXG
          route = 'WBTC → PAXG';
          // amountSwapped is in WBTC (8 decimals), amountReceived is in PAXG (8 decimals)
          amount = `${(Number(amountSwapped) / 1e8).toFixed(4)} WBTC`;
        }

        return {
          date,
          action: 'Rebalance',
          route,
          amount,
        };
      });

      setRebalanceEvents(transformedEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setRebalanceEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [first]);

  return {
    rebalanceEvents,
    loading,
    error,
    refetch: fetchData,
  };
}
