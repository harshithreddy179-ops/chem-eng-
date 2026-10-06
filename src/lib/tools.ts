/**
 * Tool registry. Add an entry (and a route under /tools/<slug>) to ship a
 * new tool — the Tools index renders from this list.
 */
export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  status: "available" | "planned";
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: "pomodoro",
    name: "Pomodoro",
    tagline: "Focus deliberately.",
    summary: "Twenty-five minutes of focus, a short pause, repeat. Configurable, keyboard-friendly and quiet.",
    status: "available",
  },
  {
    slug: "attendance",
    name: "Attendance",
    tagline: "Know where you stand.",
    summary: "Your timetable as a calendar. Mark each class, and see every subject against the 85% line — and how many you can still miss.",
    status: "available",
  },
  {
    slug: "calculator",
    name: "Scientific Calculator",
    tagline: "Calculate precisely.",
    summary: "Trigonometry, logarithms, powers and scientific notation — also a tap away on every page.",
    status: "available",
  },
  { slug: "unit-converter", name: "Unit Converter", tagline: "", summary: "Pressure, energy, flow and more.", status: "planned" },
  { slug: "formula-reference", name: "Formula Reference", tagline: "", summary: "The equations you reach for most.", status: "planned" },
  { slug: "gpa-calculator", name: "GPA Calculator", tagline: "", summary: "SPI and CPI, quickly.", status: "planned" },
];
