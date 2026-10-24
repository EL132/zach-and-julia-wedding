"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const CANVAS_WIDTH = 2800;
const CANVAS_HEIGHT = 2400;
const ROOT_X = CANVAS_WIDTH / 2;
const ROOT_Y = CANVAS_HEIGHT / 2;

type Groomsman = {
  id: string;
  number: string;
  name: string;
  image: string;
  alt: string;
  note: string;
  x: number;
  y: number;
  distinction?: string;
};

const groomsmen: Groomsman[] = [
  {
    id: "groomsman-01",
    number: "01",
    name: "Name to come",
    image: "/wedding-party/groomsman-dscf1613.jpeg",
    alt: "Groomsman in a dark jacket",
    note: "A little introduction is coming soon.",
    x: 240,
    y: 330,
  },
  {
    id: "luke",
    number: "02",
    name: "Luke",
    image: "/wedding-party/groomsman-img-8344.jpeg",
    alt: "Luke in a blue striped shirt against a green background",
    note: "A little introduction is coming soon.",
    distinction: "Best Man",
    x: 820,
    y: 170,
  },
  {
    id: "linus",
    number: "03",
    name: "Linus",
    image: "/wedding-party/groomsman-linus.jpeg",
    alt: "Linus with his baby on the beach",
    note: "More about Linus coming soon.",
    x: 180,
    y: 900,
  },
  {
    id: "groomsman-04",
    number: "04",
    name: "Name to come",
    image: "/wedding-party/groomsman-left-portrait.jpeg",
    alt: "Groomsman in a light suit by the water",
    note: "A little introduction is coming soon.",
    x: 820,
    y: 970,
  },
  {
    id: "groomsman-05",
    number: "05",
    name: "Name to come",
    image: "/wedding-party/groomsman-image.jpg",
    alt: "Groomsman holding a cocktail at a party",
    note: "A little introduction is coming soon.",
    x: 220,
    y: 1840,
  },
  {
    id: "elias-lind",
    number: "06",
    name: "Elias Lind",
    image: "/wedding-party/elias-lind.jpg",
    alt: "Elias Lind smiling in round glasses",
    note: "Zach’s brother.",
    distinction: "Best Man",
    x: 990,
    y: 1940,
  },
  {
    id: "ben",
    number: "07",
    name: "Ben",
    image: "/wedding-party/ben.jpg",
    alt: "Ben smiling in a suit",
    note: "A little introduction is coming soon.",
    x: 260,
    y: 1320,
  },
];

const juliaPlaceholders = [
  { id: "julia-party", x: 1610, y: 1050 },
];

const upcomingGroomsmen = [
  { id: "groomsman-08", number: "08", x: 610, y: 700 },
  { id: "groomsman-09", number: "09", x: 920, y: 1760 },
  { id: "groomsman-10", number: "10", x: 160, y: 540 },
];

function graphPath(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  return `M ${fromX} ${fromY} C ${fromX + dx * 0.38} ${fromY + dy * 0.08}, ${fromX + dx * 0.62} ${toY - dy * 0.08}, ${toX} ${toY}`;
}

function clampPan(x: number, y: number, width: number, height: number) {
  return {
    x: Math.min(0, Math.max(width - CANVAS_WIDTH, x)),
    y: Math.min(0, Math.max(height - CANVAS_HEIGHT, y)),
  };
}

