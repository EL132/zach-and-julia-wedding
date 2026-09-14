"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei/web/Html";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { useEffect, useMemo, useRef, type ComponentRef, type RefObject } from "react";
import * as THREE from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import EstateBird from "./EstateBird";
import { EstateFire } from "./EstateFire";
import styles from "./rendering.module.css";

type Point = [number, number, number];
export type DiscoveryId = "terrace" | "glasshouse" | "tennis" | "couple" | "sauna";
type Discovery = { id: DiscoveryId; label: string; marker: Point; target: Point; offset: Point };

// Blender's Z-up scene becomes glTF Y-up: [x, z, -y].
export const DISCOVERIES: Discovery[] = [
  { id: "terrace", label: "The terrace", marker: [16, 1.1, 8], target: [16, 1.4, 6.8], offset: [10, 11, 17] },
  { id: "glasshouse", label: "The glasshouse", marker: [-12.1, 4.05, -1.2], target: [-12.1, 1, -1.2], offset: [6.5, 6.5, 10] },
  { id: "tennis", label: "A little tennis", marker: [-3.5, 1.2, -10], target: [-3.5, 0.5, -10], offset: [4.5, 6.5, -8] },
  { id: "couple", label: "Julia & Zach", marker: [16, 9.5, 1.5], target: [16, 7.7, 1.5], offset: [1.4, 0.65, 3.2] },
  { id: "sauna", label: "The sauna", marker: [-18.4, 1.8, 6.75], target: [-18.38, 0.79, 6.75], offset: [4.35, 1.1, 1.1] },
];

export type CameraActions = {
  zoom: (factor: number) => void;
  reset: () => void;
  orbit: (horizontal: number, vertical: number) => void;
  discover: (id: DiscoveryId) => void;
  interrupt: () => void;
};

type WaterClock = { value: number };
type Canopy = { object: THREE.Object3D; rotation: THREE.Euler; phase: number };
type CameraJourney = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  startTarget: THREE.Vector3;
  endTarget: THREE.Vector3;
  elapsed: number;
  duration: number;
};
const IVORY = "#f8f4ea";
const UP = new THREE.Vector3(0, 1, 0);
const OVERVIEW_DIRECTION = new THREE.Vector3(36, 29, 43).normalize();

