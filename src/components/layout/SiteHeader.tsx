"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, FileQuestion, Home, Search, Shield, Target, Wrench, type LucideIcon } from "lucide-react";
import { NAV_LINKS, INSTITUTION, activeNavHref } from "@/lib/constants";
import { useModKey } from "@/hooks/use-hotkey";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { cn } from "@/lib/utils";

const SearchCommand = dynamic(() => import("@/components/search/SearchCommand").then((m) => m.SearchCommand), {
  ssr: false,
});

const ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/archive": BookOpen,
  "/pyqs": FileQuestion,
  "/pyqs/practice": Target,
  "/tools": Wrench,
  "/admin": Shield,
};

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2.5", className)} aria-label="The Chemical Archive, home">
      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-500 font-display text-xl font-bold text-white shadow-sm">
        CA
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-display text-xl font-bold text-slate-900">The Chemical Archive</span>
        <span className="truncate text-xs font-medium text-slate-500">{INSTITUTION} · Chemical Engg.</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const openSearch = useCallback(() => {
    setSearchMounted(true);
    setSearchOpen(true);
  }, []);
  useModKey("k", openSearch);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = pathname.startsWith("/admin") ? "/admin" : activeNavHref(pathname);
  const links = [...NAV_LINKS, ...(isAdmin ? [{ href: "/admin", label: "Admin" } as const] : [])];
  const mobileLinks = NAV_LINKS.filter((l) => l.href !== "/pyqs/practice");

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-lg bg-brand-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header className={cn("sticky top-0 z-50 border-b bg-white/90 backdrop-blur-lg transition-shadow", scrolled ? "border-line shadow-sm" : "border-transparent")}>
        <div className="frame flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const Icon = ICONS[l.href];
              const on = active === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors",
                    on ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={2} />}
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-2.5 text-[15px] text-slate-500 transition hover:border-brand-300 hover:bg-white sm:flex"
              aria-label="Search notes and PYQs"
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="pr-6">Search notes, PYQs…</span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-500">{isMac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search notes and PYQs"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 sm:hidden"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Tablet: links in a scrollable row under the logo */}
        <nav aria-label="Sections" className="hidden border-t border-line md:block lg:hidden">
          <div className="frame flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {links.map((l) => {
              const Icon = ICONS[l.href];
              const on = active === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[15px] font-semibold",
                    on ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={2} />}
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Phone: app-style bottom tab bar */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
        <div className="grid grid-cols-4">
          {mobileLinks.map((l) => {
            const Icon = ICONS[l.href];
            const on = active === l.href || (l.href === "/pyqs" && active === "/pyqs/practice");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 py-2.5 text-xs font-semibold", on ? "text-brand-600" : "text-slate-500")}
              >
                <span className={cn("grid h-8 w-12 place-items-center rounded-full transition-colors", on && "bg-brand-50")}>
                  {Icon && <Icon className="h-5 w-5" strokeWidth={on ? 2.4 : 2} />}
                </span>
                {l.label === "Study Material" ? "Study" : l.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {searchMounted && <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
