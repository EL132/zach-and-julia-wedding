import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InteriorIntro, InteriorPageShell } from "@/app/components/InteriorPage";
import { ourStoryContent } from "@/app/content/site";

export const metadata: Metadata = {
  title: "Our Story | Julia & Zach",
  description: "The story behind Julia & Zach's wedding weekend.",
};

type TimelineImage = {
  src: string;
  alt: string;
} | null;

function TimelinePhoto({ image, title }: { image: TimelineImage; title: string }) {
  if (image) {
    return (
      <div className="relative h-56 w-full max-w-[18rem] overflow-hidden rounded-md border border-[#A8B58A]/45 bg-[#F8F4EA] sm:h-64">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 18rem, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${title} photo coming soon`}
      className="aspect-[3/2] w-full max-w-[18rem] rounded-md border border-[#A8B58A]/45 bg-[#F8F4EA] p-5"
    >
      <div className="flex h-full flex-col items-center justify-center border border-dashed border-[#A8B58A]/45 text-center">
        <p className="font-serif text-2xl leading-tight text-[#35452C]">
          Photo coming soon
        </p>
        <p className="mt-3 max-w-[10rem] text-[0.68rem] uppercase tracking-[0.22em] text-[#6F7A4B]">
          Shared album placeholder
        </p>
      </div>
    </div>
  );
}

export default function OurStoryPage() {
  return (
    <InteriorPageShell>
      <InteriorIntro eyebrow={ourStoryContent.eyebrow} title={ourStoryContent.title}>
        {ourStoryContent.introLine}
      </InteriorIntro>

      <section className="mt-14 max-w-[60rem] border-t border-[#A8B58A]/45 pt-8 sm:pt-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
          {ourStoryContent.prologue.label}
        </p>
        <div className="mt-6 space-y-6">
          <p className="max-w-4xl font-serif text-3xl leading-[1.22] text-[#35452C] sm:text-4xl">
            {ourStoryContent.prologue.paragraphs[0]}
          </p>
          {ourStoryContent.prologue.paragraphs.slice(1).map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-3xl text-base leading-8 text-[#2D2923]/82 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
            {ourStoryContent.debrief.title}
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#35452C]">
            {ourStoryContent.debrief.intro}
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {ourStoryContent.debrief.cards.map((card) => (
            <article
              key={card.title}
              className="rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8] p-7 sm:p-8"
            >
              <h3 className="font-serif text-3xl leading-tight text-[#35452C]">
                {card.title}
              </h3>
              <p className="mt-5 text-base leading-8 text-[#2D2923]/82">
                {card.body}
              </p>
              <p className="mt-6 border-t border-[#A8B58A]/35 pt-5 text-sm uppercase tracking-[0.18em] text-[#6F7A4B]">
                {card.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 border-y border-[#A8B58A]/45 py-6">
        <p className="text-center text-xs uppercase leading-7 tracking-[0.22em] text-[#35452C] sm:tracking-[0.32em]">
          {ourStoryContent.routeLine}
        </p>
      </section>

      <section className="mt-16">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
            Timeline
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#35452C]">
            {ourStoryContent.timelineTitle}
          </h2>
        </div>

        <div className="relative mt-10 space-y-10">
          <div
            className="absolute bottom-0 left-4 top-0 w-px bg-[#A8B58A]/45 md:left-1/2"
            aria-hidden="true"
          />
          {ourStoryContent.timeline.map((entry, index) => {
            const textClass =
              index % 2 === 0
                ? "md:col-start-1 md:row-start-1 md:pr-10 md:text-right"
                : "md:col-start-3 md:row-start-1 md:pl-10";
            const imageClass =
              index % 2 === 0
                ? "flex w-full justify-center md:col-start-3 md:row-start-1"
                : "flex w-full justify-center md:col-start-1 md:row-start-1";

            return (
              <article
                key={`${entry.year}-${entry.title}`}
                className="relative grid gap-5 pl-12 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:items-center md:gap-0 md:pl-0"
              >
                <span
                  className="absolute left-[0.56rem] top-2 z-10 flex h-4 w-4 rounded-full border border-[#35452C] bg-[#F8F4EA] md:left-1/2 md:-translate-x-1/2"
                  aria-hidden="true"
                >
                  <span className="m-auto h-1.5 w-1.5 rounded-full bg-[#35452C]" />
                </span>

                <div className={textClass}>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6F7A4B]">
                    {entry.year}
                  </p>
                  <h3 className="mt-3 font-serif text-3xl leading-tight text-[#35452C]">
                    {entry.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-[#2D2923]/78">
                    {entry.text}
                  </p>
                </div>

                <div className={imageClass}>
                  <TimelinePhoto image={entry.image} title={entry.title} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8] p-7 sm:p-9">
        <h2 className="max-w-4xl font-serif text-3xl leading-tight text-[#35452C] sm:text-4xl">
          {ourStoryContent.closing.title}
        </h2>
        <p className="mt-5 text-base leading-8 text-[#2D2923]/80 sm:text-lg">
          {ourStoryContent.closing.body}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {ourStoryContent.closing.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex rounded-sm border border-[#35452C]/45 px-5 py-3 text-sm font-medium text-[#35452C] transition-colors hover:border-[#35452C] hover:bg-[#F8F4EA]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </InteriorPageShell>
  );
}
