import type { Chapter, Resource } from "@/types";
import { ResourceItem } from "./ResourceItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { pad } from "@/lib/utils";

interface ResourceListProps {
  id: string;
  index: string;
  title: string;
  resources: Resource[];
  chapters: Chapter[];
  emptyTitle: string;
  emptyMessage: string;
}

/** A titled column of resources with its own considered empty state. */
export function ResourceList({ id, index, title, resources, chapters, emptyTitle, emptyMessage }: ResourceListProps) {
  const chapterName = new Map(chapters.map((c) => [c.id, c.name]));
  return (
    <section aria-labelledby={id} className="min-w-0">
      <Reveal className="mb-8 flex items-baseline justify-between gap-6">
        <h3 id={id} className="flex items-baseline gap-4 font-sans text-xs uppercase tracking-[0.3em] text-ivory-200">
          <span className="text-bronze tabular">{index}</span>
          {title}
        </h3>
        <span className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500 tabular">
          {pad(resources.length)} {resources.length === 1 ? "item" : "items"}
        </span>
      </Reveal>
      {resources.length === 0 ? (
        <EmptyState compact title={emptyTitle} message={emptyMessage} />
      ) : (
        <div>
          {resources.map((r) => (
            <ResourceItem key={r.id} resource={r} chapterName={r.chapter_id ? chapterName.get(r.chapter_id) : null} />
          ))}
        </div>
      )}
    </section>
  );
}
