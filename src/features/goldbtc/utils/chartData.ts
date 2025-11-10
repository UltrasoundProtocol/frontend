import type { Series } from '../types';
import { fromBigDecimal } from './format';

interface DailySnapshot {
  date: string;
  totalValueLocked: string;
  depositVolume: string;
  withdrawalVolume: string;
  strategyValue: string;
  asset0Balance: string;
  asset1Balance: string;
  asset0Price: string;
  asset1Price: string;
  currentRatio0: string;
  currentRatio1: string;
}

/**
 * Calculate point-to-point APY between two snapshots
 * @param currentStrategyValue Current strategy value
 * @param previousStrategyValue Previous strategy value
 * @param daysDiff Number of days between snapshots (typically 1)
 * @returns Annualized APY percentage
 */
function calculatePointAPY(
  currentStrategyValue: number,
  previousStrategyValue: number,
  daysDiff: number
): number {
  if (previousStrategyValue <= 0 || daysDiff <= 0) {
    return 0;
  }

  const ratio = currentStrategyValue / previousStrategyValue;
  const exponent = 365 / daysDiff;
  return (Math.pow(ratio, exponent) - 1) * 100;
}

/**
 * Calculate ratio deviation from target 50/50 split
 * @param asset0Balance Asset 0 balance
 * @param asset1Balance Asset 1 balance
 * @param asset0Price Asset 0 price in USD
 * @param asset1Price Asset 1 price in USD
 * @returns Deviation percentage from 50/50 target
 */
function calculateRatioDeviation(
  asset0Balance: number,
  asset1Balance: number,
  asset0Price: number,
  asset1Price: number
): number {
  const asset0ValueUSD = asset0Balance * asset0Price;
  const asset1ValueUSD = asset1Balance * asset1Price;
  const totalValue = asset0ValueUSD + asset1ValueUSD;

  if (totalValue <= 0) {
    return 0; // Default to 0% deviation if no value
  }

  const asset0Ratio = asset0ValueUSD / totalValue;
  return Math.abs(asset0Ratio - 0.5) * 100;
}

/**
 * Calculate price deviation between two assets
 * @param snapshots Array of snapshots
 * @param index Current snapshot index
 * @returns Absolute difference in price change percentages
 */
function calculatePriceDeviation(
  snapshots: DailySnapshot[],
  index: number
): number {
  if (index === 0) {
    return 0; // No previous data for first snapshot
  }

  const current = snapshots[index];
  const previous = snapshots[index - 1];

  const currentAsset0Price = fromBigDecimal(current.asset0Price);
  const currentAsset1Price = fromBigDecimal(current.asset1Price);
  const previousAsset0Price = fromBigDecimal(previous.asset0Price);
  const previousAsset1Price = fromBigDecimal(previous.asset1Price);

  if (previousAsset0Price <= 0 || previousAsset1Price <= 0) {
    return 0;
  }

  const asset0PriceChange = ((currentAsset0Price - previousAsset0Price) / previousAsset0Price) * 100;
  const asset1PriceChange = ((currentAsset1Price - previousAsset1Price) / previousAsset1Price) * 100;

  return Math.abs(asset0PriceChange - asset1PriceChange);
}

/**
 * Transform daily snapshots from subgraph into chart series data
 * @param dailySnapshots Array of daily snapshots (ordered by date desc from subgraph)
 * @param metricKey The metric to extract ('tvl', 'apy', 'deviation')
 * @param currentAPY Optional current protocol APY for flat line comparison
 * @returns Series array ready for PerformanceChart component
 */
export function transformDailySnapshotsToChartData(
  dailySnapshots: DailySnapshot[],
  metricKey: 'tvl' | 'apy' | 'deviation',
  currentAPY?: number
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

    case 'apy': {
      const series: Series[] = [];

      // Historical APY (point-to-point)
      const historicalAPY: Series = {
        id: 'historical-apy',
        label: 'Historical APY',
        points: [],
      };

      sortedSnapshots.forEach((snapshot, index) => {
        if (index === 0) {
          // Skip first snapshot (no previous data)
          return;
        }

        const currentSV = fromBigDecimal(snapshot.strategyValue);
        const previousSV = fromBigDecimal(sortedSnapshots[index - 1].strategyValue);

        // Calculate days between snapshots
        const currentDate = parseInt(snapshot.date);
        const previousDate = parseInt(sortedSnapshots[index - 1].date);
        const daysDiff = (currentDate - previousDate) / 86400; // Convert seconds to days

        const apy = calculatePointAPY(currentSV, previousSV, daysDiff);

        historicalAPY.points.push({
          x: formatDate(snapshot.date),
          y: apy,
        });
      });

      series.push(historicalAPY);

      // Current Protocol APY (flat line)
      if (currentAPY !== undefined && sortedSnapshots.length > 0) {
        const currentAPYSeries: Series = {
          id: 'current-apy',
          label: 'Current APY',
          points: sortedSnapshots.map((snapshot) => ({
            x: formatDate(snapshot.date),
            y: currentAPY,
          })),
        };
        series.push(currentAPYSeries);
      }

      return series;
    }

    case 'deviation': {
      const series: Series[] = [];

      // Ratio Deviation
      const ratioDeviation: Series = {
        id: 'ratio-deviation',
        label: 'Ratio Deviation',
        points: [],
      };

      sortedSnapshots.forEach((snapshot) => {
        const asset0Balance = fromBigDecimal(snapshot.asset0Balance);
        const asset1Balance = fromBigDecimal(snapshot.asset1Balance);
        const asset0Price = fromBigDecimal(snapshot.asset0Price);
        const asset1Price = fromBigDecimal(snapshot.asset1Price);

        const deviation = calculateRatioDeviation(
          asset0Balance,
          asset1Balance,
          asset0Price,
          asset1Price
        );

        ratioDeviation.points.push({
          x: formatDate(snapshot.date),
          y: deviation,
        });
      });

      series.push(ratioDeviation);

      // Price Deviation
      const priceDeviation: Series = {
        id: 'price-deviation',
        label: 'Price Deviation',
        points: [],
      };

      sortedSnapshots.forEach((snapshot, index) => {
        const deviation = calculatePriceDeviation(sortedSnapshots, index);

        priceDeviation.points.push({
          x: formatDate(snapshot.date),
          y: deviation,
        });
      });

      series.push(priceDeviation);

      return series;
    }

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
