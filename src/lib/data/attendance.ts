import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AttendanceCourse,
  AttendanceSemester,
  Checkpoint,
  Holiday,
  ScheduleOverride,
  ScheduleSlot,
  SemesterConfig,
  SpecialClass,
} from "@/types/attendance";

/** Loads full configs for the given semesters (or all visible ones). */
export async function loadSemesterConfigs(db: SupabaseClient, onlyPublished: boolean): Promise<SemesterConfig[]> {
  let semQuery = db.from("attendance_semesters").select("*").order("display_order").order("start_date", { ascending: false });
  if (onlyPublished) semQuery = semQuery.eq("is_published", true);
  const sem = await semQuery;
  if (sem.error) {
    console.warn("[attendance:semesters]", sem.error.message);
    return [];
  }
  const semesters = (sem.data ?? []) as AttendanceSemester[];
  if (semesters.length === 0) return [];
  const ids = semesters.map((s) => s.id);

  const [courses, schedule, holidays, specials, overrides, checkpoints] = await Promise.all([
    db.from("attendance_courses").select("*").in("semester_id", ids).order("display_order").order("name"),
    db.from("attendance_schedule").select("*").in("semester_id", ids).order("day_of_week").order("start_time"),
    db.from("attendance_holidays").select("*").in("semester_id", ids).order("date"),
    db.from("attendance_special_classes").select("*").in("semester_id", ids).order("date").order("start_time"),
    db.from("attendance_overrides").select("*").in("semester_id", ids).order("date"),
    db.from("attendance_checkpoints").select("*").in("semester_id", ids).order("as_of_date"),
  ]);
  for (const r of [courses, schedule, holidays, specials, overrides, checkpoints]) {
    if (r.error) console.warn("[attendance]", r.error.message);
  }
  const by = <T extends { semester_id: string }>(rows: T[] | null, id: string) => (rows ?? []).filter((r) => r.semester_id === id);

  return semesters.map((semester) => ({
    semester: { ...semester, batches: semester.batches ?? [], target_percent: Number(semester.target_percent) },
    courses: by(courses.data as AttendanceCourse[], semester.id),
    schedule: by(schedule.data as ScheduleSlot[], semester.id),
    holidays: by(holidays.data as Holiday[], semester.id),
    specials: by(specials.data as SpecialClass[], semester.id),
    overrides: by(overrides.data as ScheduleOverride[], semester.id),
    checkpoints: by(checkpoints.data as Checkpoint[], semester.id),
  }));
}

export const getPublishedSemesterConfigs = cache(async (): Promise<SemesterConfig[]> => {
  const db = getPublicClient();
  if (!db) return [];
  return loadSemesterConfigs(db, true);
});
