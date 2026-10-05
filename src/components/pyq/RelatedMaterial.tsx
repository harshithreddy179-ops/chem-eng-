import { ArrowUpRight } from "lucide-react";
import type { Resource } from "@/types";
import { RESOURCE_TYPE_LABEL } from "@/lib/constants";
import { safeHttpsUrl } from "@/lib/utils";

/** Links a question back to the lecture / notes it draws from. */
export function RelatedMaterial({ resources, subjectName }: { resources: Resource[]; subjectName?: string }) {
  if (resources.length === 0) return null;
  return (
    <aside aria-labelledby="related-title" className="border-t border-line pt-10">
      <h2 id="related-title" className="eyebrow">
        Related material
      </h2>
      {subjectName && <p className="mt-3 font-display text-2xl font-light uppercase">{subjectName}</p>}
      <ul className="mt-6 border-t border-line">
        {resources.map((r) => {
          const href = safeHttpsUrl(r.drive_url);
          return (
            <li key={r.id} className="border-b border-line">
              <a
                href={href ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 py-5"
                aria-label={`Open ${r.title} in Google Drive (new tab)`}
              >
                <span className="min-w-0">
                  <span className="block font-sans text-[0.6rem] uppercase tracking-[0.26em] text-bronze">
                    {r.label || RESOURCE_TYPE_LABEL[r.resource_type]}
                  </span>
                  <span className="mt-1.5 block font-display text-xl text-ivory transition-transform duration-700 ease-luxe group-hover:translate-x-1.5">
                    → {r.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 font-sans text-[0.6rem] uppercase tracking-luxe text-ivory-400 transition-colors duration-500 group-hover:text-bronze-300">
                  Open resource <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
