export type MetricKey = 'tvl' | 'apy' | 'deviation';

export interface SeriesPoint {
  x: string | number | Date;
  y: number;
}

export interface Series {
  id: string;
  label: string;
  points: SeriesPoint[];
}

export interface TokenPrice {
  symbol: string;
  price: number;
  changePct: number;
  iconSrc?: string;
}

export type PoolInfoKey = '24h Volume' | 'Pool TVL' | 'Contract Address';

export interface PoolInfoItem {
  label: PoolInfoKey;
  value: string;
  isCopyable?: boolean;
  onCopy?: () => void;
  href?: string;
}

export interface RebalanceRow {
  date: string;
  action: string;
  route: string;
  amount: string;
}

export interface Holding {
  symbol: string;
  qty: number;
  fiat: number;
  iconSrc?: string;
}

export interface RecentTx {
  type: string;
  date: string;
  amount: string;
  asset: string;
}

export interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}
