"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HeroArchitecture } from "@/components/visual/HeroArchitecture";
import { TextReveal } from "@/components/motion/TextReveal";
import { INSTITUTION, SITE_TAGLINE } from "@/lib/constants";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ sectionCount, subjectCount }: { sectionCount: number; subjectCount: number }) {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.2 : 1.4, delay: reduce ? 0 : delay, ease: EASE },
  });

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden" aria-label="Introduction">
      <HeroArchitecture />

      <div className="frame relative pb-14 pt-32 md:pb-20">
        <motion.p {...fade(0.2)} className="eyebrow mb-8 flex items-center gap-4 md:mb-12">
          <span className="h-px w-10 bg-bronze" aria-hidden />
          {INSTITUTION}
        </motion.p>

        <TextReveal
          as="h1"
          immediate
          delay={0.35}
          stagger={0.14}
          className="font-display text-display-2xl font-light uppercase"
          lines={[
            <span key="the" className="text-[0.42em] italic tracking-normal text-ivory-200 normal-case">
              The
            </span>,
            "Chemical",
            <span key="archive" className="md:pl-[0.9em]">
              Archive
            </span>,
          ]}
        />

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
          <motion.p
            {...fade(1.1)}
            className="font-display text-2xl font-light italic leading-snug text-ivory-200 md:col-span-5 md:text-3xl"
          >
            {SITE_TAGLINE}
          </motion.p>

          <motion.div {...fade(1.3)} className="flex flex-wrap items-center gap-8 md:col-span-6 md:col-start-7 md:justify-end">
            <dl className="flex gap-10 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ivory-400">
              <div>
                <dt className="sr-only">Academic sections</dt>
                <dd>
                  <span className="mr-2 font-display text-2xl tracking-normal text-ivory tabular">{String(sectionCount).padStart(2, "0")}</span>
                  Sections
                </dd>
              </div>
              <div>
                <dt className="sr-only">Subjects</dt>
                <dd>
                  <span className="mr-2 font-display text-2xl tracking-normal text-ivory tabular">{String(subjectCount).padStart(2, "0")}</span>
                  Subjects
                </dd>
              </div>
            </dl>
            <Link href="/archive" className="btn-luxe group">
              Explore the archive
              <span aria-hidden className="transition-transform duration-700 ease-luxe group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.2 }}
      >
        <span className="block h-12 w-px overflow-hidden bg-ivory/10">
          <motion.span
            className="block h-1/2 w-px bg-bronze"
            animate={reduce ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
