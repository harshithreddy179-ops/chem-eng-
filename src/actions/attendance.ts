"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth";
import type { ActionState } from "./types";

/* Admin writes for attendance configuration. Each call re-verifies admin
   membership server-side; RLS enforces it again in the database. */

const uuid = z.string().uuid();
const optionalUuid = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || uuid.safeParse(v).success, "Invalid selection");
const text = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));
const required = (label: string, max = 200) => z.string().trim().min(1, `${label} is required`).max(max);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date");
const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose a time");
const optionalTime = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^\d{2}:\d{2}(:\d{2})?$/.test(v), "Invalid time");
const weekdayField = z.coerce.number().int().min(1).max(7);
const order = z.coerce.number().int().min(0).max(10000).default(0);
const flag = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");
const classType = z.enum(["lecture", "lab", "tutorial", "other"]);

const later = (a: string, b: string) => b > a;

const schemas = {
  attendance_semesters: z
    .object({
      name: required("Semester name", 80),
      academic_year: required("Academic year", 20),
      group_label: text(120),
      section_id: optionalUuid,
      start_date: date,
      end_date: date,
      batches: z
        .string()
        .optional()
        .transform((v) =>
          (v ?? "")
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
        ),
      target_percent: z.coerce.number().min(1, "1–100").max(100, "1–100"),
      display_order: order,
      is_published: flag,
    })
    .refine((v) => v.end_date >= v.start_date, { path: ["end_date"], message: "End date must be after the start date" }),
  attendance_courses: z.object({
    code: text(20),
    name: required("Course name"),
    subject_id: optionalUuid,
    display_order: order,
  }),
  attendance_schedule: z
    .object({
      course_id: uuid,
      day_of_week: weekdayField,
      start_time: time,
      end_time: time,
      class_type: classType,
      room: text(40),
      faculty: text(80),
      batch: text(20),
    })
    .refine((v) => later(v.start_time, v.end_time), { path: ["end_time"], message: "End time must be after the start time" }),
  attendance_holidays: z.object({ date, name: required("Holiday name", 120) }),
  attendance_special_classes: z
    .object({
      course_id: uuid,
      date,
      start_time: time,
      end_time: time,
      class_type: classType,
      room: text(40),
      batch: text(20),
      notes: text(200),
    })
    .refine((v) => later(v.start_time, v.end_time), { path: ["end_time"], message: "End time must be after the start time" }),
  attendance_overrides: z
    .object({
      date,
      action: z.enum(["cancel", "reschedule", "follow_weekday"]),
      schedule_id: optionalUuid,
      new_date: optionalDate,
      new_start_time: optionalTime,
      new_end_time: optionalTime,
      follow_weekday: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : null))
        .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 7), "Invalid weekday"),
      notes: text(200),
    })
    .superRefine((v, ctx) => {
      if (v.action !== "follow_weekday" && !v.schedule_id)
        ctx.addIssue({ code: "custom", path: ["schedule_id"], message: "Choose the timetable class this applies to" });
      if (v.action === "reschedule" && !v.new_date) ctx.addIssue({ code: "custom", path: ["new_date"], message: "Choose the new date" });
      if (v.new_start_time && v.new_end_time && !later(v.new_start_time, v.new_end_time))
        ctx.addIssue({ code: "custom", path: ["new_end_time"], message: "End time must be after the start time" });
    })
    .transform((v) => ({
      ...v,
      schedule_id: v.action === "follow_weekday" ? null : v.schedule_id,
      follow_weekday: v.action === "follow_weekday" ? v.follow_weekday : null,
      new_date: v.action === "reschedule" ? v.new_date : null,
      new_start_time: v.action === "reschedule" ? v.new_start_time : null,
      new_end_time: v.action === "reschedule" ? v.new_end_time : null,
    })),
  attendance_checkpoints: z
    .object({ label: required("Label", 120), as_of_date: date, resume_date: date })
    .refine((v) => v.resume_date > v.as_of_date, { path: ["resume_date"], message: "Tracking must resume after the notice date" }),
} as const;

export type AttendanceTable = keyof typeof schemas;

function refresh(semesterId?: string) {
  revalidatePath("/tools/attendance");
  revalidatePath("/admin/attendance", "layout");
  if (semesterId) revalidatePath(`/admin/attendance/${semesterId}`);
}

export async function saveAttendanceRecord(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, message: "Not authorised. Please sign in again." };

  const table = String(formData.get("_table")) as AttendanceTable;
  const schema = schemas[table];
  if (!schema) return { ok: false, message: "Unknown record type." };

  const id = String(formData.get("id") ?? "");
  const semesterId = String(formData.get("semester_id") ?? "");
  if (id && !uuid.safeParse(id).success) return { ok: false, message: "Invalid record." };
  if (table !== "attendance_semesters" && !uuid.safeParse(semesterId).success) return { ok: false, message: "Missing semester." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const values: Record<string, unknown> =
    table === "attendance_semesters" ? { ...parsed.data } : { ...parsed.data, semester_id: semesterId };
  const query = id ? ctx.supabase.from(table).update(values).eq("id", id) : ctx.supabase.from(table).insert(values).select("id").single();
  const { data, error } = await query;
  if (error) {
    const msg = error.code === "23505" ? "That already exists (duplicate date or code)." : error.message;
    return { ok: false, message: `Could not save: ${msg}` };
  }

  if (table === "attendance_semesters" && !id && data && "id" in data) {
    refresh();
    redirect(`/admin/attendance/${(data as { id: string }).id}?tab=courses`);
  }
  refresh(table === "attendance_semesters" ? id : semesterId);
  return { ok: true, message: id ? "Saved." : "Added." };
}

export async function deleteAttendanceRecord(formData: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  const parsed = z
    .object({ _table: z.enum(Object.keys(schemas) as [AttendanceTable, ...AttendanceTable[]]), id: uuid, semester_id: z.string().optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await ctx.supabase.from(parsed.data._table).delete().eq("id", parsed.data.id);
  if (parsed.data._table === "attendance_semesters") {
    refresh();
    redirect("/admin/attendance");
  }
  refresh(parsed.data.semester_id);
}
