import type { Chapter, Resource } from "@/types";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import { pad } from "@/lib/utils";

/** The chapter / topic ledger — every row carries a completion checkbox. */
export function ChapterChecklist({ chapters, resources }: { chapters: Chapter[]; resources: Resource[] }) {
  const counts = resources.reduce<Record<string, number>>((acc, r) => {
    if (r.chapter_id) acc[r.chapter_id] = (acc[r.chapter_id] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <ol className="border-t border-line">
      {chapters.map((c, i) => (
        <li
          key={c.id}
          id={`chapter-${c.id}`}
          className="group grid scroll-mt-32 grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-6 transition-colors duration-700 hover:bg-ivory/[0.02] md:grid-cols-[4rem_1fr_auto] md:items-center md:gap-x-8"
        >
          <span className="font-sans text-xs tabular tracking-[0.2em] text-ivory-500 transition-colors duration-500 group-hover:text-bronze">
            {pad(i + 1)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl font-light leading-tight md:text-[1.75rem]">
              <span className="text-ivory-400">Chapter {i + 1} — </span>
              {c.name}
            </p>
            {c.description && <p className="mt-1.5 font-sans text-sm leading-relaxed text-ivory-400">{c.description}</p>}
            {counts[c.id] ? (
              <p className="mt-2 font-sans text-[0.6rem] uppercase tracking-[0.22em] text-ivory-500">
                {counts[c.id]} linked {counts[c.id] === 1 ? "resource" : "resources"}
              </p>
            ) : null}
          </div>
          <div className="col-start-2 mt-3 md:col-start-auto md:mt-0">
            <CompletionCheckbox progressKey={`chapter:${c.id}`} label={c.name} />
          </div>
        </li>
      ))}
    </ol>
  );
}
