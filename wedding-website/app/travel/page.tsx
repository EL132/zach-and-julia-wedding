import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InteriorIntro, InteriorPageShell } from "@/app/components/InteriorPage";
import { travelContent } from "@/app/content/site";
import TravelRequirementsModal from "./TravelRequirementsModal";

export const metadata: Metadata = {
  title: "Travel | Julia & Zach",
  description: "Travel guidance for Julia & Zach's wedding weekend at Maryhill Estate.",
};

type TravelNote =
  | string
  | {
      text: string;
      href: string;
      linkLabel: string;
      suffix?: string;
    };

function getNoteKey(note: TravelNote) {
  return typeof note === "string" ? note : `${note.text}-${note.href}`;
}

function TravelNoteText({ note }: { note: TravelNote }) {
  if (typeof note === "string") return <>{note}</>;

  return (
    <>
      {note.text}
      <a
        href={note.href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-[#35452C] underline decoration-[#A8B58A] underline-offset-4 transition-colors hover:text-[#1A1712]"
      >
        {note.linkLabel}
      </a>
      {note.suffix}
    </>
  );
}

export default function TravelPage() {
  return (
    <InteriorPageShell>
      <TravelRequirementsModal content={travelContent.requirementsModal} />

      <InteriorIntro eyebrow={travelContent.eyebrow} title={travelContent.title}>
        {travelContent.intro}
      </InteriorIntro>

      <section className="mt-14 rounded-md border border-[#A8B58A]/50 bg-[#EFE7D8] p-7 sm:p-9">
        <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
          {travelContent.startHere.title}
        </p>
        <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-[#35452C] sm:text-5xl">
          {travelContent.startHere.heading}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[#2D2923]/82 sm:text-lg">
          {travelContent.startHere.body}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {travelContent.routeCards.map((route) => (
          <article
            key={route.heading}
            className="relative flex min-h-full flex-col overflow-visible rounded-md border border-[#A8B58A]/55 bg-[#F8F4EA] p-6 sm:p-7"
          >
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 h-12 w-12 border-b border-l border-[#A8B58A]/25 bg-[#EFE7D8]/45"
            />
            {route.label ? (
              <span className="absolute -left-10 top-6 z-10 origin-top-left rotate-[-30deg] rounded-full border border-[#A8B58A]/65 bg-[#F8F4EA]/95 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#35452C]">
                {route.label}
              </span>
            ) : null}
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6F7A4B]">
                {route.title}
              </p>
            </div>
            <h3 className="mt-5 font-serif text-3xl leading-tight text-[#35452C]">
              {route.heading}
            </h3>
            <p className="mt-4 text-base leading-7 text-[#2D2923]/78">
              {route.body}
            </p>
            <div className="mt-auto pt-7">
              <div className="border-t border-dashed border-[#A8B58A]/65 pt-5">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6F7A4B]">
                  Route
                </p>
                <p className="mt-2 text-sm leading-6 text-[#35452C]">
                  {route.routeHint}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-14 rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8]/70 p-7 sm:p-9">
        <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
          Route Timeline
        </p>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {travelContent.timeline.map((stop, index) => (
            <li
              key={stop.label}
              className="relative border-l border-[#A8B58A]/55 pl-6 md:border-l-0 md:border-t md:pl-0 md:pt-7"
            >
              <span className="absolute -left-[0.45rem] top-0 flex h-4 w-4 items-center justify-center rounded-full border border-[#35452C] bg-[#F8F4EA] md:-top-[0.48rem] md:left-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#35452C]" />
              </span>
              <p className="text-xs uppercase tracking-[0.22em] text-[#6F7A4B]">
                Step {index + 1}
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#35452C]">
                {stop.label}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#2D2923]/76">
                {stop.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-4xl leading-tight text-[#35452C]">
          <Link
            href="/rendering"
            className="rounded-sm underline decoration-[#A8B58A] decoration-1 underline-offset-8 transition-colors hover:text-[#1A1712] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35 focus-visible:ring-offset-4"
          >
            Explore Maryhill Estate
          </Link>
        </h2>
      </section>

      <section className="mt-14">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
            Travel Details
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#35452C]">
            Planning Notes
          </h2>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {travelContent.detailSections.map((section) => (
            <article
              key={section.title}
              className="rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8] p-6 sm:p-7"
            >
              <h3 className="font-serif text-3xl leading-tight text-[#35452C]">
                {section.title}
              </h3>
              {section.bodyBlocks ? (
                <div className="mt-4 space-y-4 text-base leading-8 text-[#2D2923]/80">
                  {section.bodyBlocks.map((block, index) =>
                    block.type === "paragraph" ? (
                      <p key={`${block.type}-${index}`}>{block.text}</p>
                    ) : (
                      <p key={`${block.type}-${index}`}>
                        <a
                          href={block.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-sm border border-[#35452C]/45 px-5 py-3 font-medium text-[#35452C] underline decoration-[#A8B58A] underline-offset-4 transition-colors hover:border-[#35452C] hover:bg-[#F8F4EA]/70 hover:text-[#1A1712] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35"
                        >
                          {block.label}
                        </a>
                      </p>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-4 text-base leading-8 text-[#2D2923]/80">
                  {section.body}
                </p>
              )}
              {section.notes.length ? (
                <ul className="mt-5 space-y-3 border-t border-[#A8B58A]/35 pt-5">
                  {section.notes.map((note) => (
                    <li
                      key={getNoteKey(note)}
                      className="flex gap-3 text-sm leading-7 text-[#2D2923]/78"
                    >
                      <span
                        className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-[#6F7A4B]"
                        aria-hidden="true"
                      />
                      <span>
                        <TravelNoteText note={note} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <aside className="mt-5 overflow-hidden rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8] p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem] md:items-center">
            <div>
              <h3 className="font-serif text-2xl leading-snug text-[#35452C] sm:text-3xl">
                {travelContent.fieldResearch.mainLine}
              </h3>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#6F7A4B]">
                {travelContent.fieldResearch.caption}
              </p>
            </div>
            <div className="relative min-h-44 overflow-hidden rounded-sm border border-[#A8B58A]/45 bg-[#F8F4EA] sm:min-h-52">
              <Image
                src={travelContent.fieldResearch.image.src}
                alt={travelContent.fieldResearch.image.alt}
                fill
                sizes="(min-width: 768px) 14rem, 100vw"
                className="object-cover saturate-[0.72] contrast-[0.92]"
              />
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-14 rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8] p-7 sm:p-9">
        <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-[#35452C] sm:text-4xl">
              {travelContent.cta.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#2D2923]/80">
              {travelContent.cta.body}
            </p>
          </div>
          <Link
            href={travelContent.cta.href}
            className="inline-flex w-fit items-center rounded-sm border border-[#35452C]/45 px-5 py-3 text-sm font-medium text-[#35452C] transition-colors hover:border-[#35452C] hover:bg-[#F8F4EA]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35"
          >
            {travelContent.cta.label}
          </Link>
        </div>
      </section>
    </InteriorPageShell>
  );
}
