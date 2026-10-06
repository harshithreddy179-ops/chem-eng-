import type { Chapter, Resource } from "@/types";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";

/** Chapter list — each row has a "done" checkbox. */
export function ChapterChecklist({ chapters, resources, accent = "bg-brand-50 text-brand-700" }: { chapters: Chapter[]; resources: Resource[]; accent?: string }) {
  const counts = resources.reduce<Record<string, number>>((acc, r) => {
    if (r.chapter_id) acc[r.chapter_id] = (acc[r.chapter_id] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <ol className="card divide-y divide-line overflow-hidden">
      {chapters.map((c, i) => (
        <li key={c.id} id={`chapter-${c.id}`} className="flex scroll-mt-40 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 md:px-5">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[15px] font-bold ${accent}`}>{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold leading-snug text-slate-900">
              <span className="text-slate-500">Chapter {i + 1}: </span>
              {c.name}
            </p>
            {c.description && <p className="mt-0.5 text-sm text-slate-500">{c.description}</p>}
            {counts[c.id] ? (
              <p className="mt-0.5 text-sm text-slate-500">
                {counts[c.id]} {counts[c.id] === 1 ? "file" : "files"}
              </p>
            ) : null}
          </div>
          <CompletionCheckbox progressKey={`chapter:${c.id}`} label={c.name} className="self-start sm:self-center" />
        </li>
      ))}
    </ol>
  );
}
