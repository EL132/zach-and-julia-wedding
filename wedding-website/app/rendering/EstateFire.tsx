"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Flame = { object: THREE.Object3D; scale: THREE.Vector3; heightAxis: "x" | "y" | "z"; phase: number };

export function EstateFire({ scene, motionEnabled }: { scene: THREE.Object3D; motionEnabled: boolean }) {
  const time = useRef(0);
  const light = useRef<THREE.PointLight>(null);
  const fire = useMemo(() => {
    const flames: Flame[] = [];
    const materials = new Map<THREE.MeshStandardMaterial, number>();
    scene.updateMatrixWorld(true);
    scene.traverse((object) => {
      if (object.name.startsWith("HearthFlameRoot_")) {
        // glTF can preserve a Z-up pivot or bake the axis conversion. Find local up.
        const localUp = new THREE.Vector3(0, 1, 0)
          .applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion()).invert());
        const axes = ["x", "y", "z"] as const;
        const heightAxis = axes.reduce((best, axis) => Math.abs(localUp[axis]) > Math.abs(localUp[best]) ? axis : best, axes[0] as typeof axes[number]);
        flames.push({ object, scale: object.scale.clone(), heightAxis, phase: flames.length * 1.79 });
      }
      if (!(object instanceof THREE.Mesh)) return;
      const ownMaterials = Array.isArray(object.material) ? object.material : [object.material];
      ownMaterials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial && material.name.startsWith("HearthFlame")) {
          materials.set(material, material.emissiveIntensity);
        }
      });
    });
    return { flames, materials };
  }, [scene]);

  useEffect(() => () => {
    fire.flames.forEach(({ object, scale }) => object.scale.copy(scale));
    fire.materials.forEach((intensity, material) => { material.emissiveIntensity = intensity; });
  }, [fire]);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    time.current += Math.min(delta, .05);
    const t = time.current;
    fire.flames.forEach(({ object, scale, heightAxis, phase }) => {
      object.scale[heightAxis] = scale[heightAxis] * (1 + .10*Math.sin(t*4.3+phase) + .05*Math.sin(t*7.1-phase));
    });
    const flicker = 1 + .07*Math.sin(t*6.1) + .035*Math.sin(t*10.7);
    fire.materials.forEach((intensity, material) => { material.emissiveIntensity = intensity*flicker; });
    if (light.current) light.current.intensity = .42*flicker;
  });

  return <pointLight ref={light} position={[-10.45, .88, -1.85]} color="#ffc477" intensity={.42} distance={1.8} decay={2} />;
}
