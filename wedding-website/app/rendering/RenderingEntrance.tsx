"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "@/app/components/SiteHeader";
import styles from "./rendering.module.css";

// The WebGL bundle and estate asset are requested only after the invitation is accepted.
const EstateExperience = dynamic(() => import("./EstateExperience"), {
  ssr: false,
  loading: () => (
    <div className={styles.loading} role="status">
      <span className={styles.loadingRule} />
      <p>Opening Maryhill</p>
    </div>
  ),
});

export default function RenderingEntrance() {
  const [exploring, setExploring] = useState(false);
  const exploreButton = useRef<HTMLButtonElement>(null);
  const closeExperience = useCallback(() => {
    setExploring(false);
    requestAnimationFrame(() => exploreButton.current?.focus());
  }, []);

  useEffect(() => {
    if (!exploring) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExperience();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [exploring, closeExperience]);

  return (
    <main className={styles.page}>
      {exploring ? (
        <section className={styles.experience} aria-label="Explore Maryhill Estate">
          <EstateExperience onClose={closeExperience} />
        </section>
      ) : (
        <>
          <SiteHeader showOnRendering />
          <button
            ref={exploreButton}
            type="button"
            className={styles.explore}
            onClick={() => setExploring(true)}
            aria-label="Explore Maryhill Estate in 3D"
          >
            explore
          </button>
        </>
      )}
    </main>
  );
}
