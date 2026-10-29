"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type PartyPerson = {
  id: string;
  number: string;
  name: string;
  image?: string;
  alt?: string;
  alternateImage?: string;
  alternateAlt?: string;
  alternateClickCount?: 2 | 3;
  alternateDurationMs?: number;
  distinction?: string;
  comingSoon?: boolean;
  objectPosition?: string;
};

type PartySide = "groomsmen" | "bridesmaids";

type PointerStart = {
  pointerId: number;
  startX: number;
  startY: number;
  slideIndex: number | null;
  photoPersonId: string | null;
};

const groomsmen: PartyPerson[] = [
  {
    id: "elias-lind",
    number: "01",
    name: "Elias Lind",
    image: "/wedding-party/elias-lind-new.jpg",
    alt: "Elias Lind outdoors in a white polo shirt",
    alternateImage: "/wedding-party/elias-lind-blue-sweater.jpg",
    alternateAlt: "Elias Lind in a blue sweater in the snow",
    objectPosition: "center 10%",
    distinction: "Best Man",
  },
  {
    id: "luke",
    number: "02",
    name: "Luke",
    image: "/wedding-party/groomsman-img-8344.jpeg",
    alt: "Luke in a blue striped shirt against a green background",
    alternateImage: "/wedding-party/luke-alt.jpg",
    alternateAlt: "Luke in a casual close-up selfie",
    distinction: "Best Man",
  },
  {
    id: "ben",
    number: "03",
    name: "Ben",
    image: "/wedding-party/ben.jpg",
    alt: "Ben smiling in a suit",
    distinction: "Best Man",
  },
  {
    id: "linus",
    number: "04",
    name: "Linus",
    image: "/wedding-party/groomsman-linus.jpeg",
    alt: "Linus with his baby on the beach",
  },
  {
    id: "alex",
    number: "05",
    name: "Alex",
    image: "/wedding-party/groomsman-left-portrait.jpeg",
    alt: "Alex in a light suit by the water",
  },
  {
    id: "skylar",
    number: "06",
    name: "Skylar",
    image: "/wedding-party/groomsman-image.jpg",
    alt: "Skylar holding a cocktail at a party",
  },
  {
    id: "drew",
    number: "07",
    name: "Drew",
    image: "/wedding-party/drew.jpg",
    alt: "Drew taking a mirror selfie while holding his baby",
    alternateImage: "/wedding-party/drew-alt.jpg",
    alternateAlt: "Drew smiling in a close-up photo",
    objectPosition: "center 32%",
  },
  {
    id: "grant",
    number: "08",
    name: "Grant",
    image: "/wedding-party/grant.jpg",
    alt: "Grant in a black tuxedo and bow tie",
  },
  {
    id: "fred",
    number: "09",
    name: "Fred",
    image: "/wedding-party/fred.jpg",
    alt: "Fred taking a selfie in a convertible",
  },
  {
    id: "groomsman-10",
    number: "10",
    name: "Chris",
    image: "/wedding-party/groomsman-dscf1613.jpeg",
    alt: "Groomsman in a dark jacket",
  },
];

const bridesmaids: PartyPerson[] = [
  {
    id: "brynn",
    number: "01",
    name: "Brynn",
    image: "/wedding-party/brynn.jpg",
    alt: "Brynn on a wooded road",
    distinction: "Maid of Honor",
  },
  {
    id: "mara",
    number: "02",
    name: "Mara",
    image: "/wedding-party/mara.jpg",
    alt: "Mara at a flower-filled garden reception",
    distinction: "Maid of Honor",
  },
  {
    id: "olivia",
    number: "03",
    name: "Olivia",
    image: "/wedding-party/olivia.jpg",
    alt: "Olivia by the coast at sunset",
  },
  {
    id: "meghan",
    number: "04",
    name: "Meghan",
    image: "/wedding-party/meghan.jpg",
    alt: "Meghan at a coastal overlook",
  },
  {
    id: "sabrina",
    number: "05",
    name: "Sabrina",
    image: "/wedding-party/sabrina.jpg",
    alt: "Sabrina on a cobblestone street",
  },
  {
    id: "ella",
    number: "06",
    name: "Ella",
    image: "/wedding-party/ella.jpg",
    alt: "Ella by the water in a blue patterned top",
  },
  {
    id: "sidney",
    number: "07",
    name: "Sidney",
    image: "/wedding-party/sidney.jpg",
    alt: "Sidney by the water",
    alternateImage: "/wedding-party/sidney-alt.jpg",
    alternateAlt: "Sidney in a playful close-up photo",
    alternateClickCount: 3,
    alternateDurationMs: 1000,
  },
];

