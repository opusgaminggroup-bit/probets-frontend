export const money = (value: number, currency = 'MYR') =>
  new Intl.NumberFormat('en-MY', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

export const num = (value: number) =>
  new Intl.NumberFormat('en-MY', { maximumFractionDigits: 2 }).format(value);

export const pct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const time = (iso: string) => new Date(iso).toLocaleString('en-MY');
