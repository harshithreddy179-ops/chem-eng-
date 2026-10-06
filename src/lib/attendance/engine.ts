import type {
  Baseline,
  ClassType,
  ISODate,
  MarkStatus,
  ScheduleSlot,
  SemesterConfig,
  StudentSemesterState,
} from "@/types/attendance";
import { addDays, formatShort, hhmm, weekday } from "./dates";

/* ──────────────────────────────────────────────────────────────────────────
   Attendance engine — pure functions, no React, no storage.

   Counting rule (used everywhere: subject, semester, overall, predictions):
     PRESENT   → held + 1, attended + 1
     ABSENT    → held + 1
     CANCELLED → nothing
     holidays, unscheduled days, unmarked classes, future classes → nothing
   Percent = attended ÷ held × 100 (totals, never an average of percents).
   ────────────────────────────────────────────────────────────────────────── */

export interface Occurrence {
  /** Stable key used to store the student's mark. */
  key: string;
  date: ISODate;
  courseId: string;
  start: string;
  end: string;
  classType: ClassType;
  room: string | null;
  faculty: string | null;
  batch: string | null;
  source: "timetable" | "special" | "rescheduled";
  /** Cancelled by the department (admin override) — never counted. */
  cancelledByAdmin: boolean;
  note: string | null;
}

export type DayKind = "outside" | "holiday" | "academic" | "no-class" | "tba";

export interface DayInfo {
  date: ISODate;
  kind: DayKind;
  holiday: string | null;
  /** Note on a day rule, e.g. "First Year Classes". */
  note: string | null;
  /** Weekday whose timetable runs today when it differs from the real one. */
  followsWeekday: number | null;
  occurrences: Occurrence[];
}

export interface SemesterIndex {
  config: SemesterConfig;
  holidays: Map<ISODate, string>;
  scheduleByDay: Map<number, ScheduleSlot[]>;
  slotById: Map<string, ScheduleSlot>;
  specialsByDate: Map<ISODate, SemesterConfig["specials"]>;
  dayRules: Map<ISODate, SemesterConfig["overrides"][number]>;
  cancels: Map<string, SemesterConfig["overrides"][number]>; // `${date}|${slotId}`
  movedOut: Map<string, SemesterConfig["overrides"][number]>; // `${date}|${slotId}`
  movedIn: Map<ISODate, SemesterConfig["overrides"]>;
}

const push = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
};

export function indexSemester(config: SemesterConfig): SemesterIndex {
  const index: SemesterIndex = {
    config,
    holidays: new Map(config.holidays.map((h) => [h.date, h.name])),
    scheduleByDay: new Map(),
    slotById: new Map(config.schedule.map((s) => [s.id, s])),
    specialsByDate: new Map(),
    dayRules: new Map(),
    cancels: new Map(),
    movedOut: new Map(),
    movedIn: new Map(),
  };
  for (const slot of config.schedule) push(index.scheduleByDay, slot.day_of_week, slot);
  for (const sp of config.specials) push(index.specialsByDate, sp.date, sp);
  for (const o of config.overrides) {
    if (o.action === "follow_weekday") index.dayRules.set(o.date, o);
    else if (o.action === "cancel" && o.schedule_id) index.cancels.set(`${o.date}|${o.schedule_id}`, o);
    else if (o.action === "reschedule" && o.schedule_id && o.new_date) {
      index.movedOut.set(`${o.date}|${o.schedule_id}`, o);
      push(index.movedIn, o.new_date, o);
    }
  }
  return index;
}

const inBatch = (rowBatch: string | null, batch: string | null) => !rowBatch || !batch || rowBatch === batch;

