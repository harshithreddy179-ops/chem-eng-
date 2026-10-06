import type { Chapter, Resource } from "@/types";
import { ResourceItem } from "./ResourceItem";
import { EmptyState } from "@/components/ui/EmptyState";

interface ResourceListProps {
  id: string;
  /** Kept for older call sites; not shown. */
  index?: string;
  title: string;
  icon?: React.ReactNode;
  resources: Resource[];
  chapters: Chapter[];
  emptyTitle: string;
  emptyMessage: string;
}

/** A titled list of files. */
export function ResourceList({ id, title, icon, resources, chapters, emptyTitle, emptyMessage }: ResourceListProps) {
  const chapterName = new Map(chapters.map((c) => [c.id, c.name]));
  return (
    <section aria-labelledby={id} className="min-w-0 scroll-mt-40" id={`${id}-section`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={id} className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
          {icon}
          {title}
        </h2>
        <span className="chip bg-slate-100 text-slate-600 tabular">
          {resources.length} {resources.length === 1 ? "file" : "files"}
        </span>
      </div>
      {resources.length === 0 ? (
        <EmptyState compact title={emptyTitle} message={emptyMessage} />
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id}>
              <ResourceItem resource={r} chapterName={r.chapter_id ? chapterName.get(r.chapter_id) : null} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
