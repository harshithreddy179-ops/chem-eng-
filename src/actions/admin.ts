"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
   Every action re-verifies admin membership on the server before touching
   the database, and the database re-verifies again through RLS.
   ────────────────────────────────────────────────────────────────────────── */

const uuid = z.string().uuid();
const optionalText = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .transform((v) => (v ? v : null));
const httpsUrl = z
  .string()
  .trim()
  .url("Enter a full URL, starting with https://")
  .refine((v) => v.startsWith("https://"), "The link must use https://");
const optionalHttpsUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https:\/\/\S+$/.test(v), "Enter a full https:// URL");
const order = z.coerce.number().int().min(0).max(100000).default(0);
const flag = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((v) => v === "on" || v === "true");

function fieldErrors(error: z.ZodError): ActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
}

async function adminOrError() {
  const ctx = await getAdminContext();
  if (!ctx) return { error: { ok: false, message: "Not authorised. Please sign in again." } as ActionState };
  return { ctx };
}

function refresh() {
  revalidatePath("/", "layout");
}

function dbError(message: string): ActionState {
  return { ok: false, message: `Could not save: ${message}` };
}

/* ─── Resources ──────────────────────────────────────────────────────────── */

const resourceSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  section_id: uuid.or(z.literal("")).refine((v) => v !== "", "Choose a section"),
  subject_id: uuid.or(z.literal("")).refine((v) => v !== "", "Choose a subject"),
  chapter_id: uuid.optional().or(z.literal("").transform(() => null)),
  category: z.enum(["lecture", "pyq", "other"]),
  resource_type: z.enum(["ppt", "pdf", "notes", "pyq", "question_paper", "study_material", "other"]),
  title: z.string().trim().min(1, "A title is required").max(200),
  label: optionalText,
  description: optionalText,
  drive_url: httpsUrl,
  image_url: optionalHttpsUrl,
  display_order: order,
  is_trackable: flag,
  is_published: flag,
});

export async function saveResource(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ctx, error } = await adminOrError();
  if (error) return error;
  const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const { id, ...values } = parsed.data;

  const query = id
    ? ctx.supabase.from("resources").update(values).eq("id", id)
    : ctx.supabase.from("resources").insert(values);
  const { error: dbErr } = await query;
  if (dbErr) return dbError(dbErr.message);

  refresh();
  redirect(`/admin/resources?saved=${id ? "updated" : "created"}`);
}

/* ─── Chapters ───────────────────────────────────────────────────────────── */

const chapterSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  section_id: uuid.or(z.literal("")).refine((v) => v !== "", "Choose a section"),
  subject_id: uuid.or(z.literal("")).refine((v) => v !== "", "Choose a subject"),
  name: z.string().trim().min(1, "A chapter name is required").max(200),
  description: optionalText,
  display_order: order,
  is_published: flag,
});

export async function saveChapter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ctx, error } = await adminOrError();
  if (error) return error;
  const parsed = chapterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const { id, ...values } = parsed.data;

  const query = id ? ctx.supabase.from("chapters").update(values).eq("id", id) : ctx.supabase.from("chapters").insert(values);
  const { error: dbErr } = await query;
  if (dbErr) return dbError(dbErr.message);

  refresh();
  redirect(`/admin/chapters?saved=${id ? "updated" : "created"}`);
}

/* ─── PYQs ───────────────────────────────────────────────────────────────── */

const pyqSchema = z.object({
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  section_id: uuid.optional().or(z.literal("").transform(() => null)),
  subject_id: uuid.or(z.literal("")).refine((v) => v !== "", "Choose a subject"),
  chapter_id: uuid.optional().or(z.literal("").transform(() => null)),
  year: z.coerce.number({ invalid_type_error: "Enter a year" }).int().min(1990, "Year looks wrong").max(2100, "Year looks wrong"),
  exam: z.string().trim().min(1, "Name the exam").max(80),
  question_number: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0 && v < 1000), "Enter a positive whole number"),
  topic: optionalText,
  difficulty: z
    .enum(["easy", "medium", "hard", ""])
    .optional()
    .transform((v) => (v ? v : null)),
  question: z.string().trim().min(1, "The question text is required").max(20000),
  solution: z
    .string()
    .trim()
    .max(40000)
    .optional()
    .transform((v) => (v ? v : null)),
  question_image_url: optionalHttpsUrl,
  options: z
    .string()
    .optional()
    .transform((v) => {
      const list = (v ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      return list.length ? list : null;
    }),
  correct_answer: optionalText,
  marks: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Enter a number"),
  is_published: flag,
});

