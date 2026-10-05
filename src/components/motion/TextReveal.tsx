"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface TextRevealProps {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
  as?: "h1" | "h2" | "h3" | "p";
}

/** Each line rises from behind a mask — the editorial headline reveal. */
export function TextReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  immediate = false,
  as = "h2",
}: TextRevealProps) {
  const reduce = useReducedMotion();
  const Tag = as;
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } };
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            initial="hidden"
            {...trigger}
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "105%" },
              show: reduce ? { opacity: 1 } : { y: "0%" },
            }}
            transition={{ duration: reduce ? 0.3 : 1.4, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
