import { ExternalLink, FileText, Presentation, FileQuestion, NotebookPen } from "lucide-react";
import type { Resource, ResourceType } from "@/types";
import { RESOURCE_TYPE_LABEL } from "@/lib/constants";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import { safeHttpsUrl, cn } from "@/lib/utils";

interface ResourceItemProps {
  resource: Resource;
  chapterName?: string | null;
  index?: number;
}

const TYPE_STYLE: Record<ResourceType, { icon: typeof FileText; tone: string }> = {
  ppt: { icon: Presentation, tone: "bg-orange-50 text-orange-600" },
  pdf: { icon: FileText, tone: "bg-rose-50 text-rose-600" },
  notes: { icon: NotebookPen, tone: "bg-sky-50 text-sky-600" },
  pyq: { icon: FileQuestion, tone: "bg-violet-50 text-violet-600" },
  question_paper: { icon: FileQuestion, tone: "bg-violet-50 text-violet-600" },
  study_material: { icon: NotebookPen, tone: "bg-emerald-50 text-emerald-600" },
  other: { icon: FileText, tone: "bg-slate-100 text-slate-600" },
};

/** One Google Drive file: icon, title, details, Open button and a done checkbox. */
export function ResourceItem({ resource, chapterName }: ResourceItemProps) {
  const href = safeHttpsUrl(resource.drive_url);
  const style = TYPE_STYLE[resource.resource_type] ?? TYPE_STYLE.other;
  const Icon = style.icon;
  const tag = resource.label || RESOURCE_TYPE_LABEL[resource.resource_type];

  return (
    <article className="card flex flex-col gap-4 p-4 transition hover:border-brand-200 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", style.tone)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-snug text-slate-900">{resource.title}</h3>
          {(resource.description || chapterName) && (
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
              {chapterName}
              {chapterName && resource.description && " · "}
              {resource.description}
            </p>
          )}
          <span className="chip mt-2 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end lg:flex-row lg:items-center">
        {resource.is_trackable && <CompletionCheckbox progressKey={`resource:${resource.id}`} label={resource.title} />}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-solid px-4 py-2 text-sm"
            aria-label={`Open ${resource.title} in Google Drive (new tab)`}
          >
            Open <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <span className="text-sm text-slate-400">Link not available</span>
        )}
      </div>
    </article>
  );
}
