import { test } from "node:test";
import assert from "node:assert/strict";
import { allowance, computeStats, getDay, indexSemester, percentOf, whatIf } from "../src/lib/attendance/engine";
import { monthGrid, weekday } from "../src/lib/attendance/dates";
import type { SemesterConfig, StudentSemesterState } from "../src/types/attendance";

const S = "sem";
const slot = (id: string, course: string, day: number, start: string, end: string, extra: Partial<SemesterConfig["schedule"][number]> = {}) => ({
  id, semester_id: S, course_id: course, day_of_week: day, start_time: start + ":00", end_time: end + ":00",
  class_type: "lecture" as const, room: null, faculty: null, batch: null, ...extra,
});

// Mon 5 Oct 2026 … Sun 18 Oct 2026
const config: SemesterConfig = {
  semester: { id: S, section_id: null, name: "Semester 1", academic_year: "2026–27", group_label: null,
    start_date: "2026-10-05", end_date: "2026-10-18", batches: ["L1", "L2"], target_percent: 85, is_published: true, display_order: 0 },
  courses: [
    { id: "math", semester_id: S, code: "MA", name: "Maths", subject_id: null, display_order: 1 },
    { id: "chem", semester_id: S, code: "CY", name: "Chem", subject_id: null, display_order: 2 },
  ],
  schedule: [
    slot("m-mon-1", "math", 1, "09:00", "10:00"),
    slot("m-mon-2", "math", 1, "10:00", "11:00"), // two classes, same subject, same day
    slot("c-mon", "chem", 1, "14:00", "15:00"),
    slot("c-tue-l1", "chem", 2, "11:00", "13:00", { class_type: "lab", batch: "L1" }),
    slot("c-tue-l2", "chem", 2, "14:00", "16:00", { class_type: "lab", batch: "L2" }),
    slot("m-wed", "math", 3, "09:00", "10:00"),
  ],
  holidays: [{ id: "h1", semester_id: S, date: "2026-10-07", name: "Test Holiday" }], // a Wednesday
  specials: [
    { id: "sp1", semester_id: S, course_id: "math", date: "2026-10-10", start_time: "10:00:00", end_time: "11:00:00",
      class_type: "lecture", room: null, batch: null, notes: "Extra Saturday class" },
    { id: "sp2", semester_id: S, course_id: "chem", date: "2026-10-07", start_time: "12:00:00", end_time: "13:00:00",
      class_type: "lecture", room: null, batch: null, notes: null }, // special on a holiday
  ],
  overrides: [
    { id: "o-cancel", semester_id: S, date: "2026-10-12", action: "cancel", schedule_id: "c-mon", new_date: null,
      new_start_time: null, new_end_time: null, follow_weekday: null, notes: null },
    { id: "o-move", semester_id: S, date: "2026-10-12", action: "reschedule", schedule_id: "m-mon-2", new_date: "2026-10-13",
      new_start_time: "17:00:00", new_end_time: "18:00:00", follow_weekday: null, notes: null },
    { id: "o-sat", semester_id: S, date: "2026-10-17", action: "follow_weekday", schedule_id: null, new_date: null,
      new_start_time: null, new_end_time: null, follow_weekday: 1, notes: "Working Saturday" },
    { id: "o-tba", semester_id: S, date: "2026-10-18", action: "follow_weekday", schedule_id: null, new_date: null,
      new_start_time: null, new_end_time: null, follow_weekday: null, notes: "First Year Classes" },
  ],
  checkpoints: [{ id: "cp", semester_id: S, label: "Notice", as_of_date: "2026-10-04", resume_date: "2026-10-12" }],
};
const idx = indexSemester(config);
const st = (over: Partial<StudentSemesterState> = {}): StudentSemesterState => ({ batch: "L1", baseline: {}, marks: {}, start: { kind: "semester" }, ...over });

test("dates: weekdays and Monday-first grid", () => {
  assert.equal(weekday("2026-10-05"), 1);
  assert.equal(weekday("2026-10-11"), 7);
  const g = monthGrid("2026-10"); // 1 Oct 2026 is a Thursday
  assert.equal(g.slice(0, 3).every((c) => c === null), true);
  assert.equal(g[3], "2026-10-01");
  assert.equal(g.length % 7, 0);
});

test("normal day lists classes sorted; multiple classes of one subject", () => {
  const d = getDay(idx, "2026-10-05", "L1");
  assert.equal(d.kind, "academic");
  assert.deepEqual(d.occurrences.map((o) => o.key), ["2026-10-05|t:m-mon-1", "2026-10-05|t:m-mon-2", "2026-10-05|t:c-mon"]);
});

test("batch filter: L1 sees only its lab, null batch sees both", () => {
  assert.deepEqual(getDay(idx, "2026-10-06", "L1").occurrences.map((o) => o.key), ["2026-10-06|t:c-tue-l1"]);
  assert.equal(getDay(idx, "2026-10-06", null).occurrences.length, 2);
});

