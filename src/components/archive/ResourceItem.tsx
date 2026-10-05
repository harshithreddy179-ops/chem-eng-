import { ArrowUpRight } from "lucide-react";
import type { Resource } from "@/types";
import { RESOURCE_TYPE_LABEL } from "@/lib/constants";
import { CompletionCheckbox } from "@/components/ui/CompletionCheckbox";
import { safeHttpsUrl, cn } from "@/lib/utils";

interface ResourceItemProps {
  resource: Resource;
  chapterName?: string | null;
  index?: number;
}

/** One Drive-hosted file: label, title, type, open → and a completion box. */
export function ResourceItem({ resource, chapterName }: ResourceItemProps) {
  const href = safeHttpsUrl(resource.drive_url);
  const image = safeHttpsUrl(resource.image_url);
  const eyebrow = resource.label || RESOURCE_TYPE_LABEL[resource.resource_type];

  return (
    <article className="group relative border-b border-line py-7 first:border-t md:py-8">
      <span
        aria-hidden
        className="absolute inset-y-0 -left-4 w-px origin-top scale-y-0 bg-bronze transition-transform duration-700 ease-luxe group-hover:scale-y-100"
      />
      <div className="flex gap-5">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="hidden h-20 w-16 shrink-0 object-cover opacity-80 grayscale transition duration-700 group-hover:opacity-100 group-hover:grayscale-0 sm:block"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-bronze">{eyebrow}</p>
            <span className="border border-line px-2 py-1 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-ivory-400">
              {RESOURCE_TYPE_LABEL[resource.resource_type]}
            </span>
          </div>
          <h4 className="mt-3 font-display text-[1.65rem] font-light leading-tight text-ivory md:text-3xl">{resource.title}</h4>
          {(resource.description || chapterName) && (
            <p className="mt-2 font-sans text-sm leading-relaxed text-ivory-400">
              {chapterName && <span className="text-ivory-300">{chapterName}</span>}
              {chapterName && resource.description && <span aria-hidden> · </span>}
              {resource.description}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {resource.is_trackable ? (
              <CompletionCheckbox progressKey={`resource:${resource.id}`} label={resource.title} />
            ) : (
              <span />
            )}
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("link-luxe text-ivory-100 hover:text-bronze-300")}
                aria-label={`Open ${resource.title} in Google Drive (new tab)`}
              >
                Open
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden />
              </a>
            ) : (
              <span className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500">Link unavailable</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
