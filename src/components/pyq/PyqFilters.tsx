"use client";

import { LayoutGrid, X } from "lucide-react";
import { DIFFICULTIES } from "@/lib/constants";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { subjectTheme } from "@/lib/palette";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  subjects: { slug: string; name: string }[];
  sections: { slug: string; name: string }[];
  years: number[];
  exams: string[];
  topics: string[];
}

const FIELDS = ["section", "year", "exam", "topic", "difficulty"] as const;

type Params = { get(name: string): string | null; toString(): string };

/** Filters live in the URL (so a filtered view can be shared), but changing
    them only updates the address bar — no trip to the server. */
export function PyqFilters({ options, params }: { options: FilterOptions; params: Params }) {
  function navigate(query: string) {
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.pushState(null, "", url);
  }
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(next.toString());
  }

  const activeSubject = params.get("subject") ?? "";
  const hasFilters = FIELDS.some((f) => params.get(f)) || activeSubject;

  const choices: Record<(typeof FIELDS)[number], { label: string; items: { value: string; label: string }[] }> = {
    section: { label: "Exam", items: options.sections.map((s) => ({ value: s.slug, label: s.name })) },
    year: { label: "Year", items: options.years.map((y) => ({ value: String(y), label: String(y) })) },
    exam: { label: "Exam type", items: options.exams.map((e) => ({ value: e, label: e })) },
    topic: { label: "Topic", items: options.topics.map((t) => ({ value: t, label: t })) },
    difficulty: { label: "Difficulty", items: DIFFICULTIES.map((d) => ({ value: d.value, label: d.label })) },
  };
  const fields = FIELDS.filter((f) => f !== "topic" || choices.topic.items.length > 0);

  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-slate-700">Subject</p>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap" role="tablist" aria-label="Subject">
          {[{ slug: "", name: "All subjects" }, ...options.subjects].map((s) => {
            const active = activeSubject === s.slug;
            const t = subjectTheme(s.slug);
            return (
              <li key={s.slug || "all"}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => update("subject", s.slug)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-[15px] font-semibold transition",
                    active
                      ? s.slug
                        ? cn(t.border, t.soft, t.text, "ring-2 ring-offset-1", t.border.replace("border-", "ring-"))
                        : "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  {s.slug ? (
                    <SubjectIcon slug={s.slug} size="sm" className="!h-7 !w-7 !rounded-full [&_svg]:!h-4 [&_svg]:!w-4" />
                  ) : (
                    <span className={cn("grid h-7 w-7 place-items-center rounded-full", active ? "bg-white/20" : "bg-slate-100")}>
                      <LayoutGrid className="h-4 w-4" />
                    </span>
                  )}
                  {s.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="field-label">{choices[field].label}</span>
            <select
              className="field"
              value={params.get(field) ?? ""}
              onChange={(e) => update(field, e.target.value)}
              disabled={field !== "section" && field !== "difficulty" && choices[field].items.length === 0}
            >
              <option value="">All</option>
              {choices[field].items.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={() => navigate("")}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          <X className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );
}
