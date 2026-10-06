"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, CalendarCheck, FileQuestion, FolderTree, LayoutDashboard, Layers, ListChecks, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/chapters", label: "Chapters", icon: ListChecks },
  { href: "/admin/pyqs", label: "PYQs", icon: FileQuestion },
  { href: "/admin/subjects", label: "Subjects", icon: Layers },
  { href: "/admin/sections", label: "Sections", icon: FolderTree },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col">
      <ul className="space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 border-l px-4 py-3 font-sans text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-300",
                  active ? "border-bronze bg-ivory/[0.04] text-ivory" : "border-transparent text-ivory-400 hover:text-ivory",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-4 border-t border-line pt-6">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 font-sans text-sm text-ivory-400 hover:text-ivory">
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden /> View public site
        </Link>
        <p className="truncate px-4 font-sans text-xs text-ivory-500" title={email}>
          {email}
        </p>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-3 px-4 font-sans text-sm text-ivory-400 hover:text-bronze-300">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/90 px-5 py-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="font-display text-lg">
          Archive <span className="text-bronze">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="admin-nav" aria-label="Toggle admin menu" className="p-2">
          {open ? <X className="h-5 w-5" strokeWidth={1.25} /> : <Menu className="h-5 w-5" strokeWidth={1.25} />}
        </button>
      </div>
      {open && (
        <div id="admin-nav" className="fixed inset-x-0 bottom-0 top-[61px] z-20 flex flex-col bg-ink px-3 py-6 lg:hidden">
          {nav}
        </div>
      )}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-3 py-8 lg:flex">
        <Link href="/admin" className="mb-10 block px-4">
          <span className="block font-sans text-sm text-ivory-500">The Chemical Archive</span>
          <span className="mt-1 block font-display text-2xl">
            Admin <span className="text-bronze">Portal</span>
          </span>
        </Link>
        {nav}
      </aside>
    </>
  );
}
