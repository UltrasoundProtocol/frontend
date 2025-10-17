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