function addWaterMovement(material: THREE.MeshStandardMaterial) {
  if (material.userData.estateWaterClock) return;
  const time: WaterClock = { value: 0 };
  material.userData.estateWaterClock = time;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.estateWaterTime = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vEstateWaterWorld;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvEstateWaterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float estateWaterTime;\nvarying vec3 vEstateWaterWorld;")
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        vec2 ripple = vec2(
          sin(vEstateWaterWorld.x * 5.4 + vEstateWaterWorld.z * 2.8 + estateWaterTime * 0.8),
          cos(vEstateWaterWorld.z * 6.2 - vEstateWaterWorld.x * 1.7 + estateWaterTime * 0.65)
        ) * 0.042;
        normal = normalize(normal + (viewMatrix * vec4(ripple.x, 0.0, ripple.y, 0.0)).xyz);
      `);
  };
  material.customProgramCacheKey = () => "maryhill-water-ripples-v1";
}

export function prepareEstate(scene: THREE.Object3D) {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      material.envMapIntensity = 0.25;
      if (material.name.includes("Ground_Fade")) {
        object.castShadow = false;
        material.transparent = true;
        material.depthWrite = false;
        material.vertexColors = Boolean(object.geometry.attributes.color);
        material.side = THREE.DoubleSide;
      }
      if (material.name.includes("PoolWater")) {
        object.castShadow = false;
        material.roughness = 0.2;
        material.metalness = 0.12;
        material.envMapIntensity = 0.75;
        addWaterMovement(material);
      }
      if (material.name.includes("RoofGlass") || material.name.includes("SaunaGlass")) {
        object.castShadow = false;
        material.depthWrite = false;
      }
      if (material.name.startsWith("HearthFlame")) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
  });
}

function fitOverview(bounds: THREE.Box3, aspect: number, fov: number) {
  const target = bounds.getCenter(new THREE.Vector3());
  target.y = 1.4;
  const right = new THREE.Vector3().crossVectors(UP, OVERVIEW_DIRECTION).normalize();
  const up = new THREE.Vector3().crossVectors(OVERVIEW_DIRECTION, right).normalize();
  const verticalTangent = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  const horizontalTangent = verticalTangent * Math.max(aspect, 0.1);
  let distance = 40;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(target);
        const depth = point.dot(OVERVIEW_DIRECTION);
        distance = Math.max(distance,
          Math.abs(point.dot(right)) * 1.12 / horizontalTangent + depth,
          Math.abs(point.dot(up)) * 1.18 / verticalTangent + depth);
      }
    }
  }
  return { target, distance, position: OVERVIEW_DIRECTION.clone().multiplyScalar(distance).add(target) };
}

function useLivingEstate(model: GLTF) {
  const animation = useMemo(() => {
    const water = new Set<WaterClock>();
    const canopies: Canopy[] = [];
    model.scene.traverse((object) => {
      if (object.name.startsWith("Canopy_")) {
        canopies.push({ object, rotation: object.rotation.clone(), phase: canopies.length * 1.73 });
      }
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        const clock = material.userData.estateWaterClock as WaterClock | undefined;
        if (clock) water.add(clock);
      });
    });
    return { mixer: new THREE.AnimationMixer(model.scene), water: [...water], canopies };
  }, [model]);

  useEffect(() => {
    model.animations.forEach((clip) => animation.mixer.clipAction(clip).play());
    animation.mixer.update(0);
    return () => {
      animation.mixer.stopAllAction();
      animation.mixer.uncacheRoot(model.scene);
      animation.canopies.forEach(({ object, rotation }) => object.rotation.copy(rotation));
    };
  }, [animation, model]);
  return animation;
}

export function EstateScene({ model, actionsRef, onReady, onDiscover, selected, motionEnabled, reducedMotion }: {
  model: GLTF;
  actionsRef: RefObject<CameraActions | null>;
  onReady: () => void;
  onDiscover: (id: DiscoveryId | null) => void;
  selected: DiscoveryId | null;
  motionEnabled: boolean;
  reducedMotion: boolean;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const rendered = useRef(false);
  const introduced = useRef(false);
  const currentDiscovery = useRef<DiscoveryId | null>(null);
  const journey = useRef<CameraJourney | null>(null);
  const motionTime = useRef(0);
  const { get, invalidate, size, setFrameloop } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  const fov = aspect < 0.9 ? 48 : 35;
  const bounds = useMemo(() => new THREE.Box3().setFromObject(model.scene), [model.scene]);
  const overview = useMemo(() => fitOverview(bounds, aspect, fov), [bounds, aspect, fov]);
  const maxDistance = Math.max(130, overview.distance * 1.4);
  const animation = useLivingEstate(model);

  useEffect(() => {
    const { gl, scene } = get();
    const environment = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const texture = generator.fromScene(environment, 0.04);
    scene.environment = texture.texture;
    invalidate();
    return () => {
      scene.environment = null;
      texture.dispose();
      environment.dispose();
      generator.dispose();
    };
  }, [get, invalidate]);

  useEffect(() => {
    const handleVisibility = () => {
      setFrameloop(document.hidden ? "never" : "demand");
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [invalidate, setFrameloop]);

  useEffect(() => {
    const { camera } = get();
    const orbit = controls.current;
    if (!orbit) return;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const interrupt = () => { journey.current = null; introduced.current = true; };
    const moveTo = (position: THREE.Vector3, target: THREE.Vector3, duration = 1.6) => {
      if (reducedMotion) {
        journey.current = null;
        camera.position.copy(position);
        orbit.target.copy(target);
        orbit.update();
      } else {
        journey.current = {
          start: camera.position.clone(), end: position.clone(),
          startTarget: orbit.target.clone(), endTarget: target.clone(), elapsed: 0, duration,
        };
      }
      invalidate();
    };
    const reset = () => {
      currentDiscovery.current = null;
      onDiscover(null);
      moveTo(overview.position, overview.target);
    };
    const discoveryPose = (id: DiscoveryId) => {
      const spot = DISCOVERIES.find((entry) => entry.id === id)!;
      const target = new THREE.Vector3(...spot.target);
      const distanceFactor = aspect < 0.9 ? Math.max(1, 0.9 / aspect) : 1;
      return { target, position: new THREE.Vector3(...spot.offset).multiplyScalar(distanceFactor).add(target) };
    };

    if (!introduced.current && !reducedMotion) {
      camera.position.copy(OVERVIEW_DIRECTION).applyAxisAngle(UP, 0.15)
        .multiplyScalar(overview.distance * 1.2).add(overview.target);
      orbit.target.copy(overview.target).add(new THREE.Vector3(0, 0.5, 0));
      orbit.update();
      moveTo(overview.position, overview.target, 2.5);
    } else {
      const pose = currentDiscovery.current ? discoveryPose(currentDiscovery.current) : overview;
      camera.position.copy(pose.position);
      orbit.target.copy(pose.target);
      orbit.update();
      journey.current = null;
      if (reducedMotion) introduced.current = true;
    }
    actionsRef.current = {
      interrupt,
      reset,
      discover: (id) => {
        const spot = DISCOVERIES.find((entry) => entry.id === id);
        if (!spot) return;
        currentDiscovery.current = id;
        onDiscover(id);
        const pose = discoveryPose(id);
        moveTo(pose.position, pose.target);
      },
      zoom: (factor) => {
        interrupt();
        const offset = camera.position.clone().sub(orbit.target);
        offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, 3, maxDistance));
        camera.position.copy(orbit.target).add(offset);
        orbit.update();
        invalidate();
      },
      orbit: (horizontal, vertical) => {
        interrupt();
        const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
        spherical.theta += horizontal;
        spherical.phi = THREE.MathUtils.clamp(spherical.phi + vertical, 0.12, Math.PI / 2.2);
        camera.position.copy(orbit.target).add(new THREE.Vector3().setFromSpherical(spherical));
        orbit.update();
        invalidate();
      },
    };
    invalidate();
    return () => { actionsRef.current = null; };
  }, [get, actionsRef, overview, maxDistance, fov, aspect, invalidate, reducedMotion, onDiscover]);

  useEffect(() => { invalidate(); }, [motionEnabled, invalidate]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const travel = journey.current;
    if (travel && controls.current) {
      introduced.current = true;
      travel.elapsed += step;
      const t = Math.min(1, travel.elapsed / travel.duration);
      const eased = t * t * t * (t * (t * 6 - 15) + 10);
      get().camera.position.lerpVectors(travel.start, travel.end, eased);
      controls.current.target.lerpVectors(travel.startTarget, travel.endTarget, eased);
      controls.current.update();
      if (t === 1) journey.current = null;
    }
    if (motionEnabled) {
      motionTime.current += step;
      animation.mixer.update(step);
      animation.water.forEach((clock) => { clock.value = motionTime.current; });
      animation.canopies.forEach(({ object, rotation, phase }) => {
        object.rotation.x = rotation.x + Math.sin(motionTime.current * 0.64 + phase) * 0.006;
        object.rotation.z = rotation.z + Math.sin(motionTime.current * 0.48 + phase) * 0.008;
      });
    }
    if (!rendered.current) {
      rendered.current = true;
      onReady();
    }
    if (motionEnabled || journey.current) invalidate();
  });

  return (
    <>
      <color attach="background" args={[IVORY]} />
      <ambientLight intensity={0.12} color="#fff4df" />
      <hemisphereLight args={["#f0f2ec", "#929c79", 0.45]} />
      <directionalLight position={[-25, 50, 32]} color="#ffedcf" intensity={1.7} castShadow
        shadow-mapSize={size.width < 640 ? [2048, 2048] : [4096, 4096]} shadow-camera-left={-44} shadow-camera-right={44}
        shadow-camera-top={38} shadow-camera-bottom={-38} shadow-camera-near={0.5} shadow-camera-far={130}
        shadow-bias={-0.00015} shadow-normalBias={0.025} />
      <primitive object={model.scene} dispose={null} />
      <EstateFire scene={model.scene} motionEnabled={motionEnabled} />
      <pointLight position={[-18.7, 1.22, 6.75]} color="#ffd59b" intensity={.65} distance={2.4} decay={2} />
      <EstateBird motionEnabled={motionEnabled} />
      {selected === null ? DISCOVERIES.map((spot) => (
        <Html key={spot.id} position={spot.marker} center zIndexRange={[4, 1]}>
          <button type="button" className={styles.discoveryMarker} aria-label={`Discover ${spot.label}`}
            onClick={() => actionsRef.current?.discover(spot.id)}>
            <span className={styles.markerDot} aria-hidden="true" />
            <span className={styles.markerLabel}>{spot.label}</span>
          </button>
        </Html>
      )) : null}
      <OrbitControls ref={controls} makeDefault minDistance={3} maxDistance={maxDistance}
        minPolarAngle={0.12} maxPolarAngle={Math.PI / 2.2} enablePan={false} enableDamping dampingFactor={0.09}
        rotateSpeed={0.55} zoomSpeed={0.75} onStart={() => actionsRef.current?.interrupt()}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }} />
    </>
  );
}
