// ============================================================
//  PARTICLE SYSTEM — Twinkling star field
//
//  THREE.Points — the star field
//    - vertexColors: true → each star twinkles independently
//    - per-particle phase + frequency (independent sine curves)
//    - brightness = sine wave ^ 1.8  → realistic pop-and-fade
//    - slight colour variation per star (ice-blue → blue-white)
//    - idle drift + mouse repulsion with spring-back
//
// ============================================================

import * as THREE from 'three';
import { scene } from './scene.js';
import { PARTICLES as CFG } from '../config.js';

// ── Module state ──────────────────────────────────────────
let points;
let originalPositions;
let velocities;
let twinklePhase;
let twinkleFreq;
let mouse3D = new THREE.Vector3();


// ── Init ──────────────────────────────────────────────────

export function initParticles() {
  const count = CFG.count;

  const positions = new Float32Array(count * 3);
  originalPositions = new Float32Array(count * 3);
  velocities        = new Float32Array(count * 3);
  twinklePhase      = new Float32Array(count);
  twinkleFreq       = new Float32Array(count);
  const colors      = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Sphere distribution
    const theta  = Math.random() * Math.PI * 2;
    const phi    = Math.acos(2 * Math.random() - 1);
    const radius = Math.cbrt(Math.random()) * CFG.spread;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi) - 2;

    positions[i3]     = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    originalPositions[i3]     = x;
    originalPositions[i3 + 1] = y;
    originalPositions[i3 + 2] = z;

    // Independent twinkle curve per star (phase 0–2π, freq 0.3–2.5 Hz)
    twinklePhase[i] = Math.random() * Math.PI * 2;
    twinkleFreq[i]  = 0.3 + Math.random() * 2.2;

    // Initial colour (overwritten each frame by twinkle logic)
    colors[i3]     = 0.6;
    colors[i3 + 1] = 0.8;
    colors[i3 + 2] = 1.0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size:            CFG.size,
    sizeAttenuation: true,
    vertexColors:    true,
    transparent:     true,
    opacity:         1.0,
    depthWrite:      false,
    blending:        THREE.AdditiveBlending,
  });

  points = new THREE.Points(geo, mat);
  scene.add(points);

  // Mouse tracking for repulsion
  window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth)  * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse3D.set(nx * 8, ny * 4, 0);
  });
}

// ── Update (every frame) ──────────────────────────────────

export function updateParticles(delta, elapsed) {
  if (!points) return;

  const pos    = points.geometry.attributes.position.array;
  const colArr = points.geometry.attributes.color.array;
  const count  = CFG.count;
  const rSq    = CFG.mouseRadius * CFG.mouseRadius;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const px = pos[i3];
    const py = pos[i3 + 1];
    const pz = pos[i3 + 2];

    const ox = originalPositions[i3];
    const oy = originalPositions[i3 + 1];
    const oz = originalPositions[i3 + 2];

    // ── Mouse repulsion ────────────────────────────────────
    const mx     = px - mouse3D.x;
    const my     = py - mouse3D.y;
    const mz     = pz - mouse3D.z;
    const distSq = mx * mx + my * my + mz * mz;

    if (distSq < rSq && distSq > 0.001) {
      const dist     = Math.sqrt(distSq);
      const force    = (CFG.mouseRadius - dist) / CFG.mouseRadius;
      const strength = CFG.repelStrength * force * force;
      velocities[i3]     += (mx / dist) * strength;
      velocities[i3 + 1] += (my / dist) * strength;
      velocities[i3 + 2] += (mz / dist) * strength;
    }

    // ── Spring back to home ────────────────────────────────
    velocities[i3]     += (ox - px) * CFG.returnSpeed;
    velocities[i3 + 1] += (oy - py) * CFG.returnSpeed;
    velocities[i3 + 2] += (oz - pz) * CFG.returnSpeed;

    // ── Damping ────────────────────────────────────────────
    velocities[i3]     *= 0.92;
    velocities[i3 + 1] *= 0.92;
    velocities[i3 + 2] *= 0.92;

    // ── Idle drift ─────────────────────────────────────────
    pos[i3]     = px + velocities[i3]     + Math.sin(elapsed * CFG.driftSpeed * 1000 + i) * 0.001;
    pos[i3 + 1] = py + velocities[i3 + 1] + Math.cos(elapsed * CFG.driftSpeed * 800  + i) * 0.001;
    pos[i3 + 2] = pz + velocities[i3 + 2];

    // ── Twinkle ────────────────────────────────────────────
    const t          = twinklePhase[i] + elapsed * twinkleFreq[i];
    const brightness = 0.1 + 0.9 * Math.pow(Math.max(0, Math.sin(t) * 0.5 + 0.5), 1.8);

    // Permanent warm/cold bias per star (from static phase)
    const warmth   = (Math.sin(twinklePhase[i] * 3.7) + 1) * 0.5;
    colArr[i3]     = brightness * (0.50 + warmth * 0.50);
    colArr[i3 + 1] = brightness * (0.72 + warmth * 0.28);
    colArr[i3 + 2] = brightness * 1.0;
  }

  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.attributes.color.needsUpdate     = true;
}
