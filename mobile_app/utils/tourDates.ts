// Tour booking date helpers. Tour dates use "MM/DD/YYYY".

export const MIN_DAYS_AHEAD = 7;

export const formatMMDDYYYY = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;

export const parseMMDDYYYY = (value: string): Date | null => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  if (d.getMonth() !== Number(m[1]) - 1 || d.getDate() !== Number(m[2])) return null;
  return d;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

// Earliest date a tour can start: today + 7 days
export const earliestTourDate = () => addDays(new Date(), MIN_DAYS_AHEAD);

export const isTooSoon = (d: Date) => d.getTime() < earliestTourDate().getTime();

// "2D / 1N" → 2, "3 days" → 3, otherwise 1 (same rule as the backend)
export const parseTripDays = (tripDuration?: string | string[]) => {
  const text = String(tripDuration ?? "");
  const dayMatch = /(\d+)\s*(d\b|day)/i.exec(text);
  const n = dayMatch ? Number(dayMatch[1]) : Number((/(\d+)/.exec(text) || [])[1]);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 30) : 1;
};
