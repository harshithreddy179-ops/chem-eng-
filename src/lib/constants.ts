import type { Difficulty, ResourceCategory, ResourceType } from "@/types";

export const SITE_NAME = "The Chemical Archive";
export const SITE_TAGLINE = "Notes, PYQs and study tools for Chemical Engineering, all in one place.";
export const SITE_DESCRIPTION =
  "Lecture notes, previous year questions (PYQs) and study tools for Chemical Engineering students at MNNIT Allahabad, sorted by exam and subject.";
export const INSTITUTION = "MNNIT Allahabad";

export const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string; heading: string }[] = [
  { value: "lecture", label: "Lectures & Study Material", heading: "Lectures & Study Material" },
  { value: "pyq", label: "PYQs", heading: "Previous Year Questions" },
  { value: "other", label: "Other", heading: "Further Resources" },
];

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "ppt", label: "PPT" },
  { value: "pdf", label: "PDF" },
  { value: "notes", label: "Notes" },
  { value: "pyq", label: "PYQ" },
  { value: "question_paper", label: "Question Paper" },
  { value: "study_material", label: "Study Material" },
  { value: "other", label: "Other" },
];

export const RESOURCE_TYPE_LABEL = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.value, t.label])) as Record<
  ResourceType,
  string
>;

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const EXAM_PRESETS = ["Mid Semester", "End Semester", "Class Test", "Quiz", "Supplementary"];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Study Material" },
  { href: "/pyqs", label: "PYQs" },
  { href: "/pyqs/practice", label: "Practice" },
  { href: "/tools", label: "Tools" },
] as const;

/** The nav link that matches a path best (longest prefix wins). */
export function activeNavHref(pathname: string): string | null {
  let best: string | null = null;
  for (const { href } of NAV_LINKS) {
    const hit = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    if (hit && (!best || href.length > best.length)) best = href;
  }
  return best;
}
