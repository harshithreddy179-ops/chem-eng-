"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Thin bar at the top of the screen that starts the moment an internal link
 * is clicked and finishes when the new page is shown, so a click always
 * gives instant feedback.
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setState("loading");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The new page is on screen: finish the bar, then hide it.
  useEffect(() => {
    setState((s) => (s === "loading" ? "done" : s));
  }, [pathname, search]);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (state === "done") timer.current = window.setTimeout(() => setState("idle"), 300);
    // Never leave the bar stuck if a navigation is abandoned.
    if (state === "loading") timer.current = window.setTimeout(() => setState("idle"), 10000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [state]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-violet-500 shadow-[0_0_8px_rgb(58_111_245/0.6)]"
        style={{
          width: state === "idle" ? "0%" : state === "loading" ? "85%" : "100%",
          opacity: state === "idle" ? 0 : 1,
          transition:
            state === "loading"
              ? "width 2.5s cubic-bezier(0.1, 0.6, 0.2, 1), opacity 0.1s"
              : state === "done"
                ? "width 0.2s ease-out, opacity 0.3s ease 0.15s"
                : "none",
        }}
      />
    </div>
  );
}