export async function savePyq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ctx, error } = await adminOrError();
  if (error) return error;
  const raw = Object.fromEntries(formData);
  const parsed = pyqSchema.safeParse(raw);
  if (!parsed.success) return fieldErrors(parsed.error);
  const related = z.array(uuid).safeParse(formData.getAll("related").filter(Boolean));
  if (!related.success) return { ok: false, message: "Related resources contained an invalid id." };

  const { id, ...values } = parsed.data;
  let pyqId = id;
  if (id) {
    const { error: e } = await ctx.supabase.from("pyqs").update(values).eq("id", id);
    if (e) return dbError(e.message);
  } else {
    const { data, error: e } = await ctx.supabase.from("pyqs").insert(values).select("id").single();
    if (e) return dbError(e.message);
    pyqId = data.id as string;
  }

  // Replace the related-material links.
  const { error: delErr } = await ctx.supabase.from("pyq_resources").delete().eq("pyq_id", pyqId);
  if (delErr) return dbError(delErr.message);
  if (related.data.length) {
    const { error: insErr } = await ctx.supabase
      .from("pyq_resources")
      .insert(related.data.map((resource_id) => ({ pyq_id: pyqId, resource_id })));
    if (insErr) return dbError(insErr.message);
  }

  refresh();
  redirect(`/admin/pyqs?saved=${id ? "updated" : "created"}`);
}

/* ─── Delete (resources, chapters, pyqs) ─────────────────────────────────── */

const deletable = z.object({ table: z.enum(["resources", "chapters", "pyqs"]), id: uuid });

export async function deleteRecord(formData: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  const parsed = deletable.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await ctx.supabase.from(parsed.data.table).delete().eq("id", parsed.data.id);
  refresh();
  redirect(`/admin/${parsed.data.table}?saved=deleted`);
}

/* ─── Subjects & sections (configuration) ────────────────────────────────── */

const taxonomySchema = z.object({
  kind: z.enum(["subjects", "academic_sections"]),
  id: uuid.optional().or(z.literal("").transform(() => undefined)),
  name: z.string().trim().min(1, "A name is required").max(120),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? slugify(v) : "")),
  description: optionalText,
  display_order: order,
  is_enabled: flag,
});

export async function saveTaxonomy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ctx, error } = await adminOrError();
  if (error) return error;
  const parsed = taxonomySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const { kind, id, slug, ...values } = parsed.data;
  const finalSlug = slug || slugify(values.name);
  if (!finalSlug) return { ok: false, fieldErrors: { slug: "Could not derive a URL slug" }, message: "Please correct the highlighted fields." };

  const record = { ...values, slug: finalSlug };
  const query = id ? ctx.supabase.from(kind).update(record).eq("id", id) : ctx.supabase.from(kind).insert(record);
  const { error: dbErr } = await query;
  if (dbErr) {
    if (dbErr.code === "23505") return { ok: false, fieldErrors: { slug: "This URL slug is already used" }, message: "That slug is taken." };
    return dbError(dbErr.message);
  }
  refresh();
  return { ok: true, message: id ? "Saved." : "Added." };
}

/** Swap display order with the neighbour above/below. */
export async function moveTaxonomy(formData: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  const parsed = z
    .object({ kind: z.enum(["subjects", "academic_sections"]), id: uuid, direction: z.enum(["up", "down"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { kind, id, direction } = parsed.data;

  const { data } = await ctx.supabase.from(kind).select("id, display_order, name").order("display_order").order("name");
  const rows = (data ?? []) as { id: string; display_order: number }[];
  const i = rows.findIndex((r) => r.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;

  // Normalise to 1..n, then swap.
  const ordered = rows.map((r, idx) => ({ id: r.id, display_order: idx + 1 }));
  [ordered[i].display_order, ordered[j].display_order] = [ordered[j].display_order, ordered[i].display_order];
  await Promise.all(
    ordered
      .filter((r, idx) => r.display_order !== rows[idx].display_order)
      .map((r) => ctx.supabase.from(kind).update({ display_order: r.display_order }).eq("id", r.id)),
  );
  refresh();
}
