import type { AcademicSection, Subject } from "@/types";

/**
 * Structural configuration that mirrors the SQL seed in
 * supabase/migrations. It is used ONLY as a fallback when Supabase
 * environment variables are not configured (e.g. a first local run),
 * so the site still renders its full structure. It contains no content.
 */
export const SEED_SECTIONS: AcademicSection[] = [
  "Midsem 1",
  "Semester 1",
  "Midsem 2",
  "Semester 2",
  "Midsem 3",
  "Semester 3",
  "Midsem 4",
  "Semester 4",
].map((name, i) => ({
  id: `seed-section-${i + 1}`,
  slug: name.toLowerCase().replace(" ", "-"),
  name,
  description: null,
  display_order: i + 1,
  is_enabled: true,
}));

export const SEED_SUBJECTS: Subject[] = [
  ["chemical-process-principles", "Chemical Process Principles", "Material and energy balances — the grammar of the discipline."],
  ["mathematics", "Mathematics", "The language underneath every model and every unit operation."],
  ["chemistry", "Chemistry", "Structure, bonding and reactivity — matter at its smallest scale."],
  ["professional-communication", "Professional Communication", "Writing, speaking and presenting with clarity and intent."],
  ["engineering-thermodynamics", "Engineering Thermodynamics", "Energy, entropy and equilibrium — the laws every process obeys."],
  ["environment-climate", "Environment & Climate", "Systems, sustainability and the responsibility of the engineer."],
].map(([slug, name, description], i) => ({
  id: `seed-subject-${i + 1}`,
  slug,
  name,
  description,
  display_order: i + 1,
  is_enabled: true,
}));
