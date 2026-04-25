export function formatPrice(amount: number | string, currency = 'TND'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return `0,00 ${currency}`;
  return `${n.toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function discountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TN-${ts}-${rand}`;
}
