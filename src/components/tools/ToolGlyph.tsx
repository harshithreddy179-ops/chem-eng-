import { ArrowLeftRight, CalendarCheck, Calculator, GraduationCap, Sigma, Timer, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const TOOL_STYLE: Record<string, { icon: LucideIcon; tone: string; solid: string; tint: string }> = {
  pomodoro: { icon: Timer, tone: "bg-amber-50 text-amber-600", solid: "bg-amber-500", tint: "from-amber-50 via-white to-orange-50" },
  attendance: { icon: CalendarCheck, tone: "bg-emerald-50 text-emerald-600", solid: "bg-emerald-500", tint: "from-emerald-50 via-white to-teal-50" },
  calculator: { icon: Calculator, tone: "bg-violet-50 text-violet-600", solid: "bg-violet-500", tint: "from-violet-50 via-white to-brand-50" },
  "unit-converter": { icon: ArrowLeftRight, tone: "bg-slate-100 text-slate-500", solid: "bg-slate-400", tint: "" },
  "formula-reference": { icon: Sigma, tone: "bg-slate-100 text-slate-500", solid: "bg-slate-400", tint: "" },
  "gpa-calculator": { icon: GraduationCap, tone: "bg-slate-100 text-slate-500", solid: "bg-slate-400", tint: "" },
};

/** Coloured icon tile for a tool. */
export function ToolGlyph({ slug, size = "md", solid }: { slug: string; size?: "md" | "lg"; solid?: boolean }) {
  const s = TOOL_STYLE[slug] ?? { icon: Wrench, tone: "bg-slate-100 text-slate-500", solid: "bg-slate-400" };
  const Icon = s.icon;
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center", size === "lg" ? "h-14 w-14 rounded-2xl" : "h-12 w-12 rounded-xl", solid ? cn(s.solid, "text-white shadow-sm") : s.tone)}>
      <Icon className={size === "lg" ? "h-7 w-7" : "h-6 w-6"} />
    </span>
  );
}
