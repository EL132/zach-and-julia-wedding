import Image from "next/image";
import Link from "next/link";
import { FishMark } from "@/app/components/FishMark";
import RevealImage from "@/app/components/RevealImage";
import { homePageContent } from "@/app/content/site";

const editorialImages = {
  hero: "/home-page/cover-photo.jpg",
  wide: "/home-page/home-page-3.jpg",
  tall: "/home-page/home-page-2.jpg",
  calm: "/home-page/home-page-1.jpg",
};


export default function Home() {
  return (
    <>
      <section className="relative h-screen overflow-hidden">
        <Image
          src={editorialImages.hero}
          alt="Julia & Zach walking together outdoors"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-center text-[#F1EFE8] sm:px-8">
          <p className="text-xs uppercase tracking-[0.38em] text-[#E4E1D8]/80">
            {homePageContent.hero.eyebrow}
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-serif leading-[0.92] sm:text-7xl">
            {homePageContent.hero.title}
          </h1>
          <p className="mt-5 text-sm tracking-[0.18em] text-[#E4E1D8]/80 sm:text-base">
            {homePageContent.hero.subtitle}
          </p>
          <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-base leading-7 text-[#F1EFE8]/86 sm:text-lg">
            {homePageContent.hero.supportingCopy}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
          <RevealImage
            src={editorialImages.wide}
            alt="Julia & Zach standing together on stone steps"
            width={1535}
            height={2302}
            reveal="left"
          />

          <div className="grid gap-8">
            <RevealImage
              src={editorialImages.tall}
              alt="Portrait-style estate detail in black and white"
              width={900}
              height={1280}
              reveal="right"
            />
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.38em] text-[#6E6A61]">
                {homePageContent.story.eyebrow}
              </p>
              <h2 className="mt-5 text-3xl font-serif leading-tight text-[#0E0D0B] sm:text-4xl">
                {homePageContent.story.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#2D2923]/85">
                {homePageContent.story.body}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 overflow-hidden">
          <RevealImage
            src={editorialImages.calm}
            alt="Estate staircase and garden path in soft monochrome"
            width={1600}
            height={900}
            reveal="down"
          />
        </section>
      </main>

      <footer className="bg-[#0a0a08] px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <FishMark className="mx-auto mb-8 h-10 w-10 opacity-80" />
          <p className="text-xs uppercase tracking-[0.4em] text-[#E6E2D6]/70">
            {homePageContent.cta.eyebrow}
          </p>
          <h2 className="mt-5 text-4xl font-serif leading-tight text-[#F5F2EB] sm:text-5xl">
            {homePageContent.cta.title}
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/travel"
              className="inline-flex rounded-full border border-[#F5F2EB]/25 bg-[#F5F2EB]/5 px-8 py-3 text-sm uppercase tracking-[0.35em] text-[#F5F2EB] transition hover:bg-[#F5F2EB]/10"
            >
              Travel
            </Link>
            <Link
              href="/our-people/our-story"
              className="inline-flex rounded-full border border-[#F5F2EB]/25 bg-[#F5F2EB]/5 px-8 py-3 text-sm uppercase tracking-[0.35em] text-[#F5F2EB] transition hover:bg-[#F5F2EB]/10"
            >
              Our Story
            </Link>
            <Link
              href="/faqs"
              className="inline-flex rounded-full border border-[#F5F2EB]/25 bg-[#F5F2EB]/5 px-8 py-3 text-sm uppercase tracking-[0.35em] text-[#F5F2EB] transition hover:bg-[#F5F2EB]/10"
            >
              FAQs
            </Link>
          </div>
          <FishMark className="mx-auto mt-10 h-10 w-10 opacity-80" />
        </div>
      </footer>
    </>
  );
}
