"use client";

import { Canvas, useThree } from "@react-three/fiber";
import Image from "next/image";
import Link from "next/link";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { DISCOVERIES, EstateScene, prepareEstate, type CameraActions, type DiscoveryId } from "./EstateScene";
import styles from "./rendering.module.css";

const MODEL_URL = "/rendering/maryhill-estate.glb";
const POSTER_URL = "/rendering/maryhill-estate-poster.webp";
type SessionProps = { onClose: () => void; onRetry: () => void };

function checkWebGLSupport() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("webgl2", { alpha: false, antialias: true });
  if (!context) throw new Error("This browser cannot open the interactive estate");
  // R3F's async renderer setup does not route creation failures to its boundary.
  // Release the probe before the real canvas allocates its graphics resources.
  context.getExtension("WEBGL_lose_context")?.loseContext();
}

function disposeEstate(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    objectMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value); });
    });
  });
  textures.forEach((texture) => {
    texture.dispose();
    if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close();
  });
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    console.error("Unable to render Maryhill estate", error);
    this.props.onError();
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ContextLossGuard({ onLoss }: { onLoss: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      if (canvas.isConnected) onLoss();
    };
    canvas.addEventListener("webglcontextlost", handleLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleLoss);
  }, [gl, onLoss]);
  return null;
}

function PosterFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.fallback} role="status">
      <div className={styles.poster}>
        <Image src={POSTER_URL} alt="A miniature of Maryhill Estate, its gardens, buildings and pools" fill sizes="(max-width: 640px) 95vw, 700px" unoptimized />
      </div>
      <h2>A little look at Maryhill</h2>
      <p>The interactive estate couldn’t open. Try again, or view this still while you’re here.</p>
      <button className={styles.textLink} type="button" onClick={onRetry}>Try the 3D view again</button>
    </div>
  );
}

