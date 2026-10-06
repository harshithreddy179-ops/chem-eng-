"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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

const MODE_META: Record<Mode, { label: string; title: string; line: string; hex: string; tab: string; soft: string }> = {
  focus: { label: "Study", title: "Study time", line: "Focus on one thing", hex: "#f43f5e", tab: "bg-rose-500 text-white", soft: "bg-rose-50" },
  short: { label: "Short break", title: "Short break", line: "Stand up, drink water", hex: "#10b981", tab: "bg-emerald-500 text-white", soft: "bg-emerald-50" },
  long: { label: "Long break", title: "Long break", line: "Take a proper rest", hex: "#0ea5e9", tab: "bg-sky-500 text-white", soft: "bg-sky-50" },
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
    const base = "Study Timer — The Chemical Archive";
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
  const R = 44;
  const C = 2 * Math.PI * R;
  const round =
    mode === "focus"
      ? (completedFocus % settings.roundsBeforeLong) + 1
      : completedFocus % settings.roundsBeforeLong || settings.roundsBeforeLong;

  const meta = MODE_META[mode];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="sr-only" aria-live="assertive">
        {announcement}
      </p>

      <div className={cn("card overflow-hidden transition-colors", meta.soft)}>
        {/* Mode selector */}
        <div role="tablist" aria-label="Timer mode" className="grid grid-cols-3 gap-1.5 border-b border-line bg-white p-2">
          {(Object.keys(MODE_META) as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-xl px-2 py-2.5 text-[15px] font-semibold transition",
                mode === m ? MODE_META[m].tab : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {MODE_META[m].label}
            </button>
          ))}
        </div>

        {/* Dial */}
        <div className="relative mx-auto my-8 aspect-square w-[min(78vw,22rem,50svh)]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={R} fill="white" stroke="#e8edf5" strokeWidth="5" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={meta.hex}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: running && !reduce ? "stroke-dashoffset 0.25s linear" : "stroke-dashoffset 0.6s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-base font-bold" style={{ color: meta.hex }}>
              {meta.title}
            </p>
            <p
              className="mt-1 text-[clamp(3.5rem,15vw,5.5rem)] font-bold leading-none tabular text-slate-900"
              role="timer"
              aria-live="off"
              aria-label={`${fmt(remaining)} remaining`}
            >
              {fmt(remaining)}
            </p>
            <p className="mt-2 text-[15px] text-slate-500">{meta.line}</p>
            <p className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              Round {round} of {settings.roundsBeforeLong} · {completedFocus} done
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-4 pb-6">
          <IconButton label="Reset (R)" onClick={reset}>
            <RotateCcw className="h-5 w-5" />
          </IconButton>
          <button
            type="button"
            onClick={toggle}
            className="flex h-14 min-w-[10rem] items-center justify-center gap-2 rounded-2xl px-8 text-lg font-bold text-white shadow-sm transition hover:brightness-110"
            style={{ backgroundColor: meta.hex }}
            aria-keyshortcuts="Space"
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? "Pause" : remaining < duration ? "Resume" : "Start"}
          </button>
          <IconButton label="Skip (S)" onClick={skip}>
            <SkipForward className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-line bg-white px-4 py-3">
          <IconButton small label={settings.sound ? "Sound on" : "Sound off"} pressed={settings.sound} onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}>
            {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </IconButton>
          <IconButton small label={settings.notify ? "Notifications on" : "Notifications off"} pressed={settings.notify} onClick={toggleNotify}>
            {settings.notify ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </IconButton>
          <IconButton small label="Timer settings" pressed={showSettings} onClick={() => setShowSettings((v) => !v)}>
            <Settings2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showSettings && (
          <motion.section
            aria-label="Timer settings"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.3 }}
            className="overflow-hidden"
          >
            <div className="card mt-4 p-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-slate-900">Timer settings (minutes)</p>
                <button type="button" onClick={() => setShowSettings(false)} aria-label="Close settings" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {(
                  [
                    ["focus", "Study"],
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
                      className="field text-xl font-semibold tabular"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-5 flex cursor-pointer items-center justify-between gap-6 border-t border-line pt-4">
                <span>
                  <span className="block text-[15px] font-semibold text-slate-800">Start the next timer automatically</span>
                  <span className="block text-sm text-slate-500">Go from study to break and back without pressing Start.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => setSettings((s) => ({ ...s, autoStart: e.target.checked }))}
                  className="h-5 w-5 accent-brand-600"
                />
              </label>
              <div className="mt-4 flex justify-between border-t border-line pt-4">
                <button
                  type="button"
                  className="link-luxe"
                  onClick={() => {
                    setSettings(DEFAULTS);
                    if (!running) setRemaining(DEFAULTS[mode] * 60);
                  }}
                >
                  Reset to default
                </button>
                <p className="text-sm text-slate-500">Saved on this device</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <p className="mt-5 hidden text-center text-sm text-slate-500 md:block">
        Keyboard: <b>Space</b> start / pause · <b>R</b> reset · <b>S</b> skip · <b>1 2 3</b> change mode
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
        "grid place-items-center rounded-xl border transition",
        small ? "h-10 w-10" : "h-14 w-14 bg-white",
        pressed ? "border-brand-200 bg-brand-50 text-brand-600" : "border-slate-200 text-slate-600 hover:bg-slate-100",
      )}
    >
      {children}
    </button>
  );
}
