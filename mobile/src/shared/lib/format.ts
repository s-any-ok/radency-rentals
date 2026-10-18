const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number): string => currencyFormatter.format(value);

const pad = (value: number) => String(value).padStart(2, '0');

/** Local calendar date → "YYYY-MM-DD" (the API's DateOnly format). */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "YYYY-MM-DD" → local Date at midnight (avoids the UTC shift of `new Date('YYYY-MM-DD')`). */
export const parseIsoDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
};

export const todayIsoDate = (): string => toIsoDate(new Date());

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-15" → "Oct 15, 2026" */
export const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '—';
  const date = parseIsoDate(isoDate.slice(0, 10));
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/** ISO timestamp → "Oct 15, 2026, 14:05" in the device's time zone. */
export const formatDateTime = (timestamp: string | null | undefined): string => {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
