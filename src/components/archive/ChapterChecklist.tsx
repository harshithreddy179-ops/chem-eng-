import type { Chapter, Resource } from "@/types";
import { ChapterIcon } from "./ChapterIcon";

export interface ChapterPyqCounts {
  /** chapter id → year → number of PYQs */
  [chapterId: string]: Record<number, number>;
}

/** Chapter list in the MARKS style: icon, "Ch n" name, and PYQs per year. */
export function ChapterChecklist({
  chapters,
  resources,
  pyqCounts = {},
  examLabel,
}: {
  chapters: Chapter[];
  resources: Resource[];
  pyqCounts?: ChapterPyqCounts;
  examLabel?: string;
  /** Kept for older call sites. */
  accent?: string;
}) {
  const files = resources.reduce<Record<string, number>>((acc, r) => {
    if (r.chapter_id) acc[r.chapter_id] = (acc[r.chapter_id] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <ol className="card divide-y divide-line overflow-hidden">
      {chapters.map((c, i) => {
        const years = Object.entries(pyqCounts[c.id] ?? {})
          .map(([y, n]) => [Number(y), n] as const)
          .sort((a, b) => b[0] - a[0]);
        return (
          <li key={c.id} id={`chapter-${c.id}`} className="flex scroll-mt-40 items-center gap-4 px-4 py-4 md:px-5">
            <ChapterIcon name={c.name} index={i} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-bold leading-snug text-slate-900">
                <span className="text-slate-400">Ch {i + 1}: </span>
                {c.name}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                {years.length > 0 ? (
                  <>
                    {examLabel && <span className="font-medium text-slate-600">{examLabel} »</span>}
                    {years.map(([y, n], k) => (
                      <span key={y} className="flex items-center gap-2">
                        {k > 0 && <span aria-hidden className="text-slate-300">•</span>}
                        <span>
                          {y}: <b className="font-semibold text-slate-700">{n} {n === 1 ? "Q" : "Qs"}</b>
                        </span>
                      </span>
                    ))}
                  </>
                ) : (
                  <span>{files[c.id] ? `${files[c.id]} ${files[c.id] === 1 ? "file" : "files"}` : "No PYQs yet"}</span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
