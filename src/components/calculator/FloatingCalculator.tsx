"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Calculator as CalcIcon, X } from "lucide-react";

const Calculator = dynamic(() => import("./Calculator").then((m) => m.Calculator), {
  ssr: false,
  loading: () => <div className="h-[34rem]" aria-busy="true" />,
});

/** A quiet CALC tab available on every public page. */
export function FloatingCalculator() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname === "/tools/calculator") return null;

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setMounted(true);
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-controls="floating-calculator"
        className="group fixed bottom-[5.25rem] right-4 z-[45] flex items-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-[15px] font-bold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 md:bottom-6 md:right-6"
      >
        <CalcIcon aria-hidden className="h-5 w-5" />
        Calc
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden
              className="fixed inset-0 z-[54] bg-slate-900/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              id="floating-calculator"
              role="dialog"
              aria-label="Scientific calculator"
              className="fixed inset-x-0 bottom-0 z-[55] max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-line bg-white px-4 pb-6 pt-4 shadow-2xl md:inset-x-auto md:bottom-24 md:right-6 md:max-h-[calc(100dvh-8rem)] md:w-[24rem] md:rounded-3xl md:pb-5"
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : 30 }}
              transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[15px] font-bold text-slate-900">Calculator</p>
                <button type="button" onClick={close} aria-label="Close calculator" className="-mr-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {mounted && <Calculator compact autoFocus onClose={close} />}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