/** Classes and status of one calendar day for a student in `batch`. */
export function getDay(index: SemesterIndex, date: ISODate, batch: string | null): DayInfo {
  const { semester } = index.config;
  const base = { date, holiday: null, note: null, followsWeekday: null, occurrences: [] as Occurrence[] };
  if (date < semester.start_date || date > semester.end_date) return { ...base, kind: "outside" };

  const occurrences: Occurrence[] = [];
  const holiday = index.holidays.get(date) ?? null;
  const rule = index.dayRules.get(date);

  // Weekly timetable — skipped entirely on holidays.
  let kind: DayKind = "academic";
  let followsWeekday: number | null = null;
  if (holiday) kind = "holiday";
  else {
    let day = weekday(date);
    if (rule) {
      if (rule.follow_weekday == null) kind = "tba";
      else {
        day = rule.follow_weekday;
        if (day !== weekday(date)) followsWeekday = day;
      }
    }
    if (kind !== "tba") {
      for (const slot of index.scheduleByDay.get(day) ?? []) {
        if (!inBatch(slot.batch, batch)) continue;
        if (index.movedOut.has(`${date}|${slot.id}`)) continue;
        const cancelled = index.cancels.get(`${date}|${slot.id}`);
        occurrences.push({
          key: `${date}|t:${slot.id}`,
          date,
          courseId: slot.course_id,
          start: hhmm(slot.start_time),
          end: hhmm(slot.end_time),
          classType: slot.class_type,
          room: slot.room,
          faculty: slot.faculty,
          batch: slot.batch,
          source: "timetable",
          cancelledByAdmin: Boolean(cancelled),
          note: cancelled ? cancelled.notes || "Cancelled by the department" : null,
        });
      }
    }
  }

  // Rescheduled into this date and special classes apply even on holidays.
  for (const o of index.movedIn.get(date) ?? []) {
    const slot = o.schedule_id ? index.slotById.get(o.schedule_id) : undefined;
    if (!slot || !inBatch(slot.batch, batch)) continue;
    occurrences.push({
      key: `${date}|r:${o.id}`,
      date,
      courseId: slot.course_id,
      start: hhmm(o.new_start_time ?? slot.start_time),
      end: hhmm(o.new_end_time ?? slot.end_time),
      classType: slot.class_type,
      room: slot.room,
      faculty: slot.faculty,
      batch: slot.batch,
      source: "rescheduled",
      cancelledByAdmin: false,
      note: o.notes || `Rescheduled from ${formatShort(o.date)}`,
    });
  }
  for (const sp of index.specialsByDate.get(date) ?? []) {
    if (!inBatch(sp.batch, batch)) continue;
    occurrences.push({
      key: `${date}|x:${sp.id}`,
      date,
      courseId: sp.course_id,
      start: hhmm(sp.start_time),
      end: hhmm(sp.end_time),
      classType: sp.class_type,
      room: sp.room,
      faculty: null,
      batch: sp.batch,
      source: "special",
      cancelledByAdmin: false,
      note: sp.notes || "Special class",
    });
  }

  occurrences.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
  if (kind === "academic" && occurrences.length === 0) kind = "no-class";
  return { date, kind, holiday, note: rule?.notes ?? null, followsWeekday, occurrences };
}

/* ─── Statistics ─────────────────────────────────────────────────────────── */

export interface Tally {
  attended: number;
  held: number;
}

export interface CourseStats extends Tally {
  courseId: string;
  baseline: Baseline;
  present: number;
  absent: number;
  cancelled: number;
  /** Past classes in the tracked period with no mark yet. */
  unmarked: number;
  /** Classes from today onward not yet counted (excludes cancelled). */
  remaining: number;
  history: { date: ISODate; key: string; status: MarkStatus | "unmarked" | "dept-cancelled"; start: string }[];
}

export interface SemesterStats {
  trackFrom: ISODate;
  courses: Map<string, CourseStats>;
  overall: Tally;
  unmarked: number;
}

export function trackingStart(index: SemesterIndex, state: StudentSemesterState): ISODate {
  const { semester, checkpoints } = index.config;
  if (state.start?.kind === "checkpoint") {
    const id = state.start.checkpointId;
    const cp = checkpoints.find((c) => c.id === id);
    if (cp) return cp.resume_date > semester.start_date ? cp.resume_date : semester.start_date;
  }
  return semester.start_date;
}