function RootSelector({
  name,
  role,
  image,
  alt,
  objectPosition,
  active,
  onClick,
}: {
  name: string;
  role: string;
  image: string;
  alt: string;
  objectPosition: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${active ? "Hide" : "Show"} ${name}'s party`}
      aria-pressed={active}
      onClick={onClick}
      className={`group flex min-w-[9.1rem] items-center gap-3 rounded-2xl border px-3 py-2 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71805B] sm:min-w-[11rem] ${
        active
          ? "border-[#667651] bg-white/90 shadow-[0_8px_24px_rgba(54,68,43,0.13)]"
          : "border-[#B6BEA7]/70 bg-[#F8F6ED]/65 hover:border-[#82906C] hover:bg-white/80"
      }`}
    >
      <span className="relative block h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[#DDE3D2] sm:h-[3.5rem] sm:w-12">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="48px"
          className="object-cover"
          style={{ objectPosition }}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#293622]/20 to-transparent" />
      </span>
      <span className="min-w-0">
        <span className="block font-serif text-[1.05rem] leading-tight text-[#35452C] sm:text-lg">{name}</span>
        <span className="mt-0.5 block text-[0.52rem] uppercase tracking-[0.17em] text-[#788365]">{role}</span>
      </span>
      <span aria-hidden="true" className={`ml-auto text-lg transition-transform duration-300 ${active ? "translate-x-0 text-[#71805B]" : "-translate-x-1 text-[#A0A88F] group-hover:translate-x-0"}`}>
        →
      </span>
    </button>
  );
}

