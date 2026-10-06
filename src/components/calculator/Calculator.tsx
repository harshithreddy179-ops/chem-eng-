"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalcError, evaluate, formatNumber, type AngleMode } from "@/lib/calculator/engine";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
   The instrument. Used full-size on /tools/calculator and compact in the
   floating panel. History, Ans and DEG/RAD persist on this device.
   ────────────────────────────────────────────────────────────────────────── */

interface HistoryItem {
  expr: string;
  plain: string;
  display: string;
}

interface Saved {
  history: HistoryItem[];
  ans: number;
  mode: AngleMode;
}

const STORAGE_KEY = "chemical-archive:calc:v1";
const MAX_HISTORY = 50;

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Saved>;
      return {
        history: Array.isArray(s.history) ? s.history.slice(0, MAX_HISTORY) : [],
        ans: typeof s.ans === "number" && Number.isFinite(s.ans) ? s.ans : 0,
        mode: s.mode === "rad" ? "rad" : "deg",
      };
    }
  } catch {
    /* ignore */
  }
  return { history: [], ans: 0, mode: "deg" };
}

type Key = { label: React.ReactNode; insert?: string; action?: "eval" | "clear" | "back" | "mode"; aria: string; tone?: "fn" | "num" | "op" | "eq" | "util"; span?: boolean };

const SCI_KEYS: Key[] = [
  { label: "(", insert: "(", aria: "Open bracket", tone: "fn" },
  { label: ")", insert: ")", aria: "Close bracket", tone: "fn" },
  { label: "%", insert: "%", aria: "Percent", tone: "fn" },
  { label: "Ans", insert: "Ans", aria: "Previous answer", tone: "fn" },
  { label: "sin", insert: "sin(", aria: "Sine", tone: "fn" },
  { label: "cos", insert: "cos(", aria: "Cosine", tone: "fn" },
  { label: "tan", insert: "tan(", aria: "Tangent", tone: "fn" },
  { label: "ln", insert: "ln(", aria: "Natural logarithm", tone: "fn" },
  { label: "log", insert: "log(", aria: "Logarithm base 10", tone: "fn" },
  { label: <>sin<sup>−1</sup></>, insert: "sin⁻¹(", aria: "Inverse sine", tone: "fn" },
  { label: <>cos<sup>−1</sup></>, insert: "cos⁻¹(", aria: "Inverse cosine", tone: "fn" },
  { label: <>tan<sup>−1</sup></>, insert: "tan⁻¹(", aria: "Inverse tangent", tone: "fn" },
  { label: <>e<sup>x</sup></>, insert: "e^(", aria: "e to the power", tone: "fn" },
  { label: <>10<sup>x</sup></>, insert: "10^(", aria: "Ten to the power", tone: "fn" },
  { label: <>x<sup>2</sup></>, insert: "²", aria: "Square", tone: "fn" },
  { label: <>x<sup>y</sup></>, insert: "^", aria: "Power", tone: "fn" },
  { label: "√x", insert: "√(", aria: "Square root", tone: "fn" },
  { label: "n!", insert: "!", aria: "Factorial", tone: "fn" },
  { label: "|x|", insert: "abs(", aria: "Absolute value", tone: "fn" },
  { label: <>1/x</>, insert: "^(-1)", aria: "Reciprocal", tone: "fn" },
  { label: "π", insert: "π", aria: "Pi", tone: "fn" },
  { label: "e", insert: "e", aria: "Euler's number", tone: "fn" },
  { label: "EXP", insert: "E", aria: "Times ten to the power (scientific notation)", tone: "fn" },
  { label: "±", insert: "−", aria: "Negative", tone: "fn" },
];

const NUM_KEYS: Key[] = [
  { label: "7", insert: "7", aria: "7", tone: "num" },
  { label: "8", insert: "8", aria: "8", tone: "num" },
  { label: "9", insert: "9", aria: "9", tone: "num" },
  { label: "÷", insert: "÷", aria: "Divide", tone: "op" },
  { label: "⌫", action: "back", aria: "Backspace", tone: "util" },
  { label: "4", insert: "4", aria: "4", tone: "num" },
  { label: "5", insert: "5", aria: "5", tone: "num" },
  { label: "6", insert: "6", aria: "6", tone: "num" },
  { label: "×", insert: "×", aria: "Multiply", tone: "op" },
  { label: "AC", action: "clear", aria: "Clear", tone: "util" },
  { label: "1", insert: "1", aria: "1", tone: "num" },
  { label: "2", insert: "2", aria: "2", tone: "num" },
  { label: "3", insert: "3", aria: "3", tone: "num" },
  { label: "−", insert: "−", aria: "Subtract", tone: "op" },
  { label: "=", action: "eval", aria: "Equals", tone: "eq", span: true },
  { label: "0", insert: "0", aria: "0", tone: "num" },
  { label: ".", insert: ".", aria: "Decimal point", tone: "num" },
  { label: "00", insert: "00", aria: "Double zero", tone: "num" },
  { label: "+", insert: "+", aria: "Add", tone: "op" },
];

