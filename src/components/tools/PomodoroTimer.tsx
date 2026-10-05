"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Pause, Play, RotateCcw, Settings2, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { playChime } from "./chime";
import { cn, pad } from "@/lib/utils";

type Mode = "focus" | "short" | "long";

interface Settings {
  focus: number; // minutes
  short: number;
  long: number;
  roundsBeforeLong: number;
  autoStart: boolean;
  sound: boolean;
  notify: boolean;
}

const DEFAULTS: Settings = { focus: 25, short: 5, long: 15, roundsBeforeLong: 4, autoStart: false, sound: true, notify: false };
const STORAGE_KEY = "chemical-archive:pomodoro:v1";

const MODE_META: Record<Mode, { label: string; title: string; line: string }> = {
  focus: { label: "Focus", title: "Focus", line: "One task. Nothing else." },
  short: { label: "Short break", title: "Break", line: "Stand up. Look far away." },
  long: { label: "Long break", title: "Rest", line: "Step away properly. You've earned it." },
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function fmt(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

export function PomodoroTimer() {
  const reduce = useReducedMotion();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(DEFAULTS.focus * 60);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const endAt = useRef<number | null>(null);
  const loaded = useRef(false);

  const duration = settings[mode] * 60;

  /* ─── persistence ─────────────────────────────────────────────────── */
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setRemaining(s.focus * 60);
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  /* ─── transitions ─────────────────────────────────────────────────── */
  const switchMode = useCallback(
    (next: Mode, autoStart = false) => {
      setMode(next);
      const secs = settings[next] * 60;
      setRemaining(secs);
      if (autoStart) {
        endAt.current = Date.now() + secs * 1000;
        setRunning(true);
      } else {
        endAt.current = null;
        setRunning(false);
      }
    },
    [settings],
  );

  const nextMode = useCallback(
    (fromMode: Mode, focusCount: number): Mode => {
      if (fromMode !== "focus") return "focus";
      return focusCount % settings.roundsBeforeLong === 0 ? "long" : "short";
    },
    [settings.roundsBeforeLong],
  );

  const complete = useCallback(() => {
    const count = mode === "focus" ? completedFocus + 1 : completedFocus;
    if (mode === "focus") setCompletedFocus(count);
    const upcoming = nextMode(mode, count);
    const message = mode === "focus" ? `Focus complete. Time for a ${MODE_META[upcoming].label.toLowerCase()}.` : "Break over. Back to focus.";
    setAnnouncement(message);
    if (settings.sound) playChime();
    if (settings.notify && typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("The Chemical Archive", { body: message, silent: !settings.sound });
      } catch {
        /* some mobile browsers disallow constructor */
      }
    }
    switchMode(upcoming, settings.autoStart);
  }, [mode, completedFocus, nextMode, settings, switchMode]);

  /* ─── ticking (wall-clock based, survives background tabs) ────────── */
  useEffect(() => {
    if (!running) return;
    if (endAt.current == null) endAt.current = Date.now() + remaining * 1000;
    const id = window.setInterval(() => {
      const left = ((endAt.current ?? Date.now()) - Date.now()) / 1000;
      if (left <= 0) {
        window.clearInterval(id);
        setRemaining(0);
        complete();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, complete]);

  useEffect(() => {
    const base = "Pomodoro — The Chemical Archive";
    document.title = running ? `${fmt(remaining)} · ${MODE_META[mode].label}` : base;
    return () => {
      document.title = base;
    };
  }, [remaining, running, mode]);

  /* ─── controls ────────────────────────────────────────────────────── */
  const start = useCallback(() => {
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);
  const pause = useCallback(() => {
    setRunning(false);
    endAt.current = null;
  }, []);
  const toggle = useCallback(() => (running ? pause() : start()), [running, pause, start]);
  const reset = useCallback(() => {
    setRunning(false);
    endAt.current = null;
    setRemaining(duration);
  }, [duration]);
  const skip = useCallback(() => {
    const count = mode === "focus" ? completedFocus + 1 : completedFocus;
    if (mode === "focus") setCompletedFocus(count);
    switchMode(nextMode(mode, count), false);
  }, [mode, completedFocus, nextMode, switchMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable=true]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " " && !el.closest("button")) {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === "r") reset();
      else if (e.key.toLowerCase() === "s") skip();
      else if (e.key === "1") switchMode("focus");
      else if (e.key === "2") switchMode("short");
      else if (e.key === "3") switchMode("long");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, reset, skip, switchMode]);

  async function toggleNotify() {
    if (settings.notify) return setSettings((s) => ({ ...s, notify: false }));
    if (typeof Notification === "undefined") return;
    const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    setSettings((s) => ({ ...s, notify: perm === "granted" }));
  }

  function updateDuration(key: "focus" | "short" | "long" | "roundsBeforeLong", value: number) {
    const max = key === "roundsBeforeLong" ? 12 : 180;
    const v = Math.min(Math.max(Math.round(value) || 1, 1), max);
    setSettings((s) => ({ ...s, [key]: v }));
    if (key === mode && !running) setRemaining(v * 60);
  }

  /* ─── ring geometry ───────────────────────────────────────────────── */
  const progress = duration > 0 ? 1 - remaining / duration : 0;
  const R = 46;
  const C = 2 * Math.PI * R;
  const ticks = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const round =
    mode === "focus"
      ? (completedFocus % settings.roundsBeforeLong) + 1
      : completedFocus % settings.roundsBeforeLong || settings.roundsBeforeLong;

  return (
    <div className="relative">
      <p className="sr-only" aria-live="assertive">
        {announcement}
      </p>

      {/* Mode selector */}
      <div role="tablist" aria-label="Timer mode" className="mx-auto flex max-w-md justify-between border-b border-line">
        {(Object.keys(MODE_META) as Mode[]).map((m, i) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "relative px-1 pb-4 font-sans text-[0.62rem] uppercase tracking-[0.26em] transition-colors duration-500 sm:text-[0.65rem]",
              mode === m ? "text-ivory" : "text-ivory-500 hover:text-ivory-200",
            )}
          >
            <span className="mr-2 hidden text-ivory-500 sm:inline">{i + 1}</span>
            {MODE_META[m].label}
            {mode === m && (
              <motion.span layoutId="pomodoro-tab" className="absolute -bottom-px left-0 right-0 h-px bg-bronze" transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }} />
            )}
          </button>
        ))}
      </div>

      {/* Dial */}
      <div className="relative mx-auto mt-12 aspect-square w-[min(84vw,30rem)] md:mt-16">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          {ticks.map((t) => {
            const a = (t / 60) * Math.PI * 2;
            const inner = t % 5 === 0 ? 40.5 : 41.8;
            const lit = t / 60 < progress;
            return (
              <line
                key={t}
                x1={50 + inner * Math.cos(a)}
                y1={50 + inner * Math.sin(a)}
                x2={50 + 43 * Math.cos(a)}
                y2={50 + 43 * Math.sin(a)}
                stroke={lit ? "#b39469" : "rgb(236 230 218 / 0.18)"}
                strokeWidth={t % 5 === 0 ? 0.35 : 0.2}
                style={{ transition: "stroke 0.8s ease" }}
              />
            );
          })}
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(236 230 218 / 0.08)" strokeWidth="0.3" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#b39469"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: running && !reduce ? "stroke-dashoffset 0.25s linear" : "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div
          aria-hidden
          className={cn(
            "absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(179,148,105,0.16),transparent_70%)] transition-opacity duration-1000",
            running ? "opacity-100" : "opacity-40",
          )}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -6 }}
              transition={{ duration: 0.5 }}
              className="font-sans text-[0.62rem] uppercase tracking-[0.4em] text-bronze"
            >
              {MODE_META[mode].title}
            </motion.p>
          </AnimatePresence>
          <p
            className="mt-2 font-display text-[clamp(4.5rem,20vw,8.5rem)] font-light leading-none tabular tracking-[-0.02em]"
            role="timer"
            aria-live="off"
            aria-label={`${fmt(remaining)} remaining`}
          >
            {fmt(remaining)}
          </p>
          <p className="mt-3 font-display text-base italic text-ivory-400 md:text-lg">{MODE_META[mode].line}</p>
          <p className="mt-4 font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ivory-500">
            Round {round} / {settings.roundsBeforeLong} · {completedFocus} done
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-4 md:mt-14">
        <IconButton label="Reset (R)" onClick={reset}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.25} />
        </IconButton>
        <button
          type="button"
          onClick={toggle}
          className="group relative flex h-16 min-w-[11rem] items-center justify-center gap-3 bg-ivory px-8 font-sans text-[0.7rem] uppercase tracking-luxe text-ink transition-colors duration-500 hover:bg-bronze-300"
          aria-keyshortcuts="Space"
        >
          {running ? <Pause className="h-4 w-4" strokeWidth={1.5} /> : <Play className="h-4 w-4" strokeWidth={1.5} />}
          {running ? "Pause" : remaining < duration ? "Resume" : "Start"}
        </button>
        <IconButton label="Skip (S)" onClick={skip}>
          <SkipForward className="h-4 w-4" strokeWidth={1.25} />
        </IconButton>
      </div>

      <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2">
        <IconButton small label={settings.sound ? "Sound on" : "Sound off"} pressed={settings.sound} onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}>
          {settings.sound ? <Volume2 className="h-3.5 w-3.5" strokeWidth={1.25} /> : <VolumeX className="h-3.5 w-3.5" strokeWidth={1.25} />}
        </IconButton>
        <IconButton small label={settings.notify ? "Notifications on" : "Notifications off"} pressed={settings.notify} onClick={toggleNotify}>
          {settings.notify ? <Bell className="h-3.5 w-3.5" strokeWidth={1.25} /> : <BellOff className="h-3.5 w-3.5" strokeWidth={1.25} />}
        </IconButton>
        <IconButton small label="Timer settings" pressed={showSettings} onClick={() => setShowSettings((v) => !v)}>
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.25} />
        </IconButton>
      </div>

      <AnimatePresence initial={false}>
        {showSettings && (
          <motion.section
            aria-label="Timer settings"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl overflow-hidden"
          >
            <div className="mt-10 border border-line p-6 md:p-10">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Durations (minutes)</p>
                <button type="button" onClick={() => setShowSettings(false)} aria-label="Close settings" className="p-1 text-ivory-400 hover:text-ivory">
                  <X className="h-4 w-4" strokeWidth={1.25} />
                </button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                {(
                  [
                    ["focus", "Focus"],
                    ["short", "Short break"],
                    ["long", "Long break"],
                    ["roundsBeforeLong", "Rounds"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="field-label">{label}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={key === "roundsBeforeLong" ? 12 : 180}
                      value={settings[key]}
                      onChange={(e) => updateDuration(key, Number(e.target.value))}
                      className="field font-display text-3xl tabular"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-8 flex cursor-pointer items-center justify-between gap-6 border-t border-line pt-6">
                <span>
                  <span className="block font-sans text-sm text-ivory">Auto-start the next session</span>
                  <span className="mt-1 block font-sans text-xs text-ivory-500">Flow straight from focus into break and back.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => setSettings((s) => ({ ...s, autoStart: e.target.checked }))}
                  className="h-4 w-4 accent-[#b39469]"
                />
              </label>
              <div className="mt-6 flex justify-between border-t border-line pt-6">
                <button
                  type="button"
                  className="link-luxe text-ivory-400"
                  onClick={() => {
                    setSettings(DEFAULTS);
                    if (!running) setRemaining(DEFAULTS[mode] * 60);
                  }}
                >
                  Restore defaults
                </button>
                <p className="hidden font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory-500 sm:block">Saved on this device</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <p className="mx-auto mt-12 hidden max-w-md text-center font-sans text-[0.6rem] uppercase tracking-[0.22em] text-ivory-500 md:block">
        Space start / pause · R reset · S skip · 1 2 3 modes
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  pressed,
  small,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  pressed?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        "grid place-items-center border transition-colors duration-500",
        small ? "h-10 w-10" : "h-16 w-16",
        pressed ? "border-bronze/60 text-bronze-300" : "border-line text-ivory-300 hover:border-ivory/30 hover:text-ivory",
      )}
    >
      {children}
    </button>
  );
}
