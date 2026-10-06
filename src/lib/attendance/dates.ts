import type { ISODate } from "@/types/attendance";

/* Calendar-date helpers. Dates are plain "YYYY-MM-DD" strings handled in
   UTC arithmetic, so no time-zone shift can move a class to another day. */

export function parseISO(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

export function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

/** The visitor's local "today" as an ISO date. */
export function todayISO(now = new Date()): ISODate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(d: ISODate, n: number): ISODate {
  const date = parseISO(d);
  date.setUTCDate(date.getUTCDate() + n);
  return toISO(date);
}

/** 1 = Monday … 7 = Sunday */
export function weekday(d: ISODate): number {
  const w = parseISO(d).getUTCDay();
  return w === 0 ? 7 : w;
}

export function eachDay(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function monthKey(d: ISODate) {
  return d.slice(0, 7);
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + n, 1));
  return toISO(date).slice(0, 7);
}

/** Calendar grid for a month (Monday-first), padded with nulls. */
export function monthGrid(month: string): (ISODate | null)[] {
  const first = `${month}-01`;
  const lead = weekday(first) - 1;
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (ISODate | null)[] = Array(lead).fill(null);
  for (let i = 1; i <= days; i++) cells.push(`${month}-${String(i).padStart(2, "0")}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const weekdayName = (n: number) => WEEKDAYS[n - 1] ?? "";
export const weekdayShort = (n: number) => WEEKDAYS[n - 1]?.slice(0, 3) ?? "";
export const monthName = (month: string) => MONTHS[Number(month.slice(5, 7)) - 1] ?? "";

export function formatLong(d: ISODate) {
  return `${weekdayName(weekday(d))}, ${Number(d.slice(8))} ${monthName(d.slice(0, 7))} ${d.slice(0, 4)}`;
}

export function formatShort(d: ISODate) {
  return `${Number(d.slice(8))} ${monthName(d.slice(0, 7)).slice(0, 3)}`;
}

/** "09:00:00" → "09:00" */
export const hhmm = (t: string) => t.slice(0, 5);
