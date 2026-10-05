import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

/** An ivory "paper" interlude explaining what the archive is. */
export function Purpose() {
  return (
    <section className="relative overflow-hidden bg-ivory text-ink" aria-label="The purpose">
      <div className="frame grid gap-14 py-28 md:grid-cols-12 md:py-44">
        <Reveal className="md:col-span-3">
          <p className="font-sans text-eyebrow uppercase text-ink/50">
            <span className="text-bronze-600">01</span> &nbsp;— &nbsp;The Purpose
          </p>
        </Reveal>
        <div className="md:col-span-9">
          <TextReveal
            as="h2"
            className="font-display text-display-lg font-light uppercase"
            lines={["One place for", "the entire", <em key="j" className="font-light italic normal-case text-bronze-600">academic journey</em>]}
          />
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            <Reveal delay={0.1}>
              <p className="font-display text-2xl leading-snug text-ink/80 md:text-[1.9rem]">
                Class material, previous-year questions and useful tools — carefully organised for your semester.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="font-sans text-[0.95rem] leading-[1.9] text-ink/60">
                No more searching through group chats and forwarded folders. Every lecture, every paper and every set of
                notes lives in one quiet place — arranged by exam, by subject and by chapter. Mark what you have finished
                and the archive keeps count for you.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
      <div aria-hidden className="frame">
        <div className="h-px bg-ink/10" />
      </div>
    </section>
  );
}
