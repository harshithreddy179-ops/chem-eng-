import type { Difficulty, ResourceCategory, ResourceType } from "@/types";

export const SITE_NAME = "The Chemical Archive";
export const SITE_TAGLINE = "Your academic space. Everything in one place.";
export const SITE_DESCRIPTION =
  "Lecture material, previous-year questions and study tools for Chemical Engineering students at MNNIT Allahabad — carefully organised for every semester.";
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
  { href: "/archive", label: "Archive" },
  { href: "/pyqs", label: "PYQs" },
  { href: "/tools", label: "Tools" },
] as const;
