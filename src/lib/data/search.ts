import "server-only";
import { getPublicClient } from "@/lib/supabase/public";
import { getSections, getSubjects } from "./public";
import { RESOURCE_TYPE_LABEL } from "@/lib/constants";
import type { Resource, SearchEntry } from "@/types";

/** Compact, published-only search index for the ⌘K palette. */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const [sections, subjects] = await Promise.all([getSections(), getSubjects()]);
  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const entries: SearchEntry[] = [
    ...sections.map((s) => ({
      kind: "section" as const,
      id: s.id,
      title: s.name,
      meta: "Academic section",
      href: `/archive/${s.slug}`,
    })),
    ...subjects.map((s) => ({
      kind: "subject" as const,
      id: s.id,
      title: s.name,
      meta: "Subject",
      href: `/subjects/${s.slug}`,
    })),
  ];

  const db = getPublicClient();
  if (!db) return entries;

  const [ch, rs, pq] = await Promise.all([
    db.from("chapters").select("id, name, section_id, subject_id").eq("is_published", true).limit(2000),
    db
      .from("resources")
      .select("id, title, label, resource_type, drive_url, section_id, subject_id")
      .eq("is_published", true)
      .limit(4000),
    db.from("pyqs").select("id, question, topic, year, exam, subject_id").eq("is_published", true).limit(4000),
  ]);

  for (const c of (ch.data ?? []) as { id: string; name: string; section_id: string; subject_id: string }[]) {
    const sec = sectionById.get(c.section_id);
    const sub = subjectById.get(c.subject_id);
    if (!sec || !sub) continue;
    entries.push({
      kind: "chapter",
      id: c.id,
      title: c.name,
      meta: `${sub.name} · ${sec.name}`,
      href: `/archive/${sec.slug}/${sub.slug}#chapter-${c.id}`,
    });
  }

  for (const r of (rs.data ?? []) as Pick<
    Resource,
    "id" | "title" | "label" | "resource_type" | "drive_url" | "section_id" | "subject_id"
  >[]) {
    const sec = sectionById.get(r.section_id);
    const sub = subjectById.get(r.subject_id);
    if (!sec || !sub) continue;
    entries.push({
      kind: "resource",
      id: r.id,
      title: [r.label, r.title].filter(Boolean).join(" — "),
      meta: `${RESOURCE_TYPE_LABEL[r.resource_type]} · ${sub.name} · ${sec.name}`,
      href: r.drive_url,
      external: true,
    });
  }

  for (const q of (pq.data ?? []) as { id: string; question: string; topic: string | null; year: number; exam: string; subject_id: string }[]) {
    const sub = subjectById.get(q.subject_id);
    if (!sub) continue;
    const plain = q.question.replace(/\$\$?[^$]*\$\$?/g, "…").replace(/\s+/g, " ").trim();
    entries.push({
      kind: "pyq",
      id: q.id,
      title: q.topic ? `${q.topic} — ${plain.slice(0, 80)}` : plain.slice(0, 100),
      meta: `${sub.name} · ${q.year} · ${q.exam}`,
      href: `/pyqs/${q.id}`,
    });
  }

  return entries;
}
