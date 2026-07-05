"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GalleryChapter, GalleryChapterId, GalleryImage } from "./galleryTypes";

type GalleryPhase = "select" | "viewer";

type GalleryExperienceProps = {
  chapters: GalleryChapter[];
};

const sharedEase = [0.22, 1, 0.36, 1] as const;
const sharedTransition = { duration: 0.98, ease: sharedEase };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = () => setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function formatCount(currentIndex: number, total: number) {
  const current = String(currentIndex + 1).padStart(2, "0");
  const count = String(total).padStart(2, "0");

  return `${current} / ${count}`;
}

function getCoverImage(chapter: GalleryChapter): GalleryImage | null {
  return chapter.images.find((image) => image.index === 1) ?? chapter.images[0] ?? null;
}

function GalleryHomeLink() {
  return (
    <Link
      href="/"
      className="fixed left-5 top-5 z-[80] rounded-sm border border-[#F8F4EA]/35 bg-[#1A1712]/18 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#F8F4EA] backdrop-blur-sm transition-colors hover:bg-[#1A1712]/32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8F4EA]/55 sm:left-7 sm:top-7"
    >
      Julia &amp; Zach
    </Link>
  );
}

export default function GalleryExperience({ chapters }: GalleryExperienceProps) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [phase, setPhase] = useState<GalleryPhase>("select");
  const [activeChapterId, setActiveChapterId] = useState<GalleryChapterId | null>(null);
  const [focusedChapterId, setFocusedChapterId] = useState<GalleryChapterId | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [photoVisible, setPhotoVisible] = useState(true);

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapterId) ?? null,
    [activeChapterId, chapters],
  );

  const activeImage = activeChapter?.images[activeImageIndex] ?? null;
  const previewChapterId = focusedChapterId ?? activeChapterId;
  const dividerPosition =
    previewChapterId === "proposal" ? "62%" : previewChapterId === "engagement" ? "38%" : "50%";
  const useSharedTransition = isDesktop && !prefersReducedMotion;

  const openChapter = useCallback((chapter: GalleryChapter) => {
    if (chapter.images.length === 0) return;

    setActiveChapterId(chapter.id);
    setFocusedChapterId(chapter.id);
    setActiveImageIndex(0);
    setPhase("viewer");
  }, []);

  const returnToSelect = useCallback(() => {
    setPhase("select");
    setActiveChapterId(null);
    setFocusedChapterId(null);
    setActiveImageIndex(0);
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveImageIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goToNext = useCallback(() => {
    if (!activeChapter) return;
    setActiveImageIndex((current) => Math.min(current + 1, activeChapter.images.length - 1));
  }, [activeChapter]);

  useEffect(() => {
    if (phase !== "viewer") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
      if (event.key === "Escape") returnToSelect();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, phase, returnToSelect]);

  useEffect(() => {
    if (!activeImage || prefersReducedMotion) {
      setPhotoVisible(true);
      return;
    }

    setPhotoVisible(false);
    const frame = window.requestAnimationFrame(() => setPhotoVisible(true));

    return () => window.cancelAnimationFrame(frame);
  }, [activeImage, prefersReducedMotion]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F8F4EA]">
      <GalleryHomeLink />

      <AnimatePresence initial={false}>
        {phase === "select" ? (
          <ChapterSelectScreen
            key="chapter-select"
            chapters={chapters}
            dividerPosition={dividerPosition}
            previewChapterId={previewChapterId}
            useSharedTransition={useSharedTransition}
            onBlur={() => setFocusedChapterId(null)}
            onFocus={setFocusedChapterId}
            onOpen={openChapter}
          />
        ) : activeChapter ? (
          <StoryViewer
            key={`story-${activeChapter.id}`}
            chapter={activeChapter}
            imageIndex={activeImageIndex}
            photoVisible={photoVisible}
            prefersReducedMotion={prefersReducedMotion}
            useSharedTransition={useSharedTransition}
            onBack={returnToSelect}
            onNext={goToNext}
            onPrevious={goToPrevious}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

type ChapterSelectScreenProps = {
  chapters: GalleryChapter[];
  dividerPosition: string;
  previewChapterId: GalleryChapterId | null;
  useSharedTransition: boolean;
  onBlur: () => void;
  onFocus: (chapterId: GalleryChapterId) => void;
  onOpen: (chapter: GalleryChapter) => void;
};

function ChapterSelectScreen({
  chapters,
  dividerPosition,
  previewChapterId,
  useSharedTransition,
  onBlur,
  onFocus,
  onOpen,
}: ChapterSelectScreenProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-[#1A1712]"
      exit={{ opacity: 0 }}
      transition={{ duration: useSharedTransition ? 0.55 : 0, ease: sharedEase }}
    >
      <div className="relative hidden h-screen overflow-hidden md:flex">
        <div
          className="pointer-events-none absolute top-0 z-20 h-full w-px bg-[#A8B58A]/72 transition-[left] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: dividerPosition }}
          aria-hidden="true"
        />

        {chapters.map((chapter) => {
          const isPreviewed = previewChapterId === chapter.id;
          const basis = previewChapterId === chapter.id ? "62%" : previewChapterId ? "38%" : "50%";

          return (
            <ChapterSelectPanel
              key={chapter.id}
              chapter={chapter}
              basis={basis}
              isPreviewed={isPreviewed}
              hasPreview={Boolean(previewChapterId)}
              useSharedTransition={useSharedTransition}
              onFocus={() => onFocus(chapter.id)}
              onBlur={onBlur}
              onMouseEnter={() => onFocus(chapter.id)}
              onMouseLeave={onBlur}
              onOpen={() => onOpen(chapter)}
            />
          );
        })}
      </div>

      <div className="grid min-h-screen gap-px bg-[#A8B58A]/45 md:hidden">
        {chapters.map((chapter) => (
          <MobileChapterCard key={chapter.id} chapter={chapter} onOpen={() => onOpen(chapter)} />
        ))}
      </div>
    </motion.div>
  );
}

type ChapterSelectPanelProps = {
  chapter: GalleryChapter;
  basis: string;
  isPreviewed: boolean;
  hasPreview: boolean;
  useSharedTransition: boolean;
  onBlur: () => void;
  onFocus: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onOpen: () => void;
};

function ChapterSelectPanel({
  chapter,
  basis,
  isPreviewed,
  hasPreview,
  useSharedTransition,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  onOpen,
}: ChapterSelectPanelProps) {
  const image = getCoverImage(chapter);
  const hasImages = chapter.images.length > 0;
  const imageTone = isPreviewed
    ? "scale-[1.055] grayscale-0 brightness-100 saturate-100"
    : hasPreview
      ? "scale-[1.015] grayscale brightness-[0.5] saturate-[0.22]"
      : "scale-[1.025] grayscale brightness-[0.6] saturate-[0.32]";
  const overlayTone = isPreviewed
    ? "from-[#090807]/58 via-[#090807]/16 to-[#090807]/22"
    : "from-[#090807]/78 via-[#090807]/28 to-[#090807]/30";

  return (
    <button
      type="button"
      disabled={!hasImages}
      onClick={onOpen}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative h-screen flex-none cursor-pointer overflow-hidden text-left text-[#F8F4EA] outline-none transition-[flex-basis] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-default"
      style={{ flexBasis: basis }}
    >
      {image ? (
        <motion.div
          layoutId={useSharedTransition ? `gallery-cover-${chapter.id}` : undefined}
          transition={sharedTransition}
          className="absolute inset-0"
        >
          <Image
            src={image.src}
            alt=""
            fill
            sizes="62vw"
            priority
            className={`object-cover transition-[filter,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${imageTone}`}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[#EFE7D8]" aria-hidden="true" />
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-t transition-colors duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          image ? overlayTone : "from-[#EFE7D8] to-[#EFE7D8]"
        }`}
        aria-hidden="true"
      />

      <div className={`relative z-10 flex h-screen items-end px-10 pb-14 ${image ? "" : "text-[#35452C]"}`}>
        <div className="max-w-md">
          <p className={`text-xs uppercase tracking-[0.34em] ${image ? "text-[#F8F4EA]/78" : "text-[#6F7A4B]"}`}>
            {chapter.eyebrow}
          </p>
          <h2 className={`mt-5 font-serif text-6xl leading-none sm:text-7xl ${image ? "text-[#F8F4EA]" : "text-[#35452C]"}`}>
            {chapter.title}
          </h2>
          <p className={`mt-4 text-sm leading-7 ${image ? "text-[#F8F4EA]/82" : "text-[#2D2923]/76"}`}>
            {hasImages ? chapter.supportingLine : chapter.emptyMessage}
          </p>
          <p
            className={`mt-8 text-xs uppercase tracking-[0.24em] text-[#F8F4EA] transition-opacity duration-700 ${
              hasImages && isPreviewed ? "opacity-100" : "opacity-0"
            }`}
          >
            Enter the story
          </p>
        </div>
      </div>
    </button>
  );
}

type MobileChapterCardProps = {
  chapter: GalleryChapter;
  onOpen: () => void;
};

function MobileChapterCard({ chapter, onOpen }: MobileChapterCardProps) {
  const image = getCoverImage(chapter);
  const hasImages = chapter.images.length > 0;

  return (
    <button
      type="button"
      disabled={!hasImages}
      onClick={onOpen}
      className="relative min-h-[50vh] overflow-hidden bg-[#EFE7D8] text-left outline-none disabled:cursor-default"
    >
      {image ? (
        <Image src={image.src} alt="" fill sizes="100vw" priority className="object-cover brightness-[0.68] saturate-[0.72]" />
      ) : null}
      <div
        className={image ? "absolute inset-0 bg-gradient-to-t from-[#090807]/76 via-[#090807]/18 to-[#090807]/18" : "absolute inset-0 bg-[#EFE7D8]"}
        aria-hidden="true"
      />
      <div className={`relative z-10 flex min-h-[50vh] items-end px-6 pb-8 ${image ? "text-[#F8F4EA]" : "text-[#35452C]"}`}>
        <div>
          <p className={`text-xs uppercase tracking-[0.3em] ${image ? "text-[#F8F4EA]/78" : "text-[#6F7A4B]"}`}>
            {chapter.eyebrow}
          </p>
          <h2 className={`mt-4 font-serif text-5xl leading-none ${image ? "text-[#F8F4EA]" : "text-[#35452C]"}`}>
            {chapter.title}
          </h2>
          <p className={`mt-4 text-sm leading-7 ${image ? "text-[#F8F4EA]/82" : "text-[#2D2923]/76"}`}>
            {hasImages ? chapter.supportingLine : chapter.emptyMessage}
          </p>
          {hasImages ? (
            <p className="mt-7 text-xs uppercase tracking-[0.24em] text-[#F8F4EA]">Enter the story</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}

type StoryViewerProps = {
  chapter: GalleryChapter;
  imageIndex: number;
  photoVisible: boolean;
  prefersReducedMotion: boolean;
  useSharedTransition: boolean;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

function StoryViewer({
  chapter,
  imageIndex,
  photoVisible,
  prefersReducedMotion,
  useSharedTransition,
  onBack,
  onNext,
  onPrevious,
}: StoryViewerProps) {
  const image = chapter.images[imageIndex];
  const isFirst = imageIndex === 0;
  const isLast = imageIndex === chapter.images.length - 1;

  if (!image) {
    return (
      <motion.section
        className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-[#F8F4EA] px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-md border-t border-[#A8B58A]/45 pt-8">
          <h1 className="font-serif text-5xl text-[#35452C]">{chapter.title}</h1>
          <p className="mt-5 text-base leading-8 text-[#2D2923]/76">{chapter.emptyMessage}</p>
          <button type="button" onClick={onBack} className="mt-8 text-sm text-[#35452C] underline underline-offset-4">
            Back to gallery
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="absolute inset-0 grid overflow-y-auto bg-[#F8F4EA] lg:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.95fr)]"
      initial={prefersReducedMotion ? false : { opacity: 0.98 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : sharedTransition}
    >
      <motion.div
        layoutId={useSharedTransition && imageIndex === 0 ? `gallery-cover-${chapter.id}` : undefined}
        transition={sharedTransition}
        className="relative min-h-[64vh] overflow-hidden bg-[#1A1712] lg:min-h-screen"
      >
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 64vw, 100vw"
          priority
          className={`object-cover transition-[opacity,transform] duration-700 ease-out ${
            photoVisible ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1712]/16 to-transparent" aria-hidden="true" />
      </motion.div>

      <motion.aside
        className="flex items-center border-t border-[#A8B58A]/45 bg-[#EFE7D8] px-6 py-12 lg:min-h-screen lg:border-l lg:border-t-0 lg:px-10"
        initial={prefersReducedMotion ? false : { opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.72, delay: 0.18, ease: sharedEase }}
      >
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-[#35452C]/82 underline decoration-[#A8B58A] underline-offset-4 transition-colors hover:text-[#35452C]"
          >
            Back to gallery
          </button>

          <p className="mt-12 text-xs uppercase tracking-[0.3em] text-[#6F7A4B]">Julia & Zach</p>
          <h1 className="mt-5 font-serif text-5xl leading-none text-[#35452C] sm:text-6xl">{chapter.title}</h1>
          <p className="mt-7 text-base leading-8 text-[#2D2923]/82">{chapter.body}</p>

          <div className="mt-10 border-t border-[#A8B58A]/45 pt-6">
            <p className="font-serif text-3xl text-[#35452C]">{formatCount(imageIndex, chapter.images.length)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onPrevious}
                disabled={isFirst}
                className="rounded-sm border border-[#A8B58A]/55 px-4 py-3 text-sm text-[#35452C] transition-colors hover:border-[#35452C]/50 hover:bg-[#F8F4EA]/60 disabled:cursor-not-allowed disabled:opacity-35"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={isLast}
                className="rounded-sm border border-[#A8B58A]/55 px-4 py-3 text-sm text-[#35452C] transition-colors hover:border-[#35452C]/50 hover:bg-[#F8F4EA]/60 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </motion.section>
  );
}
