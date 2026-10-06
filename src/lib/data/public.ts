import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import { SEED_SECTIONS, SEED_SUBJECTS } from "@/lib/seed";
import type {
  AcademicSection,
  Chapter,
  Difficulty,
  ProgressKey,
  Pyq,
  PyqWithRelations,
  Resource,
  Subject,
} from "@/types";
import { neighbours, type PyqNavItem, type PyqNeighbours, type PyqOrderRow } from "@/lib/pyq-order";

/* All public reads go through the anonymous client and are filtered by
   RLS to published content. Every function degrades gracefully to the
   structural seed (or an empty list) when Supabase is unavailable. */

function warn(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "test") console.warn(`[archive:${scope}]`, (error as Error)?.message ?? error);
}

export const getSections = cache(async (): Promise<AcademicSection[]> => {
  const db = getPublicClient();
  if (!db) return SEED_SECTIONS;
  const { data, error } = await db
    .from("academic_sections")
    .select("*")
    .eq("is_enabled", true)
    .order("display_order")
    .order("name");
  if (error) {
    warn("sections", error);
    return SEED_SECTIONS;
  }
  return data as AcademicSection[];
});

export const getSubjects = cache(async (): Promise<Subject[]> => {
  const db = getPublicClient();
  if (!db) return SEED_SUBJECTS;
  const { data, error } = await db
    .from("subjects")
    .select("*")
    .eq("is_enabled", true)
    .order("display_order")
    .order("name");
  if (error) {
    warn("subjects", error);
    return SEED_SUBJECTS;
  }
  return data as Subject[];
});

export const getSectionBySlug = cache(async (slug: string) => {
  const sections = await getSections();
  return sections.find((s) => s.slug === slug) ?? null;
});

export const getSubjectBySlug = cache(async (slug: string) => {
  const subjects = await getSubjects();
  return subjects.find((s) => s.slug === slug) ?? null;
});

/* ─── Archive index: lightweight rows used for counts & progress ─────────── */

export interface IndexChapter {
  id: string;
  section_id: string;
  subject_id: string;
}
export interface IndexResource {
  id: string;
  section_id: string;
  subject_id: string;
  is_trackable: boolean;
}

export interface ArchiveIndex {
  chapters: IndexChapter[];
  resources: IndexResource[];
}

export const getArchiveIndex = cache(async (): Promise<ArchiveIndex> => {
  const db = getPublicClient();
  if (!db) return { chapters: [], resources: [] };
  const [sections, subjects] = await Promise.all([getSections(), getSubjects()]);
  const sectionIds = new Set(sections.map((s) => s.id));
  const subjectIds = new Set(subjects.map((s) => s.id));

  const [ch, rs] = await Promise.all([
    db.from("chapters").select("id, section_id, subject_id").eq("is_published", true),
    db.from("resources").select("id, section_id, subject_id, is_trackable").eq("is_published", true),
  ]);
  if (ch.error) warn("index:chapters", ch.error);
  if (rs.error) warn("index:resources", rs.error);

  const visible = (r: { section_id: string; subject_id: string }) =>
    sectionIds.has(r.section_id) && subjectIds.has(r.subject_id);

  return {
    chapters: ((ch.data ?? []) as IndexChapter[]).filter(visible),
    resources: ((rs.data ?? []) as IndexResource[]).filter(visible),
  };
});

/** Keys of every trackable item matching the optional scope. */
export function trackableKeys(
  index: ArchiveIndex,
  scope: { sectionId?: string; subjectId?: string } = {},
): ProgressKey[] {
  const match = (r: { section_id: string; subject_id: string }) =>
    (!scope.sectionId || r.section_id === scope.sectionId) && (!scope.subjectId || r.subject_id === scope.subjectId);
  return [
    ...index.chapters.filter(match).map((c) => `chapter:${c.id}` as ProgressKey),
    ...index.resources.filter((r) => r.is_trackable && match(r)).map((r) => `resource:${r.id}` as ProgressKey),
  ];
}

export function resourceCount(index: ArchiveIndex, scope: { sectionId?: string; subjectId?: string } = {}) {
  return index.resources.filter(
    (r) => (!scope.sectionId || r.section_id === scope.sectionId) && (!scope.subjectId || r.subject_id === scope.subjectId),
  ).length;
}

/* ─── Subject page ───────────────────────────────────────────────────────── */

export interface SubjectContent {
  chapters: Chapter[];
  resources: Resource[];
  pyqs: Pyq[];
}

export async function getSubjectContent(sectionId: string, subjectId: string): Promise<SubjectContent> {
  const db = getPublicClient();
  if (!db) return { chapters: [], resources: [], pyqs: [] };
  const [ch, rs, pq] = await Promise.all([
    db
      .from("chapters")
      .select("*")
      .eq("section_id", sectionId)
      .eq("subject_id", subjectId)
      .eq("is_published", true)
      .order("display_order")
      .order("created_at"),
    db
      .from("resources")
      .select("*")
      .eq("section_id", sectionId)
      .eq("subject_id", subjectId)
      .eq("is_published", true)
      .order("display_order")
      .order("created_at"),
    db
      .from("pyqs")
      .select("*")
      .eq("section_id", sectionId)
      .eq("subject_id", subjectId)
      .eq("is_published", true)
      .order("year", { ascending: false })
      .order("question_number", { ascending: true, nullsFirst: false }),
  ]);
  if (ch.error) warn("subject:chapters", ch.error);
  if (rs.error) warn("subject:resources", rs.error);
  if (pq.error) warn("subject:pyqs", pq.error);
  return {
    chapters: (ch.data ?? []) as Chapter[],
    resources: (rs.data ?? []) as Resource[],
    pyqs: (pq.data ?? []) as Pyq[],
  };
}

