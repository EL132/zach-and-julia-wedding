"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { birdOutsideView, birdScreenSide, createBirdFlight, type BirdFlight } from "./estateBirdFlight";

const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, 1);

function wingGeometry(side: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([
    0, 0, 0.06, side * 0.29, 0.014, 0.04, side * 0.27, 0, -0.14,
    0, 0, 0.06, side * 0.27, 0, -0.14, 0, 0, -0.13,
    side * 0.29, 0.014, 0.04, side * 0.54, 0.006, -0.14, side * 0.27, 0, -0.14,
    side * 0.54, 0.006, -0.14, side * 0.47, 0, -0.24, side * 0.27, 0, -0.14,
  ], 3));
  geometry.addGroup(0, 9, 0);
  geometry.addGroup(9, 3, 1);
  geometry.computeVertexNormals();
  return geometry;
}

/** One small gull. The estate's existing animation loop owns invalidation. */
export default function EstateBird({ motionEnabled }: { motionEnabled: boolean }) {
  const bird = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  const flight = useRef<BirdFlight | null>(null);
  const elapsed = useRef(0);
  const wingTime = useRef(0);
  const bank = useRef(0);
  const geometry = useMemo(() => ({ left: wingGeometry(-1), right: wingGeometry(1) }), []);
  const scratch = useMemo(() => ({
    point: new THREE.Vector3(), forward: new THREE.Vector3(), next: new THREE.Vector3(),
    right: new THREE.Vector3(), up: new THREE.Vector3(), matrix: new THREE.Matrix4(),
    orientation: new THREE.Quaternion(), roll: new THREE.Quaternion(),
  }), []);

  useEffect(() => () => {
    geometry.left.dispose();
    geometry.right.dispose();
  }, [geometry]);

  useFrame(({ camera }, delta) => {
    const object = bird.current;
    if (!object) return;
    if (!flight.current) {
      flight.current = createBirdFlight(camera, Math.random() < 0.5 ? -1 : 1);
      object.position.copy(flight.current.curve.v0);
    }
    if (!motionEnabled) return;
    // A hidden tab or a slow frame never advances the bird by a large jump.
    const step = Math.min(delta, 0.05);
    elapsed.current += step;
    wingTime.current += step;
    const current = flight.current;
    const progress = Math.min(elapsed.current / current.duration, 1);
    current.curve.getPointAt(progress, scratch.point);
    current.curve.getTangentAt(progress, scratch.forward).normalize();

    if (elapsed.current > current.duration) {
      // If the camera moved during the pass, continue naturally until the whole
      // gull clears the new frustum. Never wrap while either endpoint is visible.
      const speed = current.curve.getLength() / current.duration;
      scratch.point.addScaledVector(scratch.forward, (elapsed.current - current.duration) * speed);
      if (birdOutsideView(camera, scratch.point)) {
        const entrySide = -birdScreenSide(camera, scratch.point) as -1 | 1;
        flight.current = createBirdFlight(camera, entrySide);
        elapsed.current = 0;
        object.position.copy(flight.current.curve.v0);
        return;
      }
    }
    object.position.copy(scratch.point);

    current.curve.getTangentAt(Math.min(progress + 0.012, 1), scratch.next);
    const turn = scratch.forward.z * scratch.next.x - scratch.forward.x * scratch.next.z;
    const desiredBank = THREE.MathUtils.clamp(-turn * 24, -0.46, 0.46);
    bank.current = THREE.MathUtils.damp(bank.current, desiredBank, 3.5, step);
    scratch.right.crossVectors(UP, scratch.forward).normalize();
    scratch.up.crossVectors(scratch.forward, scratch.right).normalize();
    scratch.matrix.makeBasis(scratch.right, scratch.up, scratch.forward);
    scratch.orientation.setFromRotationMatrix(scratch.matrix);
    scratch.roll.setFromAxisAngle(FORWARD, bank.current);
    object.quaternion.copy(scratch.orientation).multiply(scratch.roll);

    // Short flapping spells blend into longer, gently flexed glides.
    const cycle = wingTime.current % 7.8;
    const envelope = THREE.MathUtils.smoothstep(cycle, 0, 0.45)
      * (1 - THREE.MathUtils.smoothstep(cycle, 2.15, 2.8));
    const flap = Math.sin(wingTime.current * 11.4) * 0.43 * envelope;
    const spread = 0.065 + Math.sin(wingTime.current * 1.1) * 0.018 + flap;
    if (leftWing.current) leftWing.current.rotation.z = -spread;
    if (rightWing.current) rightWing.current.rotation.z = spread;
  });

  return (
    <group ref={bird} name="Estate_gull" position={[0, -100, 0]}>
      <mesh scale={[0.09, 0.085, 0.235]}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color="#e8e9df" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.055, 0.185]} scale={[0.071, 0.069, 0.09]}>
        <sphereGeometry args={[1, 9, 7]} />
        <meshStandardMaterial color="#f4f0df" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.046, 0.286]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.023, 0.09, 5]} />
        <meshStandardMaterial color="#c5a065" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.063, 0.079, 0.216]}>
          <sphereGeometry args={[0.009, 5, 4]} />
          <meshStandardMaterial color="#465048" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.005, -0.245]} scale={[0.11, 0.014, 0.115]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial color="#dde0d7" roughness={0.9} />
      </mesh>
      <group ref={leftWing} position={[-0.067, 0.015, 0]}>
        <mesh geometry={geometry.left}>
          <meshStandardMaterial attach="material-0" color="#d8dfd9" roughness={0.88} side={THREE.DoubleSide} />
          <meshStandardMaterial attach="material-1" color="#5c6961" roughness={0.94} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={rightWing} position={[0.067, 0.015, 0]}>
        <mesh geometry={geometry.right}>
          <meshStandardMaterial attach="material-0" color="#d8dfd9" roughness={0.88} side={THREE.DoubleSide} />
          <meshStandardMaterial attach="material-1" color="#5c6961" roughness={0.94} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
