import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGlyph } from "@/components/tools/ToolGlyph";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools",
  description: "Free study tools: attendance tracker, scientific calculator and a study timer.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  const available = TOOLS.filter((t) => t.status === "available");
  const planned = TOOLS.filter((t) => t.status === "planned");
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Tools" }]}
        tint="from-emerald-50 via-white to-violet-50"
        icon={
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white shadow-sm sm:grid">
            <Wrench className="h-7 w-7" />
          </span>
        }
        title="Tools"
        subtitle="Free tools to make studying easier. Everything is saved on your device."
      />
      <div className="frame py-10">
        <ul className="grid gap-4 md:grid-cols-3">
          {available.map((tool) => (
            <li key={tool.slug}>
              <Link href={`/tools/${tool.slug}`} className="card card-hover group flex h-full flex-col gap-4 p-5">
                <ToolGlyph slug={tool.slug} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{tool.name}</h2>
                  <p className="text-[15px] font-medium text-slate-500">{tool.tagline}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{tool.summary}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-600">
                  Open {tool.name} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {planned.length > 0 && (
          <>
            <h2 className="mb-4 mt-12 text-xl font-bold text-slate-900">Coming soon</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {planned.map((t) => (
                <li key={t.slug} className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4">
                  <ToolGlyph slug={t.slug} />
                  <span>
                    <span className="block font-semibold text-slate-700">{t.name}</span>
                    <span className="block text-sm text-slate-500">{t.summary}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
