/* Reading order for a subject's PYQs: newest paper first, papers within a
   year by section order then exam name, questions in number order. Used for
   the previous / next links on a question page. */

export interface PyqOrderRow {
  id: string;
  year: number;
  exam: string;
  question_number: number | null;
  created_at?: string | null;
  section_order?: number | null;
}

export type PyqNavItem = PyqOrderRow & { section_name: string | null };

export function comparePyqs(a: PyqOrderRow, b: PyqOrderRow): number {
  return (
    b.year - a.year ||
    (a.section_order ?? Number.MAX_SAFE_INTEGER) - (b.section_order ?? Number.MAX_SAFE_INTEGER) ||
    a.exam.localeCompare(b.exam) ||
    (a.question_number ?? Number.MAX_SAFE_INTEGER) - (b.question_number ?? Number.MAX_SAFE_INTEGER) ||
    (a.created_at ?? "").localeCompare(b.created_at ?? "") ||
    a.id.localeCompare(b.id)
  );
}

export interface PyqNeighbours<T extends PyqOrderRow> {
  prev: T | null;
  next: T | null;
  position: number; // 1-based, 0 when not found
  total: number;
}

export function neighbours<T extends PyqOrderRow>(rows: readonly T[], id: string): PyqNeighbours<T> {
  const sorted = [...rows].sort(comparePyqs);
  const i = sorted.findIndex((r) => r.id === id);
  if (i < 0) return { prev: null, next: null, position: 0, total: sorted.length };
  return { prev: sorted[i - 1] ?? null, next: sorted[i + 1] ?? null, position: i + 1, total: sorted.length };
}
