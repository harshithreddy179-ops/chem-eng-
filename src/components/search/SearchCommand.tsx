"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import type { SearchEntry, SearchKind } from "@/types";
import { cn } from "@/lib/utils";

const GROUPS: { kind: SearchKind; label: string }[] = [
  { kind: "section", label: "Exams" },
  { kind: "subject", label: "Subjects" },
  { kind: "chapter", label: "Chapters" },
  { kind: "resource", label: "Notes & Papers" },
  { kind: "pyq", label: "PYQs" },
];

let cache: SearchEntry[] | null = null;

function score(entry: SearchEntry, terms: string[]) {
  const hay = `${entry.title} ${entry.meta}`.toLowerCase();
  let s = 0;
  for (const t of terms) {
    const i = hay.indexOf(t);
    if (i === -1) return -1;
    s += i === 0 ? 3 : entry.title.toLowerCase().includes(t) ? 2 : 1;
  }
  return s;
}

export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<SearchEntry[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (cache) return;
    fetch("/api/search")
      .then((r) => r.json())
      .then((d: { entries: SearchEntry[] }) => {
        cache = d.entries;
        setEntries(d.entries);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const pool = terms.length
      ? entries
          .map((e) => ({ e, s: score(e, terms) }))
          .filter((x) => x.s >= 0)
          .sort((a, b) => b.s - a.s)
          .map((x) => x.e)
      : entries.filter((e) => e.kind === "section" || e.kind === "subject");
    return GROUPS.map((g) => ({ ...g, items: pool.filter((e) => e.kind === g.kind).slice(0, 8) })).filter(
      (g) => g.items.length,
    );
  }, [entries, query]);

  const flat = useMemo(() => results.flatMap((g) => g.items), [results]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(entry: SearchEntry | undefined) {
    if (!entry) return;
    onClose();
    if (entry.external) window.open(entry.href, "_blank", "noopener,noreferrer");
    else router.push(entry.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === "Tab") {
      e.preventDefault(); // keep focus trapped on the input; arrows navigate
    }
  }

  let running = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 px-4 pt-[10vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.1 : 0.4 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the archive"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
            initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 8 }}
            transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects, chapters, notes, questions…"
                className="h-14 w-full bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={flat[active] ? `search-opt-${active}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-500 sm:block">Esc</kbd>
            </div>

            <div ref={listRef} id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
              {loading && <p className="px-4 py-8 text-[15px] text-slate-500">Loading…</p>}
              {!loading && results.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-lg font-bold text-slate-900">Nothing found</p>
                  <p className="mt-1 text-[15px] text-slate-500">
                    {query ? "Try a different word." : "Nothing has been added yet."}
                  </p>
                </div>
              )}
              {results.map((group) => (
                <div key={group.kind} className="pb-2" role="group" aria-label={group.label}>
                  <p className="px-3 pb-1.5 pt-3 text-sm font-bold text-slate-500">{group.label}</p>
                  {group.items.map((item) => {
                    running += 1;
                    const idx = running;
                    const isActive = idx === active;
                    return (
                      <button
                        key={`${item.kind}-${item.id}`}
                        id={`search-opt-${idx}`}
                        data-index={idx}
                        role="option"
                        aria-selected={isActive}
                        type="button"
                        tabIndex={-1}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => go(item)}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition-colors",
                          isActive ? "bg-brand-50" : "",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-semibold text-slate-900">{item.title}</span>
                          <span className="block truncate text-sm text-slate-500">
                            {item.meta}
                          </span>
                        </span>
                        {item.external ? (
                          <ArrowUpRight className={cn("h-4 w-4 shrink-0", isActive ? "text-brand-600" : "text-slate-400")} />
                        ) : (
                          <CornerDownLeft className={cn("h-4 w-4 shrink-0", isActive ? "text-brand-600" : "text-transparent")} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-line bg-slate-50 px-5 py-2.5 text-sm text-slate-500">
              <span>↑ ↓ to move · Enter to open</span>
              <span className="hidden sm:inline">Files open in a new tab</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
