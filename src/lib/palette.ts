/* Colour themes for subjects and sections. Full class strings so Tailwind
   keeps them. Unknown slugs fall back to a stable theme picked by hash. */

export interface ColorTheme {
  key: string;
  /** soft tinted background */
  soft: string;
  /** text / icon colour on the soft background */
  text: string;
  /** solid fill (bars, dots) */
  solid: string;
  /** border tint */
  border: string;
  /** gradient for banners */
  gradient: string;
  /** raw colour for SVG strokes */
  hex: string;
}

const THEMES: Record<string, ColorTheme> = {
  orange: { key: "orange", hex: "#f97316", soft: "bg-orange-50", text: "text-orange-600", solid: "bg-orange-500", border: "border-orange-200", gradient: "from-orange-500 to-amber-400" },
  violet: { key: "violet", hex: "#8b5cf6", soft: "bg-violet-50", text: "text-violet-600", solid: "bg-violet-500", border: "border-violet-200", gradient: "from-violet-600 to-fuchsia-500" },
  emerald: { key: "emerald", hex: "#10b981", soft: "bg-emerald-50", text: "text-emerald-600", solid: "bg-emerald-500", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-400" },
  rose: { key: "rose", hex: "#f43f5e", soft: "bg-rose-50", text: "text-rose-600", solid: "bg-rose-500", border: "border-rose-200", gradient: "from-rose-500 to-orange-400" },
  sky: { key: "sky", hex: "#0ea5e9", soft: "bg-sky-50", text: "text-sky-600", solid: "bg-sky-500", border: "border-sky-200", gradient: "from-sky-500 to-cyan-400" },
  teal: { key: "teal", hex: "#14b8a6", soft: "bg-teal-50", text: "text-teal-600", solid: "bg-teal-500", border: "border-teal-200", gradient: "from-teal-500 to-emerald-400" },
  pink: { key: "pink", hex: "#ec4899", soft: "bg-pink-50", text: "text-pink-600", solid: "bg-pink-500", border: "border-pink-200", gradient: "from-pink-500 to-rose-400" },
  amber: { key: "amber", hex: "#f59e0b", soft: "bg-amber-50", text: "text-amber-600", solid: "bg-amber-500", border: "border-amber-200", gradient: "from-amber-500 to-yellow-400" },
  blue: { key: "blue", hex: "#2457e8", soft: "bg-brand-50", text: "text-brand-600", solid: "bg-brand-600", border: "border-brand-200", gradient: "from-brand-600 to-sky-500" },
  indigo: { key: "indigo", hex: "#6366f1", soft: "bg-indigo-50", text: "text-indigo-600", solid: "bg-indigo-500", border: "border-indigo-200", gradient: "from-indigo-600 to-violet-500" },
};

const ROTATION = ["orange", "violet", "emerald", "rose", "sky", "pink", "amber", "teal", "indigo"];

const SUBJECTS: Record<string, string> = {
  "chemical-process-principles": "orange",
  mathematics: "violet",
  chemistry: "emerald",
  "engineering-thermodynamics": "rose",
  "environment-climate": "teal",
  "professional-communication": "sky",
  "professional-communication-lab": "pink",
};

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function subjectTheme(slug: string | null | undefined): ColorTheme {
  const key = (slug && SUBJECTS[slug]) || ROTATION[hash(slug ?? "") % ROTATION.length];
  return THEMES[key];
}

const SECTIONS: Record<string, string> = {
  "midsem-1": "blue",
  "semester-1": "violet",
  "midsem-2": "emerald",
  "semester-2": "orange",
  "midsem-3": "sky",
  "semester-3": "pink",
  "midsem-4": "teal",
  "semester-4": "amber",
};

/** Each exam gets its own colour. */
export function sectionTheme(slug: string | null | undefined): ColorTheme {
  return THEMES[(slug && SECTIONS[slug]) || (slug?.startsWith("semester") ? "indigo" : "blue")];
}

export const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-rose-50 text-rose-700",
};
