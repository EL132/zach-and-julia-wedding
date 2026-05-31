import Image from "next/image";
import Link from "next/link";
import RevealImage from "@/app/components/RevealImage";

const editorialImages = {
  hero: "/home-page/cover-photo.jpg",
  wide: "/home-page/home-page-3.jpg",
  tall: "/home-page/home-page-2.jpg",
  offset: "/home-page/home-page-1.jpg",
  calm: "/home-page/home-page-4.jpg",
  estate: "/home-page/mary-hill-estate-drawing.png",
};

export default function Home() {
  return (
    <>
      <section className="relative h-screen overflow-hidden">
        <Image
          src={editorialImages.hero}
          alt="Zach and Julia walking along the estate gardens"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-center text-[#F1EFE8] sm:px-8">
          <p className="text-xs uppercase tracking-[0.38em] text-[#E4E1D8]/80">
            A weekend in the gardens
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-serif uppercase leading-[0.92] sm:text-7xl">
            Zach & Julia
          </h1>
          <p className="mt-5 text-xs uppercase tracking-[0.45em] text-[#E4E1D8]/70 sm:text-sm">
            August 2027 / Helsingborg, Sweden
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
          <RevealImage
            src={editorialImages.wide}
            alt="Wide editorial view of the estate grounds"
            width={1600}
            height={1120}
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
                The story begins
              </p>
              <h2 className="mt-5 text-3xl font-serif leading-tight text-[#0E0D0B] sm:text-4xl">
                Quiet moments, stone terraces, and a soft hush before the celebration.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#2D2923]/85">
                Our weekend is gathered around the house and glasshouse, where every path feels intentional and every light is held for the two of us.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.6fr_0.4fr] lg:items-end">
          <RevealImage
            src={editorialImages.offset}
            alt="Editorial photograph of the couple in a garden setting"
            width={1400}
            height={950}
            reveal="up"
          />

          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.38em] text-[#6E6A61]">
              A refined story
            </p>
            <p className="mt-5 text-xl font-serif leading-10 text-[#2D2923]">
              Each photograph is a chapter in a quiet day: the light between leaves, the stillness of stone, the cadence of footsteps toward the house.
            </p>
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

      <section className="bg-[#F8F4EA] py-16">
        <div className="mx-auto bg-white" style={{ width: "min(87.5%, 117.44vh)" }}>
          <RevealImage
            src={editorialImages.estate}
            alt="Maryhill Estate drawing with warm paper tones"
            width={2568}
            height={1640}
            className="w-full"
            reveal="center"
          />
        </div>
      </section>

      <section className="bg-[#0a0a08] px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#E6E2D6]/70">
            The weekend awaits
          </p>
          <h2 className="mt-5 text-4xl font-serif leading-tight text-[#F5F2EB] sm:text-5xl">
            Join us at Maryhill Estate
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/rsvp"
              className="inline-flex rounded-full border border-[#F5F2EB]/25 bg-[#F5F2EB]/5 px-8 py-3 text-sm uppercase tracking-[0.35em] text-[#F5F2EB] transition hover:bg-[#F5F2EB]/10"
            >
              RSVP
            </Link>
            <Link
              href="/events"
              className="inline-flex rounded-full border border-[#F5F2EB]/25 bg-[#F5F2EB]/5 px-8 py-3 text-sm uppercase tracking-[0.35em] text-[#F5F2EB] transition hover:bg-[#F5F2EB]/10"
            >
              Weekend details
            </Link>
            <Link
              href="/travel"
              className="inline-flex rounded-full border border-[#F5F2EB]/25 bg-[#F5F2EB]/5 px-8 py-3 text-sm uppercase tracking-[0.35em] text-[#F5F2EB] transition hover:bg-[#F5F2EB]/10"
            >
              Travel
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
