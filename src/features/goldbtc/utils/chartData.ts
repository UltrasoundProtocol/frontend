import type { Series } from '../types';
import { fromBigDecimal } from './format';

interface DailySnapshot {
  date: string;
  totalValueLocked: string;
  depositVolume: string;
  withdrawalVolume: string;
}

/**
 * Transform daily snapshots from subgraph into chart series data
 * @param dailySnapshots Array of daily snapshots (ordered by date desc from subgraph)
 * @param metricKey The metric to extract ('tvl', 'apy', 'deviation')
 * @returns Series array ready for PerformanceChart component
 */
export function transformDailySnapshotsToChartData(
  dailySnapshots: DailySnapshot[],
  metricKey: 'tvl' | 'apy' | 'deviation'
): Series[] {
  if (!dailySnapshots || dailySnapshots.length === 0) {
    return [];
  }

  // Reverse the array since subgraph returns desc order, but we want chronological for chart
  const sortedSnapshots = [...dailySnapshots].reverse();

  switch (metricKey) {
    case 'tvl':
      return [
        {
          id: 'tvl',
          label: 'TVL',
          points: sortedSnapshots.map((snapshot) => ({
            x: formatDate(snapshot.date),
            y: fromBigDecimal(snapshot.totalValueLocked),
          })),
        },
      ];

    case 'apy':
      // APY calculation would require strategy value data
      // For now, return empty array
      return [];

    case 'deviation':
      // Deviation would require historical balance data
      // For now, return empty array
      return [];

    default:
      return [];
  }
}

/**
 * Format timestamp to short date string (e.g., "Jan 15")
 * @param timestamp Unix timestamp in seconds (string)
 * @returns Formatted date string
 */
function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Extract x-axis labels from daily snapshots
 * @param dailySnapshots Array of daily snapshots
 * @returns Array of formatted date strings
 */
export function extractChartLabels(dailySnapshots: DailySnapshot[]): string[] {
  if (!dailySnapshots || dailySnapshots.length === 0) {
    return [];
  }

  // Reverse to get chronological order
  const sortedSnapshots = [...dailySnapshots].reverse();
  return sortedSnapshots.map((snapshot) => formatDate(snapshot.date));
}
