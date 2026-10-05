"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DIFFICULTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  subjects: { slug: string; name: string }[];
  sections: { slug: string; name: string }[];
  years: number[];
  exams: string[];
  topics: string[];
}

const FIELDS = ["section", "year", "exam", "topic", "difficulty"] as const;

/** URL-driven filters so every view of the vault is shareable. */
export function PyqFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  const activeSubject = params.get("subject") ?? "";
  const hasFilters = FIELDS.some((f) => params.get(f)) || activeSubject;

  const choices: Record<(typeof FIELDS)[number], { label: string; items: { value: string; label: string }[] }> = {
    section: { label: "Academic section", items: options.sections.map((s) => ({ value: s.slug, label: s.name })) },
    year: { label: "Year", items: options.years.map((y) => ({ value: String(y), label: String(y) })) },
    exam: { label: "Exam", items: options.exams.map((e) => ({ value: e, label: e })) },
    topic: { label: "Topic", items: options.topics.map((t) => ({ value: t, label: t })) },
    difficulty: { label: "Difficulty", items: DIFFICULTIES.map((d) => ({ value: d.value, label: d.label })) },
  };

  return (
    <div className={cn("transition-opacity duration-500", pending && "opacity-60")} aria-busy={pending}>
      {/* Subject rail */}
      <div className="-mx-5 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-8 border-b border-line" role="tablist" aria-label="Subject">
          {[{ slug: "", name: "All subjects" }, ...options.subjects].map((s) => {
            const active = activeSubject === s.slug;
            return (
              <li key={s.slug || "all"}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => update("subject", s.slug)}
                  className={cn(
                    "relative pb-5 font-sans text-[0.65rem] uppercase tracking-[0.24em] transition-colors duration-500",
                    active ? "text-ivory" : "text-ivory-500 hover:text-ivory-200",
                  )}
                >
                  {s.name}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-px left-0 h-px bg-bronze transition-all duration-700 ease-luxe",
                      active ? "w-full" : "w-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
        {FIELDS.map((field) => (
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
          onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
          className="link-luxe mt-8 text-ivory-400"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