test("holiday removes timetable but keeps special classes", () => {
  const d = getDay(idx, "2026-10-07", "L1");
  assert.equal(d.kind, "holiday");
  assert.equal(d.holiday, "Test Holiday");
  assert.deepEqual(d.occurrences.map((o) => o.key), ["2026-10-07|x:sp2"]);
});

test("Saturday special class; unscheduled Sunday; outside semester", () => {
  assert.deepEqual(getDay(idx, "2026-10-10", "L1").occurrences.map((o) => o.source), ["special"]);
  assert.equal(getDay(idx, "2026-10-11", "L1").kind, "no-class");
  assert.equal(getDay(idx, "2026-10-04", "L1").kind, "outside");
  assert.equal(getDay(idx, "2026-10-19", "L1").kind, "outside");
});

test("cancel and reschedule overrides", () => {
  const mon = getDay(idx, "2026-10-12", "L1");
  assert.deepEqual(mon.occurrences.map((o) => [o.key, o.cancelledByAdmin]), [
    ["2026-10-12|t:m-mon-1", false],
    ["2026-10-12|t:c-mon", true],
  ]);
  const tue = getDay(idx, "2026-10-13", "L1");
  const moved = tue.occurrences.find((o) => o.source === "rescheduled")!;
  assert.equal(moved.start, "17:00");
  assert.equal(moved.courseId, "math");
});

test("working Saturday follows a weekday; TBA day has no classes", () => {
  const sat = getDay(idx, "2026-10-17", "L1");
  assert.equal(sat.followsWeekday, 1);
  assert.equal(sat.occurrences.length, 3);
  const sun = getDay(idx, "2026-10-18", "L1");
  assert.equal(sun.kind, "tba");
  assert.equal(sun.note, "First Year Classes");
});

test("counting: present/absent count, cancelled/unmarked/future do not", () => {
  const marks = {
    "2026-10-05|t:m-mon-1": "present",
    "2026-10-05|t:m-mon-2": "absent",
    "2026-10-05|t:c-mon": "cancelled",
    "2026-10-06|t:c-tue-l1": "present",
    "2026-10-14|t:m-wed": "present", // future (today = 10 Oct) → not counted
  } as const;
  const s = computeStats(idx, st({ marks: { ...marks } }), "2026-10-10");
  const math = s.courses.get("math")!;
  const chem = s.courses.get("chem")!;
  assert.deepEqual([math.attended, math.held], [1, 2]);
  assert.deepEqual([chem.attended, chem.held, chem.cancelled], [1, 1, 1]);
  assert.deepEqual(s.overall, { attended: 2, held: 3 }); // totals, not averaged
  // unmarked past: chem special on holiday 7 Oct; today's special (10 Oct) is unmarked → remaining
  assert.equal(chem.unmarked, 1);
  assert.equal(percentOf(s.overall)!.toFixed(2), "66.67");
});

test("department-cancelled classes never count even if marked", () => {
  const s = computeStats(idx, st({ marks: { "2026-10-12|t:c-mon": "absent" } }), "2026-10-18");
  assert.equal(s.courses.get("chem")!.held, 0);
});

test("checkpoint baseline + tracking from resume date", () => {
  const s = computeStats(
    idx,
    st({
      start: { kind: "checkpoint", checkpointId: "cp" },
      baseline: { math: { attended: 20, held: 24 } },
      marks: { "2026-10-05|t:m-mon-1": "present", "2026-10-12|t:m-mon-1": "absent" }, // 5 Oct is before resume → ignored
    }),
    "2026-10-18",
  );
  assert.equal(s.trackFrom, "2026-10-12");
  assert.deepEqual([s.courses.get("math")!.attended, s.courses.get("math")!.held], [20, 25]);
});

test("baseline is sanitised (attended ≤ held, no negatives)", () => {
  const s = computeStats(idx, st({ start: { kind: "checkpoint", checkpointId: "cp" }, baseline: { math: { attended: 30, held: -4 } } }), "2026-10-11");
  assert.deepEqual([s.courses.get("math")!.attended, s.courses.get("math")!.held], [0, 0]);
});

test("what-if and 85% allowance", () => {
  const w = whatIf({ attended: 25, held: 29 }); // 86.2%
  assert.equal(w.current!.toFixed(1), "86.2");
  assert.equal(w.ifAttend.toFixed(1), "86.7");
  assert.equal(w.ifMiss.toFixed(1), "83.3");
  assert.deepEqual(allowance({ attended: 26, held: 28 }, 85), { kind: "can-miss", classes: 2 }); // 26/30 = 86.7, 26/31 = 83.9
  assert.deepEqual(allowance({ attended: 17, held: 20 }, 85), { kind: "can-miss", classes: 0 }); // exactly 85%
  assert.deepEqual(allowance({ attended: 16, held: 20 }, 85), { kind: "must-attend", classes: 7, reachable: true }); // 23/27 = 85.2
  assert.deepEqual(allowance({ attended: 16, held: 20 }, 85, 3), { kind: "must-attend", classes: 7, reachable: false });
  assert.deepEqual(allowance({ attended: 0, held: 0 }, 85), { kind: "no-data" });
});