const OPERATOR_START = /^[+−\-×÷*/^%!²]/;

export function Calculator({
  compact = false,
  onClose,
  autoFocus = false,
}: {
  compact?: boolean;
  onClose?: () => void;
  autoFocus?: boolean;
}) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<{ display: string; plain: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [saved, setSaved] = useState<Saved>({ history: [], ans: 0, mode: "deg" });
  const [showHistory, setShowHistory] = useState(!compact);
  const loaded = useRef(false);

  useEffect(() => {
    setSaved(load());
    loaded.current = true;
    if (autoFocus) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  }, [autoFocus]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [saved]);

  const preview = useMemo(() => {
    if (!expr.trim() || justEvaluated) return null;
    try {
      return formatNumber(evaluate(expr, { mode: saved.mode, ans: saved.ans })).display;
    } catch {
      return null;
    }
  }, [expr, saved.mode, saved.ans, justEvaluated]);

  const focusInput = (caret?: number) =>
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      if (caret != null) el.setSelectionRange(caret, caret);
    });

  const insert = useCallback(
    (text: string) => {
      setError(null);
      const el = inputRef.current;
      let base = expr;
      let start = el?.selectionStart ?? base.length;
      let end = el?.selectionEnd ?? base.length;
      if (justEvaluated) {
        // After "=", an operator continues from Ans; anything else starts afresh.
        base = OPERATOR_START.test(text) ? "Ans" : "";
        start = end = base.length;
        setJustEvaluated(false);
        setResult(null);
      }
      const next = base.slice(0, start) + text + base.slice(end);
      setExpr(next);
      focusInput(start + text.length);
    },
    [expr, justEvaluated],
  );

  const run = useCallback(() => {
    if (!expr.trim()) return;
    try {
      const value = evaluate(expr, { mode: saved.mode, ans: saved.ans });
      const f = formatNumber(value);
      setResult(f);
      setError(null);
      setJustEvaluated(true);
      setSaved((s) => ({
        ...s,
        ans: value,
        history: [{ expr, plain: f.plain, display: f.display }, ...s.history].slice(0, MAX_HISTORY),
      }));
    } catch (e) {
      setError(e instanceof CalcError ? e.message : "That expression couldn't be read");
      setResult(null);
    }
  }, [expr, saved.mode, saved.ans]);

  const clear = () => {
    setExpr("");
    setResult(null);
    setError(null);
    setJustEvaluated(false);
    focusInput(0);
  };

  const back = () => {
    if (justEvaluated) return clear();
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;
    if (start !== end) {
      setExpr(expr.slice(0, start) + expr.slice(end));
      return focusInput(start);
    }
    if (start === 0) return;
    // Remove whole function names like "sin⁻¹(" in one step.
    const before = expr.slice(0, start);
    const m = /(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|sin\(|cos\(|tan\(|log\(|ln\(|abs\(|Ans|\^\(-1\))$/.exec(before);
    const cut = m ? m[0].length : 1;
    setExpr(before.slice(0, -cut) + expr.slice(start));
    setError(null);
    focusInput(start - cut);
  };

  const press = (k: Key) => {
    if (k.action === "eval") return run();
    if (k.action === "clear") return clear();
    if (k.action === "back") return back();
    if (k.insert) insert(k.insert);
  };

  const toggleMode = () => setSaved((s) => ({ ...s, mode: s.mode === "deg" ? "rad" : "deg" }));

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (onClose) onClose();
      else clear();
    } else if (justEvaluated && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const map: Record<string, string> = { "*": "×", "/": "÷", "-": "−" };
      insert(map[e.key] ?? e.key);
    } else if (justEvaluated && e.key === "Backspace") {
      e.preventDefault();
      clear();
    }
  }

  const keyClass = (k: Key) =>
    cn(
      "relative flex items-center justify-center border-b border-r border-line font-sans transition-colors duration-300 active:bg-ivory/[0.08] focus-visible:z-10",
      compact ? "h-10 text-[0.8rem]" : "h-12 text-sm md:h-14",
      k.tone === "fn" && "text-ivory-300 hover:bg-ivory/[0.04] hover:text-ivory",
      k.tone === "num" && cn("font-display tabular text-ivory hover:bg-ivory/[0.05]", compact ? "text-xl" : "text-2xl"),
      k.tone === "op" && cn("font-display text-bronze-300 hover:bg-bronze/10", compact ? "text-xl" : "text-2xl"),
      k.tone === "util" && "text-[0.65rem] uppercase tracking-[0.2em] text-ivory-400 hover:bg-ivory/[0.04] hover:text-ivory",
      k.tone === "eq" && cn("row-span-2 !h-auto bg-ivory font-display text-ink hover:bg-bronze-300", compact ? "text-2xl" : "text-3xl"),
    );

  const historyList = (
    <div className={cn(compact ? "max-h-56" : "max-h-[32rem]", "overflow-y-auto")}>
      {saved.history.length === 0 ? (
        <p className="py-6 font-display text-lg italic text-ivory-500">No calculations yet.</p>
      ) : (
        <ul>
          {saved.history.map((h, i) => (
            <li key={`${i}-${h.expr}`} className="border-b border-line">
              <button
                type="button"
                onClick={() => {
                  setExpr(h.expr);
                  setJustEvaluated(false);
                  setResult(null);
                  setError(null);
                  focusInput(h.expr.length);
                }}
                className="block w-full pt-3 text-right font-sans text-xs text-ivory-400 transition-colors hover:text-ivory"
                aria-label={`Reuse expression ${h.expr}`}
              >
                {h.expr}
              </button>
              <button
                type="button"
                onClick={() => insert(h.plain)}
                className="block w-full pb-3 text-right font-display text-2xl tabular text-ivory transition-colors hover:text-bronze-300"
                aria-label={`Insert result ${h.display}`}
              >
                {h.display}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className={cn(!compact && "grid gap-10 lg:grid-cols-12")}>
      <div className={cn(!compact && "lg:col-span-7")}>
        {/* Display */}
        <div className={cn("relative border border-line bg-ink-800/60", compact ? "px-4 pb-3 pt-3" : "px-6 pb-5 pt-5 md:px-8")}>
          <div className="flex items-center justify-between">
            <span
              className="border border-bronze/50 px-2.5 py-1 font-sans text-[0.6rem] uppercase tracking-[0.26em] text-bronze-300"
              aria-label={`Angle mode: ${saved.mode === "deg" ? "degrees" : "radians"}`}
            >
              {saved.mode === "deg" ? "Deg" : "Rad"}
            </span>
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.24em] text-ivory-500">
              Ans = {formatNumber(saved.ans).display}
            </span>
          </div>
          <label className="sr-only" htmlFor={compact ? "calc-input-compact" : "calc-input"}>
            Expression
          </label>
          <input
            id={compact ? "calc-input-compact" : "calc-input"}
            ref={inputRef}
            value={expr}
            onChange={(e) => {
              setExpr(e.target.value);
              setJustEvaluated(false);
              setResult(null);
              setError(null);
            }}
            onKeyDown={onKeyDown}
            inputMode="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="0"
            className={cn(
              "mt-3 w-full bg-transparent text-right font-sans tracking-wide text-ivory-300 placeholder:text-ivory-500 focus:outline-none",
              compact ? "text-base" : "text-lg",
            )}
          />
          <div className={cn("mt-1 overflow-hidden text-right", compact ? "min-h-[2.75rem]" : "min-h-[4.5rem]")} aria-live="polite">
            <>
              {error ? (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2 font-display text-lg italic text-garnet-300"
                  role="alert"
                >
                  {error}
                </motion.p>
              ) : result ? (
                <motion.p
                  key={`r-${result.display}`}
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("truncate font-display font-light tabular text-ivory", compact ? "text-4xl" : "text-6xl")}
                >
                  <span className="mr-2 text-[0.5em] text-ivory-500">=</span>
                  {result.display}
                </motion.p>
              ) : (
                <motion.p key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("truncate font-display font-light tabular text-ivory-500", compact ? "text-4xl" : "text-6xl")}>
                  {preview ?? (expr ? "" : "0")}
                </motion.p>
              )}
            </>
          </div>
        </div>

        {/* Keys */}
        <div className="mt-3 border-l border-t border-line">
          <div className="grid grid-cols-5">
            <button type="button" onClick={toggleMode} className={keyClass({ label: "", aria: "", tone: "util" })} aria-label={`Switch to ${saved.mode === "deg" ? "radians" : "degrees"}`}>
              {saved.mode === "deg" ? "→ Rad" : "→ Deg"}
            </button>
            {SCI_KEYS.map((k) => (
              <button key={k.aria} type="button" aria-label={k.aria} onClick={() => press(k)} className={keyClass(k)}>
                {k.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 grid-rows-4">
            {NUM_KEYS.map((k) => (
              <button key={k.aria} type="button" aria-label={k.aria} onClick={() => press(k)} className={keyClass(k)}>
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {compact && (
          <div className="mt-3">
            <button type="button" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory} className="link-luxe text-ivory-400">
              {showHistory ? "Hide history" : `History (${saved.history.length})`}
            </button>
            {showHistory && (
              <div className="mt-3 border-t border-line">
                {historyList}
                {saved.history.length > 0 && (
                  <button type="button" onClick={() => setSaved((s) => ({ ...s, history: [] }))} className="link-luxe mt-3 text-ivory-500">
                    Clear history
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!compact && (
        <aside aria-label="Calculation history" className="lg:col-span-5">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <h2 className="eyebrow">History</h2>
            {saved.history.length > 0 && (
              <button type="button" onClick={() => setSaved((s) => ({ ...s, history: [] }))} className="link-luxe text-ivory-500">
                Clear history
              </button>
            )}
          </div>
          {historyList}
          <p className="mt-6 font-sans text-[0.6rem] uppercase leading-relaxed tracking-[0.2em] text-ivory-500">
            Tap an expression to edit it again · tap a result to insert it · Enter = · Esc clears
          </p>
        </aside>
      )}
    </div>
  );
}
