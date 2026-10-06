import { Breadcrumbs } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  crumbs?: { href?: string; label: string }[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Right-hand slot (progress, buttons). */
  aside?: React.ReactNode;
  /** Tailwind classes for the tinted background. */
  tint?: string;
  children?: React.ReactNode;
}

/** Tinted banner at the top of inner pages: breadcrumbs, title, short help text. */
export function PageHeader({ crumbs, title, subtitle, icon, aside, tint = "from-brand-50 via-white to-violet-50", children }: PageHeaderProps) {
  return (
    <header className={cn("border-b border-line bg-gradient-to-br", tint)}>
      <div className="frame py-8 md:py-12">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {icon}
            <div className="min-w-0">
              <h1 className="font-display text-display-lg font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{subtitle}</p>}
            </div>
          </div>
          {aside && <div className="w-full shrink-0 md:w-80">{aside}</div>}
        </div>
        {children}
      </div>
    </header>
  );
}
