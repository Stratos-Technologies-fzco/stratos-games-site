import * as THREE from 'three';

// Shared helpers for the aircraft modules (createTrainer / createFighter / createAirliner / createHelicopter).
// Airframe axes: -Z = nose, +Y = up, origin = physics position (groundHeight above the runway when parked).

// Control surface hinged at its leading edge (x, y, z); the surface extends aft (+Z)
export function addSurface(parent, mat, w, h, d, x, y, z) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  const surface = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  surface.position.z = d / 2;
  pivot.add(surface);
  parent.add(pivot);
  return pivot;
}

// Fixed landing gear leg: strut from (x, top, z) down to a wheel resting on the runway at groundY
export function addGearLeg(parent, mat, x, top, z, groundY, wheelRadius) {
  const wheelY = groundY + wheelRadius;
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, top - wheelY, 6), mat);
  strut.position.set(x, (top + wheelY) / 2, z);
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelRadius * 0.6, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheel = new THREE.Mesh(wheelGeo, mat);
  wheel.position.set(x, wheelY, z);
  parent.add(strut, wheel);
}

// Frees every geometry, material and texture under root
export function disposeObject(root) {
  const materials = new Set();
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m));
  });
  materials.forEach((m) => {
    for (const key in m) {
      if (m[key] && m[key].isTexture) m[key].dispose();
    }
    m.dispose();
  });
}

// Pilot input -> control surface deflection (radians), same sign rules for every airframe
export const SURFACE_DEFLECTION = 0.35;

export function deflectSurfaces(s, input) {
  const k = SURFACE_DEFLECTION;
  if (s.aileronL) { s.aileronL.rotation.x = input.roll * k; s.aileronR.rotation.x = -input.roll * k; }
  if (s.elevator) s.elevator.rotation.x = -input.pitch * k;
  if (s.rudder) s.rudder.rotation.y = input.yaw * k;
  if (s.elevonL) {
    s.elevonL.rotation.x = Math.max(-k, Math.min(k, -(input.pitch - input.roll) * k));
    s.elevonR.rotation.x = Math.max(-k, Math.min(k, -(input.pitch + input.roll) * k));
  }
}
