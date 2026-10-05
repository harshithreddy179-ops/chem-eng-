import type { AcademicSection, Subject } from "@/types";

/** GET-form filters for admin lists — works without client JavaScript. */
export function FilterBar({
  sections,
  subjects,
  values,
  extra,
  action,
}: {
  sections: AcademicSection[];
  subjects: Subject[];
  values: Record<string, string | undefined>;
  extra?: React.ReactNode;
  action: string;
}) {
  return (
    <form method="get" action={action} className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto] lg:items-end">
      <label className="block">
        <span className="field-label">Section</span>
        <select name="section" defaultValue={values.section ?? ""} className="field">
          <option value="">All sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="field-label">Subject</span>
        <select name="subject" defaultValue={values.subject ?? ""} className="field">
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {extra ?? <span className="hidden lg:block" />}
      <label className="block">
        <span className="field-label">Search</span>
        <input type="search" name="q" defaultValue={values.q ?? ""} placeholder="Title or topic…" className="field" />
      </label>
      <button type="submit" className="btn-luxe py-3">
        Filter
      </button>
    </form>
  );
}
