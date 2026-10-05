"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NAV_LINKS, INSTITUTION } from "@/lib/constants";
import { useModKey } from "@/hooks/use-hotkey";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { cn } from "@/lib/utils";

const SearchCommand = dynamic(() => import("@/components/search/SearchCommand").then((m) => m.SearchCommand), {
  ssr: false,
});

const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const isAdmin = useIsAdmin();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [isMac, setIsMac] = useState(true);

  const openSearch = useCallback(() => {
    setSearchMounted(true);
    setSearchOpen(true);
    setMenuOpen(false);
  }, []);
  useModKey("k", openSearch);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const links = [...NAV_LINKS, ...(isAdmin ? [{ href: "/admin", label: "Admin" } as const] : [])];

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] bg-ivory px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ease-luxe",
          scrolled && !menuOpen ? "border-b border-line bg-ink/75 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="frame flex h-[4.5rem] items-center justify-between md:h-20">
          <Link href="/" className="group flex flex-col leading-none" aria-label="The Chemical Archive — home">
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.38em] text-ivory-400 transition-colors duration-500 group-hover:text-bronze">
              {INSTITUTION}
            </span>
            <span className="mt-1.5 font-display text-[1.05rem] uppercase tracking-[0.18em] text-ivory">
              The Chemical Archive
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "link-luxe",
                    active ? "text-bronze-300 after:scale-x-100" : "text-ivory-200 hover:text-ivory",
                    l.href === "/admin" && "text-bronze",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={openSearch}
              className="group flex items-center gap-3 border border-line px-4 py-2.5 text-ivory-300 transition-colors duration-500 hover:border-ivory/30 hover:text-ivory"
              aria-label="Search the archive"
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.25} />
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.22em]">Search</span>
              <kbd className="font-sans text-[0.6rem] tracking-wider text-ivory-500">{isMac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
          </nav>

          <div className="flex items-center gap-5 md:hidden">
            <button type="button" onClick={openSearch} aria-label="Search the archive" className="p-2 text-ivory-200">
              <Search className="h-4 w-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="relative flex h-10 items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.3em]"
            >
              <span>{menuOpen ? "Close" : "Menu"}</span>
              <span aria-hidden className="relative block h-3 w-6">
                <span
                  className={cn(
                    "absolute left-0 h-px w-6 bg-ivory transition-transform duration-500 ease-luxe",
                    menuOpen ? "top-1.5 rotate-45" : "top-0.5",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px bg-ivory transition-all duration-500 ease-luxe",
                    menuOpen ? "top-1.5 w-6 -rotate-45" : "top-2.5 w-4",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink md:hidden"
            initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            exit={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
            transition={{ duration: reduce ? 0.2 : 0.8, ease: EASE }}
          >
            <div className="grain pointer-events-none absolute inset-0 overflow-hidden" />
            <nav aria-label="Mobile" className="frame relative flex flex-1 flex-col justify-center gap-2 pt-20">
              {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
                <div key={l.href} className="overflow-hidden border-b border-line">
                  <motion.div
                    initial={{ y: reduce ? 0 : "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.15 + i * 0.07, ease: EASE }}
                  >
                    <Link
                      href={l.href}
                      className="flex items-baseline justify-between py-5 font-display text-5xl font-light uppercase"
                    >
                      {l.label}
                      <span className="font-sans text-[0.6rem] tracking-[0.3em] text-bronze">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <p className="frame relative pb-10 font-display text-lg italic text-ivory-400">
              Your academic space. Everything in one place.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {searchMounted && <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