function Session({ onClose, onRetry }: SessionProps) {
  const [model, setModel] = useState<GLTF | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<DiscoveryId | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [motionPreference, setMotionPreference] = useState<boolean | null>(null);
  const motionEnabled = motionPreference ?? !reducedMotion;
  const [maxPixelRatio] = useState(() => window.matchMedia("(pointer: coarse)").matches ? 1.25 : 1.75);
  const actionsRef = useRef<CameraActions | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const discoveries = useRef<HTMLDetailsElement>(null);
  const handleDiscover = useCallback((id: DiscoveryId | null) => {
    setSelected(id);
    viewport.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let loaded: GLTF | undefined;
    let active = true;
    viewport.current?.focus();

    async function load() {
      try {
        checkWebGLSupport();
        const response = await fetch(MODEL_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("The estate model was unavailable");
        const total = Number(response.headers.get("content-length"));
        let buffer: ArrayBuffer;
        if (response.body && total > 0) {
          const reader = response.body.getReader();
          const parts: Uint8Array[] = [];
          let bytes = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            parts.push(value);
            bytes += value.byteLength;
            if (active) setProgress(Math.min(95, Math.round(bytes / total * 95)));
          }
          const merged = new Uint8Array(bytes);
          let offset = 0;
          parts.forEach((part) => { merged.set(part, offset); offset += part.byteLength; });
          buffer = merged.buffer;
        } else {
          buffer = await response.arrayBuffer();
        }
        if (!active) return;
        loaded = await new GLTFLoader().parseAsync(buffer, "/rendering/");
        if (!active) { disposeEstate(loaded.scene); loaded = undefined; return; }
        prepareEstate(loaded.scene);
        setModel(loaded);
      } catch (error) {
        if (active && !controller.signal.aborted) {
          console.error("Unable to load Maryhill estate", error);
          setError(true);
        }
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      if (loaded) disposeEstate(loaded.scene);
    };
  }, []);

  const fallback = <PosterFallback onRetry={onRetry} />;

  return (
    <>
      <div
        ref={viewport}
        className={styles.viewport}
        tabIndex={0}
        role="region"
        aria-label="Interactive Maryhill Estate. Drag to rotate, scroll or pinch to zoom. Select a discovery point to look closer. Arrow keys rotate, plus and minus zoom, R resets, Escape closes."
        onPointerDownCapture={() => viewport.current?.focus({ preventScroll: true })}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const commands: Record<string, () => void> = {
            ArrowLeft: () => actionsRef.current?.orbit(0.12, 0),
            ArrowRight: () => actionsRef.current?.orbit(-0.12, 0),
            ArrowUp: () => actionsRef.current?.orbit(0, -0.08),
            ArrowDown: () => actionsRef.current?.orbit(0, 0.08),
            "+": () => actionsRef.current?.zoom(0.85),
            "=": () => actionsRef.current?.zoom(0.85),
            "-": () => actionsRef.current?.zoom(1.15),
            r: () => actionsRef.current?.reset(),
            R: () => actionsRef.current?.reset(),
          };
          if (commands[event.key]) { event.preventDefault(); commands[event.key](); }
        }}
      >
        {error ? fallback : (
          <SceneBoundary fallback={fallback} onError={() => setError(true)}>
            {model ? (
              <div className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`}>
                <Canvas
                  shadows="percentage"
                  dpr={[1, maxPixelRatio]}
                  frameloop="demand"
                  camera={{ position: [65, 53, 78], near: 0.1, far: 800, fov: 35 }}
                  gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.8 }}
                  fallback={null}
                >
                  <ContextLossGuard onLoss={() => setError(true)} />
                  <EstateScene model={model} actionsRef={actionsRef} onReady={() => setReady(true)}
                    onDiscover={handleDiscover} selected={selected} motionEnabled={motionEnabled} reducedMotion={reducedMotion} />
                </Canvas>
              </div>
            ) : null}
            {!ready ? (
              <div className={styles.loading} role="status">
                <span className={styles.loadingRule} />
                <p>{progress > 0 ? `Opening Maryhill · ${progress}%` : "Opening Maryhill"}</p>
              </div>
            ) : null}
          </SceneBoundary>
        )}
      </div>

      <div className={styles.topBar}>
        <button type="button" className={styles.back} onClick={onClose} aria-label="Close the estate and return to explore">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h13" /></svg>
          <span>back</span>
        </button>
        <div className={styles.wordmark}>
          <h1>Maryhill Estate</h1>
          {ready && !error ? (
            <button type="button" className={styles.motionToggle}
              onClick={() => {
                if (motionEnabled) actionsRef.current?.interrupt();
                setMotionPreference(!motionEnabled);
              }}>
              {motionEnabled ? "pause motion" : "play motion"}
            </button>
          ) : null}
        </div>
      </div>

      {ready && !error ? (
        <details ref={discoveries} className={styles.discoverMenu}>
          <summary>discover <span aria-hidden="true">+</span></summary>
          <nav aria-label="Places to discover at Maryhill">
            {DISCOVERIES.map((spot) => (
              <button key={spot.id} type="button" aria-pressed={selected === spot.id}
                onClick={() => {
                  actionsRef.current?.discover(spot.id);
                  if (discoveries.current) discoveries.current.open = false;
                  viewport.current?.focus({ preventScroll: true });
                }}>{spot.label}</button>
            ))}
          </nav>
        </details>
      ) : null}

      <div className={styles.bottomBar}>
        <div className={styles.caption}>
          {selected ? (
            <div className={styles.discoveryCaption}>
              <p aria-live="polite">{DISCOVERIES.find((spot) => spot.id === selected)?.label}</p>
              <button type="button" className={styles.viewEstate} onClick={() => actionsRef.current?.reset()}>view estate</button>
            </div>
          ) : null}
          <p className={styles.mouseHint}>Drag to wander · Scroll to look closer</p>
          <p className={styles.touchHint}>Drag to wander · Pinch to look closer</p>
          {!selected && ready && !error ? (
            <>
              <p className={styles.discoveryHintDesktop}>Choose a dot to discover</p>
              <p className={styles.discoveryHintMobile}>Open discover for a closer look</p>
            </>
          ) : null}
          <Link href="/" className={styles.textLink}>Julia &amp; Zach’s wedding</Link>
        </div>
        <div className={styles.controls} role="group" aria-label="Estate view controls">
          <button className={styles.control} type="button" aria-label="Zoom out" title="Zoom out (−)" disabled={!ready || error} onClick={() => actionsRef.current?.zoom(1.2)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="M5 12h14" /></svg></button>
          <button className={styles.control} type="button" aria-label="Zoom in" title="Zoom in (+)" disabled={!ready || error} onClick={() => actionsRef.current?.zoom(0.8)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg></button>
          <span className={styles.controlDivider} aria-hidden="true" />
          <button className={styles.control} type="button" aria-label="Reset view" title="Reset view (R)" disabled={!ready || error} onClick={() => actionsRef.current?.reset()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.4 7M4 4v6h6" /></svg></button>
        </div>
      </div>
    </>
  );
}

export default function EstateExperience({ onClose }: { onClose: () => void }) {
  const [attempt, setAttempt] = useState(0);
  return <Session key={attempt} onClose={onClose} onRetry={() => setAttempt((value) => value + 1)} />;
}
