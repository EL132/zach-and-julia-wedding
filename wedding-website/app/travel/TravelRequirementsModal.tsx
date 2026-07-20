"use client";

import { useEffect, useRef } from "react";

type Requirement = {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

type TravelRequirementsModalProps = {
  content: {
    eyebrow: string;
    title: string;
    intro: string;
    passport: Requirement;
    etias: Requirement;
    footnote: string;
  };
};

const dismissalKey = "travel-requirements-dismissed-v1";

export default function TravelRequirementsModal({ content }: TravelRequirementsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let wasDismissed = false;

    try {
      wasDismissed = window.sessionStorage.getItem(dismissalKey) === "true";
    } catch {
      // The reminder can still be shown when browser storage is unavailable.
    }

    if (wasDismissed) return;

    const animationFrame = window.requestAnimationFrame(() => {
      if (!dialog.open) dialog.showModal();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const closeDialog = () => dialogRef.current?.close();

  const dismissForSession = () => {
    try {
      window.sessionStorage.setItem(dismissalKey, "true");
    } catch {
      // Closing still works when browser storage is unavailable.
    }

    closeDialog();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="travel-requirements-title"
      aria-describedby="travel-requirements-description"
      className="m-auto max-h-[calc(100vh-2rem)] w-[min(92vw,38rem)] overflow-y-auto rounded-md border border-[#A8B58A]/60 bg-[#F8F4EA] p-0 text-left text-[#2D2923] shadow-2xl backdrop:bg-[#1A1712]/72 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={closeDialog}
          aria-label="Close travel requirements"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#A8B58A]/50 text-2xl leading-none text-[#35452C] transition-colors hover:border-[#35452C]/50 hover:bg-[#EFE7D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/40"
        >
          <span aria-hidden="true">×</span>
        </button>

        <p className="pr-12 text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">
          {content.eyebrow}
        </p>
        <h2
          id="travel-requirements-title"
          className="mt-4 max-w-lg font-serif text-4xl leading-tight text-[#35452C]"
        >
          {content.title}
        </h2>
        <p
          id="travel-requirements-description"
          className="mt-5 max-w-xl text-base leading-7 text-[#2D2923]/82"
        >
          {content.intro}
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {[content.passport, content.etias].map((requirement) => (
            <section
              key={requirement.title}
              className="rounded-sm border border-[#A8B58A]/45 bg-[#EFE7D8] p-5"
            >
              <h3 className="font-serif text-2xl leading-tight text-[#35452C]">
                {requirement.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#2D2923]/80">
                {requirement.body}
              </p>
              <a
                href={requirement.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-[#35452C] underline decoration-[#A8B58A] underline-offset-4 transition-colors hover:text-[#1A1712] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35"
              >
                {requirement.linkLabel}
              </a>
            </section>
          ))}
        </div>

        <p className="mt-5 text-sm leading-6 text-[#2D2923]/68">{content.footnote}</p>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#A8B58A]/35 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismissForSession}
            className="rounded-sm border border-[#A8B58A]/60 px-5 py-3 text-sm font-medium text-[#35452C] transition-colors hover:border-[#35452C]/50 hover:bg-[#EFE7D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35"
          >
            Don’t show this again
          </button>
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-sm border border-[#35452C] bg-[#35452C] px-5 py-3 text-sm font-medium !text-white transition-colors hover:bg-[#1A1712] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/45"
          >
            Continue to travel details
          </button>
        </div>
      </div>
    </dialog>
  );
}
