import * as THREE from "three";

export type ScreenSide = -1 | 1;
export type BirdFlight = { curve: THREE.CubicBezierCurve3; duration: number; exitSide: ScreenSide };

// The tallest roof is 9.4 units; even the lowest point stays well above it.
const FLIGHT_FLOOR = 12;
const VISIBILITY_RADIUS = 1.25;

export function birdOutsideView(camera: THREE.Camera, point: THREE.Vector3) {
  camera.updateMatrixWorld();
  const projection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const frustum = new THREE.Frustum().setFromProjectionMatrix(projection);
  return !frustum.intersectsSphere(new THREE.Sphere(point, VISIBILITY_RADIUS));
}

export function birdScreenSide(camera: THREE.Camera, point: THREE.Vector3): ScreenSide {
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  return point.clone().sub(camera.position).dot(right) < 0 ? -1 : 1;
}

export function createBirdFlight(camera: THREE.Camera, entrySide: ScreenSide, random = Math.random): BirdFlight {
  camera.updateMatrixWorld();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
  if (right.lengthSq() < 0.01) right.set(1, 0, 0);
  const across = right.clone().multiplyScalar(-entrySide);
  const depth = new THREE.Vector3(-right.z, 0, right.x);
  const center = new THREE.Vector3((random() - 0.5) * 10, FLIGHT_FLOOR + 1 + random() * 2, (random() - 0.5) * 10);

  let reach = 42;
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  // Both ends must clear the current camera, including after a zoom or orbit.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    start.copy(center).addScaledVector(across, -reach);
    end.copy(center).addScaledVector(across, reach);
    if (birdOutsideView(camera, start) && birdOutsideView(camera, end)) break;
    reach *= 1.4;
  }

  const bend = (random() < 0.5 ? -1 : 1) * (7 + random() * 10);
  const first = center.clone().addScaledVector(across, -reach * 0.33).addScaledVector(depth, bend);
  const second = center.clone().addScaledVector(across, reach * 0.33).addScaledVector(depth, -bend * (0.4 + random() * 0.65));
  first.y = FLIGHT_FLOOR + random() * 5;
  second.y = FLIGHT_FLOOR + random() * 5;
  const curve = new THREE.CubicBezierCurve3(start, first, second, end);
  return { curve, duration: curve.getLength() / (4.8 + random() * 1.3), exitSide: -entrySide as ScreenSide };
}
