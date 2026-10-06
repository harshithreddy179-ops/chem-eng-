import { BookOpen, ExternalLink } from "lucide-react";
import type { Resource } from "@/types";
import { RESOURCE_TYPE_LABEL } from "@/lib/constants";
import { safeHttpsUrl } from "@/lib/utils";

/** Notes / slides where this question's topic is taught. */
export function RelatedMaterial({ resources }: { resources: Resource[]; subjectName?: string }) {
  if (resources.length === 0) return null;
  return (
    <aside aria-labelledby="related-title" className="card p-5">
      <h2 id="related-title" className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <BookOpen className="h-5 w-5 text-brand-600" /> Study this topic
      </h2>
      <p className="mt-1 text-sm text-slate-500">Notes where this question&rsquo;s topic is taught.</p>
      <ul className="mt-4 space-y-2.5">
        {resources.map((r) => {
          const href = safeHttpsUrl(r.drive_url);
          return (
            <li key={r.id}>
              <a
                href={href ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-line p-3 transition hover:border-brand-200 hover:bg-brand-50/50"
                aria-label={`Open ${r.title} in Google Drive (new tab)`}
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{r.title}</span>
                  <span className="block text-sm text-slate-500">{r.description || r.label || RESOURCE_TYPE_LABEL[r.resource_type]}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-600" />
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
