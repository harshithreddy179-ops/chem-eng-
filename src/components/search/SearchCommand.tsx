"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import type { SearchEntry, SearchKind } from "@/types";
import { cn } from "@/lib/utils";

const GROUPS: { kind: SearchKind; label: string }[] = [
  { kind: "section", label: "Sections" },
  { kind: "subject", label: "Subjects" },
  { kind: "chapter", label: "Chapters" },
  { kind: "resource", label: "Resources" },
  { kind: "pyq", label: "Previous Year Questions" },
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
          className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/80 px-4 pt-[12vh] backdrop-blur-md"
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
            className="w-full max-w-2xl border border-line bg-ink-800 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 8 }}
            transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-4 border-b border-line px-6">
              <Search className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.25} aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects, chapters, resources, questions…"
                className="h-16 w-full bg-transparent font-display text-xl text-ivory placeholder:italic placeholder:text-ivory-500 focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={flat[active] ? `search-opt-${active}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden font-sans text-[0.6rem] uppercase tracking-widest text-ivory-500 sm:block">Esc</kbd>
            </div>

            <div ref={listRef} id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto py-3">
              {loading && <p className="px-6 py-8 font-display text-lg italic text-ivory-400">Opening the index…</p>}
              {!loading && results.length === 0 && (
                <div className="px-6 py-10">
                  <p className="font-display text-2xl font-light uppercase">Nothing found</p>
                  <p className="mt-2 font-display text-lg italic text-ivory-400">
                    {query ? "Try a different word — the archive grows as material is added." : "The archive is being assembled."}
                  </p>
                </div>
              )}
              {results.map((group) => (
                <div key={group.kind} className="pb-2" role="group" aria-label={group.label}>
                  <p className="eyebrow px-6 pb-2 pt-4 text-ivory-500">{group.label}</p>
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
                          "flex w-full items-center justify-between gap-6 border-l px-6 py-3 text-left transition-colors duration-300",
                          isActive ? "border-bronze bg-ivory/[0.04]" : "border-transparent",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-sans text-[0.95rem] text-ivory">{item.title}</span>
                          <span className="mt-1 block truncate font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ivory-500">
                            {item.meta}
                          </span>
                        </span>
                        {item.external ? (
                          <ArrowUpRight className={cn("h-4 w-4 shrink-0", isActive ? "text-bronze" : "text-ivory-500")} strokeWidth={1.25} />
                        ) : (
                          <CornerDownLeft className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-bronze" : "text-transparent")} strokeWidth={1.25} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-line px-6 py-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory-500">
              <span>↑ ↓ to navigate · ↵ to open</span>
              <span>Drive files open in a new tab</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