/* ─── PYQ vault ──────────────────────────────────────────────────────────── */

export interface PyqFilters {
  subject?: string; // slug
  section?: string; // slug
  year?: number;
  exam?: string;
  topic?: string;
  difficulty?: Difficulty;
}

const PYQ_SELECT =
  "*, subject:subjects(id, slug, name), section:academic_sections(id, slug, name), pyq_resources(resource:resources(*))";

type RawPyq = Pyq & {
  subject: PyqWithRelations["subject"];
  section: PyqWithRelations["section"];
  pyq_resources?: { resource: Resource | null }[];
};

function shapePyq(raw: RawPyq): PyqWithRelations {
  const { pyq_resources, ...rest } = raw;
  return {
    ...rest,
    options: Array.isArray(rest.options) ? rest.options : null,
    related: (pyq_resources ?? [])
      .map((r) => r.resource)
      .filter((r): r is Resource => Boolean(r && r.is_published)),
  };
}

async function resolveFilterIds(filters: PyqFilters) {
  const [subject, section] = await Promise.all([
    filters.subject ? getSubjectBySlug(filters.subject) : null,
    filters.section ? getSectionBySlug(filters.section) : null,
  ]);
  return { subjectId: subject?.id, sectionId: section?.id, invalid: Boolean((filters.subject && !subject) || (filters.section && !section)) };
}

export async function getPyqs(filters: PyqFilters = {}, limit = 300): Promise<PyqWithRelations[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { subjectId, sectionId, invalid } = await resolveFilterIds(filters);
  if (invalid) return [];

  let query = db.from("pyqs").select(PYQ_SELECT).eq("is_published", true);
  if (subjectId) query = query.eq("subject_id", subjectId);
  if (sectionId) query = query.eq("section_id", sectionId);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.exam) query = query.eq("exam", filters.exam);
  if (filters.topic) query = query.eq("topic", filters.topic);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

  const { data, error } = await query
    .order("year", { ascending: false })
    .order("question_number", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) {
    warn("pyqs", error);
    return [];
  }
  return (data as RawPyq[]).map(shapePyq);
}

export async function getPyqById(id: string): Promise<PyqWithRelations | null> {
  const db = getPublicClient();
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db.from("pyqs").select(PYQ_SELECT).eq("id", id).eq("is_published", true).maybeSingle();
  if (error) warn("pyq", error);
  return data ? shapePyq(data as RawPyq) : null;
}

/** Previous / next published question in the same subject, in reading order. */
export async function getPyqNeighbours(pyq: Pick<Pyq, "id" | "subject_id">): Promise<PyqNeighbours<PyqNavItem>> {
  const empty = { prev: null, next: null, position: 0, total: 0 };
  const db = getPublicClient();
  if (!db) return empty;
  const { data, error } = await db
    .from("pyqs")
    .select("id, year, exam, question_number, created_at, section:academic_sections(name, display_order)")
    .eq("is_published", true)
    .eq("subject_id", pyq.subject_id)
    .limit(2000);
  if (error) {
    warn("pyq-neighbours", error);
    return empty;
  }
  type Row = Omit<PyqOrderRow, "section_order"> & { section: { name: string; display_order: number } | null };
  const rows: PyqNavItem[] = (data as unknown as Row[]).map(({ section, ...r }) => ({
    ...r,
    section_order: section?.display_order ?? null,
    section_name: section?.name ?? null,
  }));
  return neighbours(rows, pyq.id);
}

export interface PyqFacets {
  years: number[];
  exams: string[];
  topics: string[];
  total: number;
}

export const getPyqFacets = cache(async (): Promise<PyqFacets> => {
  const db = getPublicClient();
  if (!db) return { years: [], exams: [], topics: [], total: 0 };
  const { data, error } = await db.from("pyqs").select("year, exam, topic").eq("is_published", true);
  if (error) {
    warn("facets", error);
    return { years: [], exams: [], topics: [], total: 0 };
  }
  const rows = (data ?? []) as { year: number; exam: string; topic: string | null }[];
  return {
    years: [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a),
    exams: [...new Set(rows.map((r) => r.exam))].sort(),
    topics: [...new Set(rows.map((r) => r.topic).filter((t): t is string => Boolean(t)))].sort(),
    total: rows.length,
  };
});

export const getPyqCountsBySubject = cache(async (): Promise<Record<string, number>> => {
  const db = getPublicClient();
  if (!db) return {};
  const { data, error } = await db.from("pyqs").select("subject_id").eq("is_published", true);
  if (error) {
    warn("pyq-counts", error);
    return {};
  }
  return ((data ?? []) as { subject_id: string }[]).reduce<Record<string, number>>((acc, r) => {
    acc[r.subject_id] = (acc[r.subject_id] ?? 0) + 1;
    return acc;
  }, {});
});

/** Fisher–Yates shuffle (non-mutating). */
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
