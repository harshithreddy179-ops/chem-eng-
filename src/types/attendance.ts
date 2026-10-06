/* Attendance configuration — mirrors supabase/migrations/20261006000000_attendance.sql */

export type ClassType = "lecture" | "lab" | "tutorial" | "other";
export type OverrideAction = "cancel" | "reschedule" | "follow_weekday";

/** ISO date "YYYY-MM-DD" (calendar date, no time zone). */
export type ISODate = string;

export interface AttendanceCourse {
  id: string;
  semester_id: string;
  code: string | null;
  name: string;
  subject_id: string | null;
  display_order: number;
}

export interface ScheduleSlot {
  id: string;
  semester_id: string;
  course_id: string;
  day_of_week: number; // 1 = Monday … 7 = Sunday
  start_time: string; // "HH:MM" or "HH:MM:SS"
  end_time: string;
  class_type: ClassType;
  room: string | null;
  faculty: string | null;
  batch: string | null;
}

export interface Holiday {
  id: string;
  semester_id: string;
  date: ISODate;
  name: string;
}

export interface SpecialClass {
  id: string;
  semester_id: string;
  course_id: string;
  date: ISODate;
  start_time: string;
  end_time: string;
  class_type: ClassType;
  room: string | null;
  batch: string | null;
  notes: string | null;
}

export interface ScheduleOverride {
  id: string;
  semester_id: string;
  date: ISODate;
  action: OverrideAction;
  schedule_id: string | null;
  new_date: ISODate | null;
  new_start_time: string | null;
  new_end_time: string | null;
  follow_weekday: number | null;
  notes: string | null;
}

export interface Checkpoint {
  id: string;
  semester_id: string;
  label: string;
  as_of_date: ISODate;
  resume_date: ISODate;
}

export interface AttendanceSemester {
  id: string;
  section_id: string | null;
  name: string;
  academic_year: string;
  group_label: string | null;
  start_date: ISODate;
  end_date: ISODate;
  batches: string[];
  target_percent: number;
  is_published: boolean;
  display_order: number;
}

/** Everything needed to generate a semester's calendar. */
export interface SemesterConfig {
  semester: AttendanceSemester;
  courses: AttendanceCourse[];
  schedule: ScheduleSlot[];
  holidays: Holiday[];
  specials: SpecialClass[];
  overrides: ScheduleOverride[];
  checkpoints: Checkpoint[];
}

/* ─── Student-side (local) ──────────────────────────────────────────────── */

export type MarkStatus = "present" | "absent" | "cancelled";

export interface Baseline {
  attended: number;
  held: number;
}

export interface StudentSemesterState {
  /** Lab batch, e.g. "L1". null = show every batch. */
  batch: string | null;
  /** How tracking starts. undefined = not chosen yet. */
  start?: { kind: "semester" } | { kind: "checkpoint"; checkpointId: string };
  /** Figures from the official notice, per course id. */
  baseline: Record<string, Baseline>;
  /** Marks keyed by occurrence key. */
  marks: Record<string, MarkStatus>;
  /** Target percentage, e.g. 85. */
  target?: number;
}
