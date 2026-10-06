import { Atom, BookOpen, FlaskConical, Flame, Leaf, MessageSquareText, Mic, Sigma, type LucideIcon } from "lucide-react";
import { subjectTheme } from "@/lib/palette";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "chemical-process-principles": FlaskConical,
  mathematics: Sigma,
  chemistry: Atom,
  "engineering-thermodynamics": Flame,
  "environment-climate": Leaf,
  "professional-communication": MessageSquareText,
  "professional-communication-lab": Mic,
};

const SIZES = {
  sm: { box: "h-9 w-9 rounded-lg", icon: "h-[18px] w-[18px]" },
  md: { box: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
  lg: { box: "h-16 w-16 rounded-2xl", icon: "h-8 w-8" },
};

/** Coloured rounded tile with the subject's icon. */
export function SubjectIcon({ slug, size = "md", className }: { slug?: string | null; size?: keyof typeof SIZES; className?: string }) {
  const theme = subjectTheme(slug);
  const Icon = (slug && ICONS[slug]) || BookOpen;
  const s = SIZES[size];
  return (
    <span aria-hidden className={cn("inline-grid shrink-0 place-items-center", s.box, theme.soft, theme.text, className)}>
      <Icon className={s.icon} strokeWidth={2} />
    </span>
  );
}
