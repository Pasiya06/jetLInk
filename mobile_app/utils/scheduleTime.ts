// Helpers to hide bus schedules whose departure time has already passed.
//
// Schedules store:
//   busdate      -> "ANY DATE" (runs every day) or a date like "10/27/2026" (M/D/YYYY)
//   depaturetime -> a time like "08:30 AM", "8:30 pm" or "20:30"
// Passengers pick a travel date like "10/27/2026".

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// "10/27/2026", "2026-10-27" -> Date (local midnight). Anything else -> null
export function parseScheduleDate(value?: string | null): Date | null {
  const text = String(value ?? "").trim();
  if (!text) return null;

  let m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
  if (m) return validDate(Number(m[1]), Number(m[2]), Number(m[3]));

  m = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/.exec(text);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const y = Number(m[3]);
    // App dates are M/D/YYYY; if the first part can't be a month, read it as D/M/YYYY
    return a > 12 ? validDate(y, b, a) : validDate(y, a, b);
  }

  // Text dates such as "Oct 27, 2026" or "Tue Oct 27 2026"
  if (/[a-z]/i.test(text) && /\d{4}/.test(text)) {
    const t = Date.parse(text);
    if (!isNaN(t)) return startOfDay(new Date(t));
  }
  return null;
}

function validDate(y: number, month: number, day: number): Date | null {
  const d = new Date(y, month - 1, day);
  return d.getFullYear() === y && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
}

// "08:30 AM" / "8:30 pm" / "20:30" / "08.30" -> minutes after midnight. Unknown -> null
export function parseTimeToMinutes(value?: string | null): number | null {
  const text = String(value ?? "").trim().toLowerCase().replace(/ | /g, " ");
  const m = /(\d{1,2})[:.](\d{2})\s*(am|pm|a\.m\.|p\.m\.)?/.exec(text);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3]?.replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * True when this schedule can no longer be taken:
 *  - it runs on a fixed date that is before today, or
 *  - it runs today (or the passenger chose today) and the departure time has passed.
 */
export function isSchedulePast(
  schedule: { busdate?: string | null; depaturetime?: string | null },
  travelDate?: string | null,
  now: Date = new Date()
): boolean {
  const today = startOfDay(now);
  const fixedDate = parseScheduleDate(schedule.busdate);
  const day = fixedDate ?? parseScheduleDate(travelDate) ?? today;

  if (day < today) return true;
  if (day > today) return false;

  const dep = parseTimeToMinutes(schedule.depaturetime);
  if (dep == null) return false; // unknown time format: keep it
  return dep <= now.getHours() * 60 + now.getMinutes();
}

/**
 * For admin lists: hide only schedules set for one fixed date that has passed
 * (daily "ANY DATE" schedules stay, because they run again tomorrow).
 */
export function isFixedSchedulePast(
  schedule: { busdate?: string | null; depaturetime?: string | null },
  now: Date = new Date()
): boolean {
  return parseScheduleDate(schedule.busdate) !== null && isSchedulePast(schedule, null, now);
}

// Date -> "YYYY-MM-DD" (used to pass the chosen travel day between screens)
export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Can this schedule still be taken?
 *  - travel day chosen  -> it hasn't left yet on that day
 *  - no day chosen yet  -> it runs on some day from now on
 *                          (daily schedules always count, so the pickup / drop-off
 *                           lists aren't empty late at night)
 */
export function isScheduleUpcoming(
  schedule: { busdate?: string | null; depaturetime?: string | null },
  travelDay?: Date | null,
  now: Date = new Date()
): boolean {
  if (travelDay) return !isSchedulePast(schedule, toDayKey(travelDay), now);
  return !isFixedSchedulePast(schedule, now);
}
