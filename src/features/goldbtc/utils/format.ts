export function fmtMoney(n: number, decimals = 2): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function shortAddr(addr: string): string {
  if (addr.length < 10) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

/**
 * Convert a value from subgraph BigDecimal (18 decimals) to number
 * @param value String value with 18 decimals
 * @returns number in human-readable format
 */
export function fromBigDecimal(value: string): number {
  return parseFloat(value) / 1e18;
}

/**
 * Convert USDC amount (6 decimals) to number
 * @param value String value with 6 decimals
 * @returns number in human-readable format
 */
export function fromUSDC(value: string): number {
  return parseFloat(value) / 1e6;
}

/**
 * Convert LP token amount (6 decimals) to number
 * @param value String value with 6 decimals
 * @returns number in human-readable format
 */
export function fromLPToken(value: string): number {
  return parseFloat(value) / 1e6;
}