export function computeStats(index: SemesterIndex, state: StudentSemesterState, today: ISODate): SemesterStats {
  const { semester, courses: courseList } = index.config;
  const useBaseline = state.start?.kind === "checkpoint";
  const trackFrom = trackingStart(index, state);

  const courses = new Map<string, CourseStats>();
  for (const c of courseList) {
    const b = useBaseline ? sanitizeBaseline(state.baseline[c.id]) : { attended: 0, held: 0 };
    courses.set(c.id, {
      courseId: c.id,
      baseline: b,
      attended: b.attended,
      held: b.held,
      present: 0,
      absent: 0,
      cancelled: 0,
      unmarked: 0,
      remaining: 0,
      history: [],
    });
  }

  let unmarked = 0;
  for (let d = trackFrom; d <= semester.end_date; d = addDays(d, 1)) {
    const day = getDay(index, d, state.batch);
    for (const occ of day.occurrences) {
      const s = courses.get(occ.courseId);
      if (!s) continue;
      if (occ.cancelledByAdmin) {
        if (d <= today) s.history.push({ date: d, key: occ.key, status: "dept-cancelled", start: occ.start });
        continue;
      }
      const mark = state.marks[occ.key];
      if (d < today || (d === today && mark)) {
        if (mark === "present") {
          s.present++;
          s.attended++;
          s.held++;
        } else if (mark === "absent") {
          s.absent++;
          s.held++;
        } else if (mark === "cancelled") s.cancelled++;
        else {
          s.unmarked++;
          unmarked++;
        }
        s.history.push({ date: d, key: occ.key, status: mark ?? "unmarked", start: occ.start });
      } else if (mark !== "cancelled") {
        s.remaining++;
      }
    }
  }

  const overall = [...courses.values()].reduce<Tally>(
    (acc, c) => ({ attended: acc.attended + c.attended, held: acc.held + c.held }),
    { attended: 0, held: 0 },
  );
  return { trackFrom, courses, overall, unmarked };
}

function sanitizeBaseline(b?: Baseline): Baseline {
  const held = Math.max(0, Math.floor(Number(b?.held) || 0));
  const attended = Math.min(held, Math.max(0, Math.floor(Number(b?.attended) || 0)));
  return { attended, held };
}

/* ─── Predictions ────────────────────────────────────────────────────────── */

export function percentOf(t: Tally): number | null {
  return t.held > 0 ? (t.attended / t.held) * 100 : null;
}

export function whatIf(t: Tally) {
  return {
    current: percentOf(t),
    ifAttend: ((t.attended + 1) / (t.held + 1)) * 100,
    ifMiss: (t.attended / (t.held + 1)) * 100,
  };
}

export type Allowance =
  | { kind: "can-miss"; classes: number }
  | { kind: "must-attend"; classes: number; reachable: boolean }
  | { kind: "no-data" };

/**
 * How many classes can be missed while staying at or above `target`%,
 * or how many consecutive classes must be attended to get back to it.
 * `remaining` bounds what is achievable within the semester.
 */
export function allowance(t: Tally, targetPercent: number, remaining = Infinity): Allowance {
  if (t.held === 0) return { kind: "no-data" };
  const target = Math.min(Math.max(targetPercent, 0), 100) / 100;
  const eps = 1e-9;
  if (t.attended / t.held + eps >= target) {
    if (target === 0) return { kind: "can-miss", classes: Math.min(remaining, Number.MAX_SAFE_INTEGER) };
    const k = Math.floor(t.attended / target - t.held + eps);
    return { kind: "can-miss", classes: Math.max(0, Math.min(k, remaining)) };
  }
  if (target >= 1) return { kind: "must-attend", classes: Infinity, reachable: false };
  const n = Math.ceil((target * t.held - t.attended) / (1 - target) - eps);
  return { kind: "must-attend", classes: n, reachable: n <= remaining };
}

export function formatPercent(p: number | null, digits = 1) {
  if (p == null || !Number.isFinite(p)) return "—";
  return p.toFixed(digits);
}
