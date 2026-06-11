export function formatKes(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatShortKes(value: number) {
  if (value >= 1000000) {
    return `KES ${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
  }

  return formatKes(value);
}

export function readableDate(value: string) {
  return new Intl.DateTimeFormat('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
