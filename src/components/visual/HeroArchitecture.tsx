"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * The hero's visual: an abstract industrial–architectural composition
 * drawn entirely in SVG (no photography, ~zero bytes over the wire).
 * Two distillation columns read as monoliths in a colonnade, lit by a
 * single warm shaft of light. Layers drift at different scroll speeds.
 */
export function HeroArchitecture() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const far = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "8%"]);
  const mid = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const near = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.25]);

  const trays = Array.from({ length: 22 }, (_, i) => 210 + i * 38);
  const colonnade = Array.from({ length: 14 }, (_, i) => i);

  return (
    <motion.div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden" style={{ opacity: fade }}>
      {/* atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_72%_18%,rgba(179,148,105,0.20),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_100%,rgba(236,230,218,0.05),transparent_70%)]" />

      {/* far layer — colonnade & orbit */}
      <motion.svg
        style={{ y: far }}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="col-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ece6da" stopOpacity="0" />
            <stop offset="0.35" stopColor="#ece6da" stopOpacity="0.10" />
            <stop offset="1" stopColor="#ece6da" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="1180" cy="330" r="300" fill="none" stroke="#ece6da" strokeOpacity="0.06" />
        <circle cx="1180" cy="330" r="420" fill="none" stroke="#ece6da" strokeOpacity="0.035" />
        <circle cx="1180" cy="330" r="560" fill="none" stroke="#b39469" strokeOpacity="0.05" strokeDasharray="2 10" />
        {colonnade.map((i) => {
          const x = 60 + i * 72 + i * i * 2.2;
          const top = 120 + i * 9;
          return <rect key={i} x={x} y={top} width={1 + i * 0.25} height={1000 - top} fill="url(#col-fade)" />;
        })}
        <line x1="0" y1="742" x2="1600" y2="742" stroke="#ece6da" strokeOpacity="0.07" />
      </motion.svg>

      {/* mid layer — secondary column */}
      <motion.svg
        style={{ y: mid }}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="metal-dim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#141310" />
            <stop offset="0.55" stopColor="#3a332a" />
            <stop offset="0.7" stopColor="#5c4d39" />
            <stop offset="1" stopColor="#141310" />
          </linearGradient>
          <linearGradient id="vfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.75" stopColor="#0d0c0b" stopOpacity="0.2" />
            <stop offset="1" stopColor="#0d0c0b" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g opacity="0.75">
          <path d="M1380 300 a55 55 0 0 1 110 0 V1000 H1380 Z" fill="url(#metal-dim)" />
          {trays.slice(3).map((y) => (
            <line key={y} x1="1380" x2="1490" y1={y + 40} y2={y + 40} stroke="#ece6da" strokeOpacity="0.05" />
          ))}
          <path d="M1305 470 C 1340 470, 1340 400, 1380 400" fill="none" stroke="#b39469" strokeOpacity="0.35" strokeWidth="5" />
          <rect x="1380" y="300" width="110" height="700" fill="url(#vfade)" />
        </g>
      </motion.svg>

      {/* near layer — primary column (the monolith) */}
      <motion.svg
        style={{ y: near }}
        className="absolute inset-0 h-full w-full animate-slow-drift"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0f0e0c" />
            <stop offset="0.38" stopColor="#2b2620" />
            <stop offset="0.62" stopColor="#8a7151" />
            <stop offset="0.7" stopColor="#c7ab82" />
            <stop offset="0.78" stopColor="#6e5a40" />
            <stop offset="1" stopColor="#100f0d" />
          </linearGradient>
          <linearGradient id="near-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d0c0b" stopOpacity="0" />
            <stop offset="0.7" stopColor="#0d0c0b" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0d0c0b" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="cap-light" cx="0.65" cy="0.2" r="0.6">
            <stop offset="0" stopColor="#ece6da" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ece6da" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M1060 210 a120 120 0 0 1 240 0 V1000 H1060 Z" fill="url(#metal)" />
        <path d="M1060 210 a120 120 0 0 1 240 0 Z" fill="url(#cap-light)" />
        {trays.map((y, i) => (
          <line
            key={y}
            x1="1060"
            x2="1300"
            y1={y}
            y2={y}
            stroke={i % 5 === 0 ? "#b39469" : "#ece6da"}
            strokeOpacity={i % 5 === 0 ? 0.28 : 0.06}
          />
        ))}
        <line x1="1180" y1="60" x2="1180" y2="90" stroke="#ece6da" strokeOpacity="0.3" />
        <rect x="1060" y="90" width="240" height="910" fill="url(#near-fade)" />
      </motion.svg>

      {/* legibility veil + grain */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent md:via-ink/40" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div className="grain absolute inset-0 overflow-hidden" />
    </motion.div>
  );
}
