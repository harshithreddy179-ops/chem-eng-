import {
  Atom,
  BookMarked,
  Box,
  Compass,
  Droplets,
  Ear,
  Flame,
  Fuel,
  Gauge,
  Hand,
  Leaf,
  MessageSquareText,
  Microscope,
  Radar,
  Scale,
  ShieldAlert,
  Sigma,
  Snowflake,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* Picks an icon from words in the chapter name; falls back to a book. */
const RULES: [RegExp, LucideIcon][] = [
  [/introduc/i, Compass],
  [/stoichiometr/i, Scale],
  [/gas|vapou?r/i, Wind],
  [/humid|solubil/i, Droplets],
  [/pure substance|propert/i, Snowflake],
  [/energy/i, Zap],
  [/control volume|system/i, Box],
  [/water/i, Waves],
  [/fuel/i, Fuel],
  [/corrosion|lubric/i, ShieldAlert],
  [/bio|phyto/i, Microscope],
  [/pollution|monitor|eia|emp/i, Radar],
  [/listen/i, Ear],
  [/non-?verbal/i, Hand],
  [/barrier/i, ShieldAlert],
  [/communicat/i, MessageSquareText],
  [/thermo|heat|temperature/i, Flame],
  [/pressure/i, Gauge],
  [/atom|bond|structure/i, Atom],
  [/environment|climate/i, Leaf],
  [/calculus|integral|differential|series|matri|limit|function/i, Sigma],
];

const COLORS = ["text-violet-500", "text-orange-500", "text-emerald-500", "text-sky-500", "text-rose-500", "text-amber-500", "text-teal-500", "text-pink-500"];

export function ChapterIcon({ name, index, className }: { name: string; index: number; className?: string }) {
  const Icon = RULES.find(([re]) => re.test(name))?.[1] ?? BookMarked;
  return <Icon aria-hidden className={cn("h-7 w-7 shrink-0", COLORS[index % COLORS.length], className)} strokeWidth={1.75} />;
}
