import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/motion/TextReveal";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeadingProps {
  index?: string;
  eyebrow?: string;
  title: string | string[];
  lede?: string;
  align?: "left" | "split";
  as?: "h1" | "h2";
  className?: string;
  size?: "xl" | "lg" | "md";
}

/** Editorial heading: numbered eyebrow, serif display title, optional lede. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  as = "h2",
  className,
  size = "lg",
}: SectionHeadingProps) {
  const lines = Array.isArray(title) ? title : [title];
  const sizeClass = size === "xl" ? "text-display-xl" : size === "lg" ? "text-display-lg" : "text-display-md";
  return (
    <header
      className={cn(
        align === "split" ? "grid gap-10 lg:grid-cols-12 lg:items-end" : "flex flex-col gap-8",
        className,
      )}
    >
      <div className={cn(align === "split" && "lg:col-span-7")}>
        {(index || eyebrow) && (
          <Reveal y={10} className="mb-7 flex items-center gap-4">
            {index && <span className="eyebrow tabular text-bronze">{index}</span>}
            {index && eyebrow && <span className="h-px w-10 bg-ivory/25" aria-hidden />}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </Reveal>
        )}
        <TextReveal as={as} lines={lines} className={cn("font-display font-light uppercase", sizeClass)} />
      </div>
      {lede && (
        <Reveal delay={0.25} className={cn(align === "split" ? "lg:col-span-4 lg:col-start-9" : "max-w-xl")}>
          <p className="font-display text-2xl font-light italic leading-snug text-ivory-200 md:text-[1.75rem]">{lede}</p>
        </Reveal>
      )}
    </header>
  );
}
