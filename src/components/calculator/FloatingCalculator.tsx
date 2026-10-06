"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
        className="group fixed bottom-5 right-5 z-[45] flex items-center gap-2.5 border border-ivory/20 bg-ink/85 px-4 py-3 font-sans text-[0.62rem] uppercase tracking-[0.3em] text-ivory-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-500 hover:border-bronze hover:text-ivory md:bottom-8 md:right-8"
      >
        <span aria-hidden className="font-display text-base normal-case tracking-normal text-bronze-300">
          ∑
        </span>
        Calc
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden
              className="fixed inset-0 z-[54] bg-ink/60 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              id="floating-calculator"
              role="dialog"
              aria-label="Scientific calculator"
              className="fixed inset-x-0 bottom-0 z-[55] max-h-[88dvh] overflow-y-auto border-t border-line bg-ink-800 px-4 pb-6 pt-4 shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)] md:inset-x-auto md:bottom-24 md:right-8 md:max-h-[calc(100dvh-8rem)] md:w-[24rem] md:border md:pb-5"
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : 30 }}
              transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ivory-400">Scientific calculator</p>
                <button type="button" onClick={close} aria-label="Close calculator" className="-mr-1 p-1.5 text-ivory-400 hover:text-ivory">
                  <X className="h-4 w-4" strokeWidth={1.25} />
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