function CarouselCard({
  person,
  side,
  active,
  index,
  width,
  height,
  offset,
  sideOffset,
  direction,
  onSelect,
}: {
  person: PartyPerson;
  side: PartySide;
  active: boolean;
  index: number;
  width: number;
  height: number;
  offset: number;
  sideOffset: number;
  direction: number;
  onSelect: () => void;
}) {
  const role = side === "groomsmen" ? "Groomsman" : "Bridesmaid";
  const description = person.comingSoon
    ? `Groomsman ${person.number}, details coming soon`
    : `${person.name}, ${role}${person.distinction ? `, ${person.distinction}` : ""}`;

  return (
    <motion.button
      type="button"
      data-slide-index={index}
      aria-label={description}
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
      className={`absolute left-0 top-0 flex flex-col overflow-hidden rounded-[1.35rem] border text-left shadow-[0_24px_55px_rgba(39,53,34,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#708057]/50 ${
        active ? "z-20 border-[#71805B]/70 bg-[#FBF8EF]" : "z-10 border-white/55 bg-[#F8F6ED]"
      }`}
      style={{ width, height, transformStyle: "preserve-3d", transformOrigin: "center center" }}
      initial={{ opacity: 0, scale: 0.78, x: (offset + direction) * sideOffset, rotateY: -(offset + direction) * 16 }}
      animate={{
        x: offset * sideOffset,
        opacity: active ? 1 : 0.62,
        scale: active ? 1 : 0.84,
        rotateY: -offset * 16,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.85 }}
    >
      {person.comingSoon ? (
        <span className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden bg-[#E4E9DB] text-[#839071]">
          <span className="absolute -right-12 -top-10 h-44 w-44 rounded-full border border-[#839071]/20" />
          <span className="absolute -bottom-16 -left-8 h-48 w-48 rounded-full border border-[#839071]/20" />
          <svg aria-hidden="true" viewBox="0 0 100 100" className="relative h-16 w-16 opacity-65">
            <circle cx="50" cy="35" r="17" fill="currentColor" />
            <path d="M18 86c3-20 14-31 32-31s29 11 32 31" fill="currentColor" />
          </svg>
          <span className="relative mt-4 text-[0.58rem] uppercase tracking-[0.2em]">Coming soon</span>
        </span>
      ) : (
        <span
          data-photo-easter-egg={person.alternateImage ? person.id : undefined}
          className="relative block aspect-[4/5] w-full overflow-hidden bg-[#D7DDC8]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={person.image}
              className="absolute inset-0 block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={person.image!}
                alt={person.alt ?? ""}
                fill
                sizes="(max-width: 640px) 48vw, 320px"
                draggable={false}
                className="object-cover"
                style={{ objectPosition: person.objectPosition ?? "center" }}
              />
            </motion.span>
          </AnimatePresence>
          <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#192216]/60 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/45 bg-[#273622]/55 px-2.5 py-1 text-[0.52rem] uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {role}
          </span>
          {person.distinction ? (
            <span className="absolute bottom-3 right-3 rounded-full border border-[#E1D3A9]/80 bg-[#F8F4EA]/95 px-2.5 py-1 text-[0.54rem] uppercase tracking-[0.16em] text-[#35452C] shadow-sm">
              {person.distinction}
            </span>
          ) : null}
        </span>
      )}
      <span className="flex min-h-[4.75rem] w-full items-center justify-between gap-2 px-4 py-3">
        <span>
          <span className="block font-serif text-[clamp(1.35rem,2.4vw,1.8rem)] leading-none text-[#35452C]">
            {person.comingSoon ? "Coming soon" : person.name}
          </span>
          <span className="mt-1.5 block text-[0.54rem] uppercase tracking-[0.19em] text-[#7A8467]">
            {person.comingSoon ? "Groomsman" : role}
          </span>
        </span>
      </span>
    </motion.button>
  );
}

export default function WeddingPartyCarousel() {
  const reducedMotion = Boolean(useReducedMotion());
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [activeSide, setActiveSide] = useState<PartySide | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [alternatePortraits, setAlternatePortraits] = useState<Record<string, boolean>>({});
  const pointerStart = useRef<PointerStart | null>(null);
  const lastPhotoTap = useRef<{ personId: string; time: number; count: number } | null>(null);
  const alternatePortraitTimers = useRef<Record<string, number>>({});
  const direction = useRef(1);

  useLayoutEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      Object.values(alternatePortraitTimers.current).forEach(window.clearTimeout);
    };
  }, []);

  const sourcePeople = activeSide === "groomsmen" ? groomsmen : activeSide === "bridesmaids" ? bridesmaids : [];
  const people = sourcePeople.map((person) => {
    if (!alternatePortraits[person.id] || !person.alternateImage) return person;
    return {
      ...person,
      image: person.alternateImage,
      alt: person.alternateAlt ?? person.alt,
    };
  });
  const cardWidth = Math.min(
    330,
    Math.max(158, Math.min((viewport.width || 1200) * 0.29, (viewport.height || 800) * 0.32)),
  );
  const cardHeight = cardWidth * 1.25 + 76;
  const sideOffset = cardWidth * 0.8;

  const openSide = (side: PartySide) => {
    setActiveSide((current) => (current === side ? null : side));
    setActiveIndex(0);
    lastPhotoTap.current = null;
    direction.current = 1;
  };

  const moveBy = (step: number) => {
    if (!people.length) return;
    direction.current = step > 0 ? 1 : -1;
    lastPhotoTap.current = null;
    setActiveIndex((current) => (current + step + people.length) % people.length);
  };

  const selectIndex = (index: number) => {
    if (!people.length) return;
    const forward = (index - activeIndex + people.length) % people.length;
    direction.current = forward <= people.length / 2 ? 1 : -1;
    setActiveIndex(index);
  };

  const revealAlternatePortrait = (person: PartyPerson) => {
    if (!person.alternateImage) return;
    setAlternatePortraits((current) => ({ ...current, [person.id]: true }));
    const previousTimer = alternatePortraitTimers.current[person.id];
    if (previousTimer) window.clearTimeout(previousTimer);
    alternatePortraitTimers.current[person.id] = window.setTimeout(() => {
      setAlternatePortraits((current) => {
        const next = { ...current };
        delete next[person.id];
        return next;
      });
      delete alternatePortraitTimers.current[person.id];
    }, person.alternateDurationMs ?? 1500);
  };

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if ((event.target as HTMLElement).closest("[data-carousel-control]")) return;
    const slideTarget = (event.target as HTMLElement).closest<HTMLElement>("[data-slide-index]");
    const slideIndex = slideTarget ? Number(slideTarget.dataset.slideIndex) : null;
    const photoTarget = (event.target as HTMLElement).closest<HTMLElement>("[data-photo-easter-egg]");
    pointerStart.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      slideIndex: Number.isFinite(slideIndex) ? slideIndex : null,
      photoPersonId: photoTarget?.dataset.photoEasterEgg ?? null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.startX;
    const deltaY = event.clientY - start.startY;
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
      moveBy(deltaX < 0 ? 1 : -1);
      lastPhotoTap.current = null;
    } else if (Math.abs(deltaY) <= 42 && start.slideIndex !== null) {
      const isTap = Math.abs(deltaX) <= 18 && Math.abs(deltaY) <= 18;
      if (isTap && start.photoPersonId) {
        const now = Date.now();
        const previousTap = lastPhotoTap.current;
        const tapCount = previousTap?.personId === start.photoPersonId && now - previousTap.time <= 500
          ? previousTap.count + 1
          : 1;
        const tappedPerson = people.find((person) => person.id === start.photoPersonId);
        const requiredClicks = tappedPerson?.alternateClickCount ?? 2;
        if (tappedPerson?.alternateImage && tapCount >= requiredClicks) {
          revealAlternatePortrait(tappedPerson);
          lastPhotoTap.current = null;
        } else {
          lastPhotoTap.current = { personId: start.photoPersonId, time: now, count: tapCount };
        }
      } else {
        lastPhotoTap.current = null;
      }
      if (start.slideIndex !== activeIndex) selectIndex(start.slideIndex);
    }
    pointerStart.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const sideLabel = activeSide === "groomsmen" ? "Zach’s side" : "Julia’s side";
  const roleLabel = activeSide === "groomsmen" ? "Groomsmen" : "Bridesmaids";
  const showCounter = `${String(activeIndex + 1).padStart(2, "0")} / ${String(people.length).padStart(2, "0")}`;

  return (
    <main
      aria-label="The wedding party"
      className={`fixed inset-0 z-0 flex h-[100dvh] w-screen flex-col overflow-hidden px-4 pb-3 pt-9 text-[#35452C] select-none touch-none sm:px-8 sm:pt-7 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 57%, rgba(255,255,255,.9), transparent 47%), radial-gradient(ellipse at 50% 0%, rgba(205,214,192,.42), transparent 52%), linear-gradient(145deg, #F1F2E9, #E8EBDE 57%, #F3F0E6)",
        overscrollBehavior: "none",
      }}
      onWheel={(event) => event.preventDefault()}
    >
      <header className="shrink-0 text-center">
        <p className="text-[0.56rem] uppercase tracking-[0.34em] text-[#79836A]">Julia &amp; Zach · Our people</p>
        <h1 className="mt-1 font-serif text-[clamp(1.7rem,3.1vw,2.5rem)] leading-tight tracking-[-0.025em] text-[#35452C]">
          The wedding party
        </h1>
      </header>

      <div role="group" aria-label="Choose whose party to explore" className="mt-3 flex shrink-0 justify-center gap-2.5 sm:mt-4 sm:gap-4">
        <RootSelector
          name="Zach"
          role="The groom"
          image="/wedding-party/zach-julia.jpg"
          alt="Zach and Julia together, cropped to Zach"
          objectPosition="90% center"
          active={activeSide === "groomsmen"}
          onClick={() => openSide("groomsmen")}
        />
        <RootSelector
          name="Julia"
          role="The bride"
          image="/wedding-party/zach-julia.jpg"
          alt="Zach and Julia together, cropped to Julia"
          objectPosition="31% center"
          active={activeSide === "bridesmaids"}
          onClick={() => openSide("bridesmaids")}
        />
      </div>

      <section
        aria-label={activeSide ? `${roleLabel} carousel` : "Choose a side of the wedding party"}
        className="relative mt-2 min-h-0 flex-1"
        onPointerDown={activeSide ? startDrag : undefined}
        onPointerMove={(event) => {
          if (pointerStart.current?.pointerId === event.pointerId) setDragging(true);
        }}
        onPointerUp={activeSide ? endDrag : undefined}
        onPointerCancel={activeSide ? endDrag : undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveBy(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveBy(-1);
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {activeSide ? (
            <motion.div
              key={activeSide}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-x-0 top-0 text-center">
                <p className="text-[0.56rem] uppercase tracking-[0.32em] text-[#7A8468]">{roleLabel}</p>
                <h2 className="mt-0.5 font-serif text-[clamp(1.2rem,2.2vw,1.65rem)] leading-tight text-[#35452C]">{sideLabel}</h2>
              </div>

              <div
                className="absolute inset-x-0 bottom-[3.65rem] top-[3.8rem] flex items-center justify-center overflow-hidden [perspective:1100px]"
                style={{ perspective: "1100px" }}
              >
                <div className="relative shrink-0" style={{ width: cardWidth, height: cardHeight, transformStyle: "preserve-3d" }}>
                  {[-1, 0, 1].map((offset) => {
                    const index = (activeIndex + offset + people.length) % people.length;
                    const person = people[index];
                    const isActive = offset === 0;
                    return (
                      <CarouselCard
                        key={person.id}
                        person={person}
                        side={activeSide}
                        active={isActive}
                        index={index}
                        width={cardWidth}
                        height={cardHeight}
                        offset={offset}
                        sideOffset={sideOffset}
                        direction={direction.current}
                        onSelect={() => selectIndex(index)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4">
                <button
                  type="button"
                  data-carousel-control
                  aria-label={`Previous ${roleLabel.toLowerCase()}`}
                  onClick={() => moveBy(-1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#9BA58A]/55 bg-[#F9F7EF]/85 font-serif text-xl text-[#46553A] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71805B]"
                >
                  ←
                </button>
                <div className="min-w-[5rem] text-center">
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#657252]">{showCounter}</p>
                  <p className="mt-1 text-[0.5rem] uppercase tracking-[0.16em] text-[#909982]">Drag or swipe</p>
                </div>
                <button
                  type="button"
                  data-carousel-control
                  aria-label={`Next ${roleLabel.toLowerCase()}`}
                  onClick={() => moveBy(1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#9BA58A]/55 bg-[#F9F7EF]/85 font-serif text-xl text-[#46553A] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71805B]"
                >
                  →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="intro"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center pb-8 text-center"
            >
              <span className="relative grid h-[4.8rem] w-[4.8rem] place-items-center rounded-full border border-[#9BA88A]/50 bg-[#F8F6ED]/80 shadow-[0_10px_30px_rgba(54,68,43,0.08)]">
                <span className="absolute inset-2 rounded-full border border-[#B8C0AB]/55" />
                <span className="font-serif text-[1.8rem] tracking-[-0.08em] text-[#62714F]">J<span className="mx-0.5 text-[#A4AC96]">&amp;</span>Z</span>
              </span>
              <p className="mt-5 font-serif text-[clamp(1.35rem,2.5vw,1.8rem)] leading-tight text-[#35452C]">A few of our favorite people</p>
              <p className="mt-2 max-w-[18rem] text-[0.62rem] uppercase leading-6 tracking-[0.19em] text-[#7C866B]">
                Choose Zach or Julia above to meet their party
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="shrink-0 pt-1 text-center text-[0.5rem] uppercase tracking-[0.2em] text-[#89927A]">
        With love · August 15, 2027
      </footer>
    </main>
  );
}
