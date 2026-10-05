import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcademicSection, Chapter, Pyq, Resource, Subject } from "@/types";

/* Admin reads use the signed-in admin's session, so RLS also returns
   hidden / disabled rows. Always call after requireAdmin(). */

export async function getTaxonomy(db: SupabaseClient) {
  const [sections, subjects] = await Promise.all([
    db.from("academic_sections").select("*").order("display_order").order("name"),
    db.from("subjects").select("*").order("display_order").order("name"),
  ]);
  return {
    sections: (sections.data ?? []) as AcademicSection[],
    subjects: (subjects.data ?? []) as Subject[],
  };
}

export async function getAllChapters(db: SupabaseClient) {
  const { data } = await db.from("chapters").select("*").order("display_order").order("created_at");
  return (data ?? []) as Chapter[];
}

export async function getAllResourcesLite(db: SupabaseClient) {
  const { data } = await db
    .from("resources")
    .select("id, title, label, subject_id, section_id, resource_type, category")
    .order("created_at", { ascending: false });
  return (data ?? []) as Pick<Resource, "id" | "title" | "label" | "subject_id" | "section_id" | "resource_type" | "category">[];
}

async function count(db: SupabaseClient, table: string) {
  const { count: n } = await db.from(table).select("*", { count: "exact", head: true });
  return n ?? 0;
}

export async function getDashboard(db: SupabaseClient) {
  const [resources, pyqs, subjects, sections, chapters, recentResources, recentPyqs] = await Promise.all([
    count(db, "resources"),
    count(db, "pyqs"),
    count(db, "subjects"),
    count(db, "academic_sections"),
    count(db, "chapters"),
    db.from("resources").select("id, title, label, resource_type, created_at, is_published").order("created_at", { ascending: false }).limit(6),
    db.from("pyqs").select("id, year, exam, topic, question_number, created_at, is_published").order("created_at", { ascending: false }).limit(6),
  ]);
  return {
    counts: { resources, pyqs, subjects, sections, chapters },
    recentResources: (recentResources.data ?? []) as Pick<Resource, "id" | "title" | "label" | "resource_type" | "created_at" | "is_published">[],
    recentPyqs: (recentPyqs.data ?? []) as Pick<Pyq, "id" | "year" | "exam" | "topic" | "question_number" | "created_at" | "is_published">[],
  };
}

export interface ListFilters {
  section?: string;
  subject?: string;
  category?: string;
  q?: string;
}

export async function listResources(db: SupabaseClient, f: ListFilters) {
  let query = db.from("resources").select("*").order("created_at", { ascending: false }).limit(500);
  if (f.section) query = query.eq("section_id", f.section);
  if (f.subject) query = query.eq("subject_id", f.subject);
  if (f.category) query = query.eq("category", f.category);
  if (f.q) query = query.ilike("title", `%${f.q.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  return (data ?? []) as Resource[];
}

export async function listChapters(db: SupabaseClient, f: ListFilters) {
  let query = db.from("chapters").select("*").order("display_order").order("created_at").limit(1000);
  if (f.section) query = query.eq("section_id", f.section);
  if (f.subject) query = query.eq("subject_id", f.subject);
  if (f.q) query = query.ilike("name", `%${f.q.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  return (data ?? []) as Chapter[];
}

export async function listPyqs(db: SupabaseClient, f: ListFilters) {
  let query = db.from("pyqs").select("*").order("year", { ascending: false }).order("question_number").limit(500);
  if (f.section) query = query.eq("section_id", f.section);
  if (f.subject) query = query.eq("subject_id", f.subject);
  if (f.q) query = query.or(`topic.ilike.%${f.q.replace(/[%_,()]/g, "")}%,question.ilike.%${f.q.replace(/[%_,()]/g, "")}%`);
  const { data } = await query;
  return (data ?? []) as Pyq[];
}

export async function getOne<T>(db: SupabaseClient, table: "resources" | "chapters" | "pyqs", id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db.from(table).select("*").eq("id", id).maybeSingle();
  return (data ?? null) as T | null;
}

export async function getPyqRelatedIds(db: SupabaseClient, pyqId: string) {
  const { data } = await db.from("pyq_resources").select("resource_id").eq("pyq_id", pyqId);
  return ((data ?? []) as { resource_id: string }[]).map((r) => r.resource_id);
}