function GroomsmanCard({ person, width }: { person: Groomsman; width: number }) {
  return (
    <article
      aria-label={`${person.name}, groomsman${person.distinction ? `, ${person.distinction}` : ""}`}
      className="absolute overflow-hidden rounded-[1.15rem] border border-[#76855D]/50 bg-[#F8F4EA]/95 shadow-[0_16px_42px_rgba(43,57,36,0.16)] backdrop-blur-sm"
      style={{ left: person.x, top: person.y, width }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#D7DDC8]">
        <Image
          src={person.image}
          alt={person.alt}
          fill
          sizes="230px"
          draggable={false}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#182014]/55 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-[#23311F]/60 px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.19em] text-white backdrop-blur-md">
          Groomsman · {person.number}
        </span>
        {person.distinction ? (
          <span className="absolute bottom-3 right-3 rounded-full border border-[#E3D09B]/80 bg-[#F8F4EA]/95 px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-[#35452C]">
            {person.distinction}
          </span>
        ) : null}
      </div>
      <div className="px-4 pb-4 pt-3">
        <h2 className="font-serif text-[1.45rem] leading-tight text-[#35452C]">{person.name}</h2>
        <p className="mt-1.5 text-[0.68rem] leading-5 text-[#514E43]/80">{person.note}</p>
      </div>
    </article>
  );
}

function RootPortrait({
  name,
  role,
  image,
  alt,
  left,
  top,
  width,
  onClick,
  expanded = false,
}: {
  name: string;
  role: string;
  image: string;
  alt: string;
  left: number;
  top: number;
  width: number;
  onClick?: () => void;
  expanded?: boolean;
}) {
  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#D9E1CD]">
        <Image src={image} alt={alt} fill sizes="230px" draggable={false} className="object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#20301C]/50 via-transparent to-[#F6F3E7]/10" />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/60 bg-[#F8F4EA]/90 px-3 py-1.5 text-[0.52rem] uppercase tracking-[0.2em] text-[#526043] shadow-sm">
          Portrait to come
        </span>
      </div>
      <div className="px-3 pb-4 pt-3 text-center">
        <span className="block font-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-none text-[#35452C]">{name}</span>
        <p className="mt-2 text-[0.58rem] uppercase tracking-[0.25em] text-[#6F7A4B]">{role}</p>
        {onClick ? (
          <p className="mt-2 text-[0.52rem] uppercase tracking-[0.16em] text-[#6F7A4B]">
            {expanded ? "Click to hide his party" : "Click to reveal his party"}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = `absolute z-10 overflow-hidden rounded-[1.4rem] border border-[#63764D]/75 bg-[#F8F4EA] text-left shadow-[0_24px_65px_rgba(35,50,30,0.2)] ${onClick ? "cursor-pointer transition-shadow hover:shadow-[0_28px_72px_rgba(35,50,30,0.27)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6F7A4B]/50" : ""}`;

  if (onClick) {
    return (
      <button
        type="button"
        data-canvas-control
        aria-label={`${name}, ${role}. ${expanded ? "Hide" : "Show"} his wedding party network.`}
        aria-expanded={expanded}
        onClick={onClick}
        className={className}
        style={{ left, top, width }}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={className} style={{ left, top, width }}>
      {content}
    </article>
  );
}

function ComingSoonCard({
  left,
  top,
  width,
  label,
}: {
  left: number;
  top: number;
  width: number;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={`${label}, details coming soon`}
      className="absolute overflow-hidden rounded-[1.15rem] border border-dashed border-[#71835A]/60 bg-[#F8F4EA]/85 text-center shadow-[0_12px_32px_rgba(43,57,36,0.1)] backdrop-blur-sm"
      style={{ left, top, width }}
    >
      <div className="flex aspect-[4/5] items-center justify-center bg-[#E5E9D9]">
        <svg aria-hidden="true" viewBox="0 0 100 100" className="h-[42%] w-[42%] text-[#82916A]">
          <circle cx="50" cy="35" r="17" fill="currentColor" fillOpacity=".6" />
          <path d="M18 86c3-20 14-31 32-31s29 11 32 31" fill="currentColor" fillOpacity=".6" />
        </svg>
      </div>
      <div className="px-3 pb-4 pt-3">
        <p className="font-serif text-[1.25rem] leading-tight text-[#35452C]">{label}</p>
        <p className="mt-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-[#6F7A4B]">Details coming soon</p>
      </div>
    </div>
  );
}

export default function WeddingPartyGraph() {
  const stageRef = useRef<HTMLElement>(null);
  const pointerRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [zachNetworkOpen, setZachNetworkOpen] = useState(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      setViewport({ width, height });
      setPan((current) =>
        current.x === 0 && current.y === 0
          ? { x: width / 2 - ROOT_X, y: height / 2 - ROOT_Y }
          : clampPan(current.x, current.y, width, height),
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const cardWidth = Math.min(232, Math.max(148, (viewport.width || 1000) * 0.16));
  const rootGap = Math.max(14, cardWidth * 0.08);
  const rootHeight = cardWidth * 1.25 + 72;
  const rootTop = ROOT_Y - rootHeight / 2;
  const zachLeft = ROOT_X - rootGap / 2 - cardWidth;
  const juliaLeft = ROOT_X + rootGap / 2;
  const rootMidY = rootTop + rootHeight / 2;

  const recenter = () => {
    setPan(clampPan(viewport.width / 2 - ROOT_X, viewport.height / 2 - ROOT_Y, viewport.width, viewport.height));
  };

  const beginPan = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if ((event.target as HTMLElement).closest("[data-canvas-control]")) return;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  };

  const movePan = (event: ReactPointerEvent<HTMLElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const nextX = pointer.panX + event.clientX - pointer.startX;
    const nextY = pointer.panY + event.clientY - pointer.startY;
    setPan(clampPan(nextX, nextY, viewport.width, viewport.height));
  };

  const endPan = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerRef.current?.id !== event.pointerId) return;
    pointerRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <main
      ref={stageRef}
      aria-label="Explore the wedding party graph"
      className={`fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-[#EEF0E5] text-[#35452C] select-none touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 49%, rgba(255,255,255,.76), transparent 57%), linear-gradient(135deg, #F3F4EC, #E5EBDD)",
        backgroundSize: "auto, auto",
        overscrollBehavior: "none",
      }}
      onPointerDown={beginPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onWheel={(event) => event.preventDefault()}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.18),transparent_35%,rgba(99,121,75,.035)_80%)]" />

      <header className="pointer-events-none absolute left-1/2 top-4 z-20 w-[min(18rem,70vw)] -translate-x-1/2 text-center sm:top-6">
        <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#6F7A4B]">Julia &amp; Zach · Our people</p>
        <h1 className="mt-1 font-serif text-[clamp(1.25rem,2.3vw,1.9rem)] leading-tight text-[#35452C]">The wedding party</h1>
      </header>

      <button
        type="button"
        data-canvas-control
        onClick={recenter}
        className="absolute right-4 top-4 z-20 rounded-full border border-[#73845A]/50 bg-[#F8F4EA]/85 px-4 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-[#35452C] shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B] sm:right-6 sm:top-6"
      >
        Recenter
      </button>

      <div
        role="group"
        aria-label="Wedding party portraits and connections"
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
        }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        >
          <motion.path
            d={graphPath(zachLeft + cardWidth, rootMidY, juliaLeft, rootMidY)}
            fill="none"
            stroke="#6F7A4B"
            strokeOpacity=".55"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
          />
          {zachNetworkOpen ? groomsmen.map((person, index) => {
            const startY = rootTop + rootHeight * (0.19 + index * (0.62 / Math.max(1, groomsmen.length - 1)));
            const endX = person.x + cardWidth;
            const endY = person.y + cardWidth * 0.68;
            return (
              <motion.path
                key={person.id}
                d={graphPath(zachLeft, startY, endX, endY)}
                fill="none"
                stroke="#75875B"
                strokeOpacity=".66"
                strokeWidth="2.6"
                strokeLinecap="round"
                initial={reducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.15 + index * 0.06 }}
              />
            );
          }) : null}
          {zachNetworkOpen ? upcomingGroomsmen.map((person, index) => (
            <motion.path
              key={person.id}
              d={graphPath(zachLeft, rootTop + rootHeight * (0.24 + index * 0.24), person.x + cardWidth, person.y + cardWidth * 0.6)}
              fill="none"
              stroke="#75875B"
              strokeOpacity=".66"
              strokeWidth="2.6"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.5 + index * 0.06 }}
            />
          )) : null}
          {juliaPlaceholders.map((node, index) => (
            <motion.path
              key={node.id}
              d={graphPath(juliaLeft + cardWidth, rootTop + rootHeight * (0.3 + index * 0.35), node.x, node.y + cardWidth * 0.55)}
              fill="none"
              stroke="#75875B"
              strokeOpacity=".66"
              strokeWidth="2.6"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.55 + index * 0.08 }}
            />
          ))}
          {zachNetworkOpen ? groomsmen.map((person) => (
            <circle key={`${person.id}-dot`} cx={person.x + cardWidth} cy={person.y + cardWidth * 0.68} r="4" fill="#6F7A4B" />
          )) : null}
          {zachNetworkOpen ? upcomingGroomsmen.map((person) => (
            <circle key={`${person.id}-dot`} cx={person.x + cardWidth} cy={person.y + cardWidth * 0.6} r="4" fill="#6F7A4B" />
          )) : null}
          {juliaPlaceholders.map((node) => (
            <circle key={`${node.id}-dot`} cx={node.x} cy={node.y + cardWidth * 0.55} r="4" fill="#6F7A4B" />
          ))}
        </svg>

        <RootPortrait
          name="Zach"
          role="The groom"
          image="/wedding-party/zach-placeholder.svg"
          alt="Illustrated placeholder portrait for Zach"
          left={zachLeft}
          top={rootTop}
          width={cardWidth}
          onClick={() => setZachNetworkOpen((open) => !open)}
          expanded={zachNetworkOpen}
        />
        <RootPortrait
          name="Julia"
          role="The bride"
          image="/wedding-party/julia-placeholder.svg"
          alt="Illustrated placeholder portrait for Julia"
          left={juliaLeft}
          top={rootTop}
          width={cardWidth}
        />

        {zachNetworkOpen ? (
          <>
            {groomsmen.map((person, index) => (
              <motion.div
                key={person.id}
                initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.24, delay: reducedMotion ? 0 : index * 0.045, ease: "easeOut" }}
              >
                <GroomsmanCard person={person} width={cardWidth} />
              </motion.div>
            ))}
            {upcomingGroomsmen.map((person, index) => (
              <motion.div
                key={person.id}
                initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.24, delay: reducedMotion ? 0 : (groomsmen.length + index) * 0.045, ease: "easeOut" }}
              >
                <ComingSoonCard left={person.x} top={person.y} width={cardWidth} label={`Groomsman · ${person.number}`} />
              </motion.div>
            ))}
          </>
        ) : null}
        {juliaPlaceholders.map((node) => (
          <ComingSoonCard key={node.id} left={node.x} top={node.y} width={cardWidth} label="Julia’s party" />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#73845A]/35 bg-[#F8F4EA]/82 px-4 py-2 text-[0.58rem] uppercase tracking-[0.19em] text-[#60734D] shadow-sm backdrop-blur sm:bottom-7 sm:px-5 sm:text-[0.65rem]">
        Drag anywhere to explore · Recenter to start again
      </div>
    </main>
  );
}
