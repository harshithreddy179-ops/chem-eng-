/* ──────────────────────────────────────────────────────────────────────────
   Domain types — mirror supabase/migrations/*.sql
   ────────────────────────────────────────────────────────────────────────── */

export type ResourceCategory = "lecture" | "pyq" | "other";

export type ResourceType =
  | "ppt"
  | "pdf"
  | "notes"
  | "pyq"
  | "question_paper"
  | "study_material"
  | "other";

export type Difficulty = "easy" | "medium" | "hard";

export interface AcademicSection {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at?: string;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at?: string;
}

export interface Chapter {
  id: string;
  section_id: string;
  subject_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

export interface Resource {
  id: string;
  section_id: string;
  subject_id: string;
  chapter_id: string | null;
  category: ResourceCategory;
  resource_type: ResourceType;
  title: string;
  label: string | null;
  description: string | null;
  drive_url: string;
  image_url: string | null;
  display_order: number;
  is_trackable: boolean;
  is_published: boolean;
  created_at?: string;
}

export interface Pyq {
  id: string;
  section_id: string | null;
  subject_id: string;
  chapter_id: string | null;
  year: number;
  exam: string;
  question_number: number | null;
  topic: string | null;
  difficulty: Difficulty | null;
  question: string;
  solution: string | null;
  question_image_url: string | null;
  options: string[] | null;
  correct_answer: string | null;
  marks: number | null;
  is_published: boolean;
  created_at?: string;
}

export interface PyqWithRelations extends Pyq {
  subject: Pick<Subject, "id" | "slug" | "name"> | null;
  section: Pick<AcademicSection, "id" | "slug" | "name"> | null;
  related: Resource[];
}

/* ─── Progress ──────────────────────────────────────────────────────────── */

/** A trackable item key, e.g. `chapter:<uuid>` or `resource:<uuid>`. */
export type ProgressKey = `${"chapter" | "resource"}:${string}`;

/* ─── Search ───────────────────────────────────────────────────────────── */

export type SearchKind = "section" | "subject" | "chapter" | "resource" | "pyq";

export interface SearchEntry {
  kind: SearchKind;
  id: string;
  title: string;
  meta: string;
  href: string;
  external?: boolean;
}
