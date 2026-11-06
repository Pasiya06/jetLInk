// Dates in the app are saved as "MM/DD/YYYY" text in Sri Lanka time.
// These helpers compare them as whole days in Asia/Colombo, so the result is
// the same wherever the server runs (laptop, cloud server in another country...).

export const TIME_ZONE = "Asia/Colombo";

const toDay = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000);

/** "MM/DD/YYYY" -> day number, or null if the text isn't a valid date */
export const dayNumber = (text) => {
  const [m, d, y] = String(text || "").split("/").map(Number);
  if (!m || !d || !y) return null;
  return toDay(y, m, d);
};

/** Today's day number in Sri Lanka */
export const todayInSriLanka = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return toDay(get("year"), get("month"), get("day"));
};
