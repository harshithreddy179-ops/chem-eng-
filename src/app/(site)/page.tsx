import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Purpose } from "@/components/home/Purpose";
import { Pillars } from "@/components/home/Pillars";
import { SubjectList } from "@/components/home/SubjectList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Reveal } from "@/components/motion/Reveal";
import { SubjectMotif } from "@/components/visual/SubjectMotif";
import { getArchiveIndex, getSections, getSubjects, trackableKeys } from "@/lib/data/public";

export const revalidate = 300;

export default async function HomePage() {
  const [sections, subjects, index] = await Promise.all([getSections(), getSubjects(), getArchiveIndex()]);
  const allKeys = trackableKeys(index);
  const motifs = Object.fromEntries(subjects.map((s) => [s.slug, <SubjectMotif key={s.slug} slug={s.slug} />]));

  return (
    <>
      <Hero sectionCount={sections.length} subjectCount={subjects.length} />
      <Purpose />
      <Pillars />

      <section className="frame py-24 md:py-36" aria-label="Subjects">
        <SectionHeading
          index="03"
          eyebrow="The Subjects"
          title={["Six disciplines,", "one archive"]}
          lede="The foundations of a chemical engineer — each with its own room in every exam."
          align="split"
          className="mb-16 md:mb-24"
        />
        <SubjectList subjects={subjects} motifs={motifs} />
      </section>

      <section className="frame py-24 md:py-32" aria-labelledby="progress-heading">
        <div className="grid gap-14 border-t border-line pt-16 md:grid-cols-12 md:pt-24">
          <Reveal className="md:col-span-5">
            <p className="eyebrow">
              <span className="text-bronze">04</span> &nbsp;— &nbsp;Your progress
            </p>
            <h2 id="progress-heading" className="mt-8 font-display text-display-md font-light uppercase">
              Your overall
              <br />
              progress
            </h2>
            <p className="mt-6 max-w-sm font-display text-xl italic text-ivory-300">
              Tick off chapters and lectures as you finish them. Your progress is saved privately on this device — no
              account needed.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7 md:self-end">
            <ProgressBar keys={allKeys} label="Across the entire archive" />
            {allKeys.length === 0 && (
              <p className="mt-8 font-sans text-sm leading-relaxed text-ivory-400">
                Progress appears once the first chapters and lectures are added to the archive.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="frame pt-12 md:pt-24" aria-label="Begin">
        <Reveal className="relative overflow-hidden border border-line px-6 py-20 text-center md:px-16 md:py-32">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(179,148,105,0.14),transparent_65%)]" />
          <p className="eyebrow relative">Begin where you are</p>
          <p className="relative mx-auto mt-8 max-w-4xl font-display text-display-md font-light uppercase">
            Choose an exam. <em className="normal-case italic text-bronze-300">Open a subject.</em> Start.
          </p>
          <div className="relative mt-12 flex flex-wrap items-center justify-center gap-6">
            <Link href="/archive" className="btn-solid">
              Explore the archive →
            </Link>
            <Link href="/tools/pomodoro" className="btn-luxe">
              Start a focus session
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
