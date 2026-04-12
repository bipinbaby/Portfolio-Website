// ============================================================
//  HERO 3D OBJECT — Realistic Frosted Glass Shader
//
//  Uses THREE.MeshPhysicalMaterial with:
//  - transmission   : full light pass-through
//  - dispersion     : chromatic aberration / rainbow prism edges
//  - iridescence    : thin-film interference (soap bubble effect)
//  - attenuationColor: volumetric ice-blue tint inside thick areas
//  - roughness      : surface frosting level
//
//  HOW TO ADD YOUR MODEL:
//  1. Export from Blender: File → Export → glTF 2.0 (.glb)
//     ✓ Check "Apply Modifiers"  ✓ Check "Mesh"  ✓ Uncheck cameras/lights
//  2. Drop the file into: assets/models/hero.glb
//  3. Adjust HERO_OBJECT.scale in config.js if size is off
//  4. Your UVs are preserved — the glass refracts light through them
//
//  Until your model is ready, a fallback TorusKnot is shown.
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { HERO_OBJECT as CFG } from '../config.js';

let heroMesh = null;

// ── Scroll velocity ───────────────────────────────────────
// Tracks wheel scroll speed and converts it to a rotation
// impulse. Damped each frame so rotation fades back to idle.

let scrollVelocity = 0;

window.addEventListener('wheel', (e) => {
  // deltaY is pixels scrolled — scale down to rotation radians
  // Keep this small: a single mouse notch (~100px) should give a
  // gentle nudge, not a full spin.
  scrollVelocity += e.deltaY * 0.00022;
}, { passive: true });

// ── Realistic Glass Material ──────────────────────────────
//
//  Key properties explained:
//
//  transmission (0–1)
//    How much light passes through. 1.0 = fully see-through glass.
//
//  roughness (0–1)
//    0 = crystal clear / 1 = fully frosted/milky.
//    0.05–0.15 = slightly frosted glass (like a cold window pane).
//
//  ior (index of refraction)
//    How strongly light bends. Glass = 1.5, Ice = 1.31, Water = 1.33.
//    Higher = more distortion of objects seen through the glass.
//
//  thickness
//    Simulates glass volume depth. Affects attenuation and refraction.
//    Higher = deeper color tint visible in thick areas.
//
//  dispersion (0–1)  ← Three.js r164+
//    Splits light into its colour components — the rainbow/prism
//    effect visible at glass edges. 0 = none, 1 = strong prism.
//
//  iridescence (0–1)  ← Three.js r164+
//    Thin-film interference — the pearlescent colour shift you see
//    on soap bubbles, oil slicks, and some glass. Subtle on this material.
//
//  attenuationColor + attenuationDistance
//    The colour and depth of the volumetric tint inside the glass.
//    Think of light turning slightly blue when passing through thick ice.

function createGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({

    // ── Core glass ──────────────────────────────────────────
    color:          new THREE.Color(CFG.glass.color),   // base surface tint
    transmission:   CFG.glass.transmission,             // 1.0 = fully transmissive
    roughness:      CFG.glass.roughness,                // surface frosting level
    metalness:      0,
    ior:            CFG.glass.ior,                      // light bending strength
    thickness:      CFG.glass.thickness,                // glass volume depth

    // ── Clearcoat — the key to "realistic" glass ────────────
    //
    //  Real frosted glass has TWO layers:
    //  1. A rough/frosted interior surface (roughness above)
    //  2. A perfectly smooth outer coat — like the polished
    //     surface of etched glass or a cold window pane
    //
    //  clearcoat adds this second layer. You get:
    //  - Sharp, mirror-like specular highlights on the surface
    //  - Frosted/milky look in transmission (from roughness)
    //  → This is exactly what frosted glass looks like IRL.

    clearcoat:          CFG.glass.clearcoat,            // strength of outer gloss coat
    clearcoatRoughness: CFG.glass.clearcoatRoughness,   // 0 = mirror-sharp coat

    // ── Specular ────────────────────────────────────────────
    //  Controls the colour and brightness of direct light
    //  reflections. Cold icy white makes highlights look glacial.

    specularIntensity: CFG.glass.specularIntensity,
    specularColor:     new THREE.Color(CFG.glass.specularColor),

    // ── Advanced realism ────────────────────────────────────
    dispersion:     CFG.glass.dispersion,               // rainbow prism at edges
    iridescence:    CFG.glass.iridescence,              // thin-film colour shift
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [80, 500],               // nm film thickness range

    // ── Volumetric tint ─────────────────────────────────────
    // Light picks up a cold blue cast travelling through thick glass
    attenuationColor:    new THREE.Color(CFG.glass.attenuationColor),
    attenuationDistance: CFG.glass.attenuationDistance,

    // ── Environment & rendering ─────────────────────────────
    envMapIntensity: CFG.glass.envIntensity,
    transparent:     true,
    side:            THREE.DoubleSide,   // render inside + outside faces
  });
}

// ── Load your GLB model ───────────────────────────────────

export function initHeroObject() {
  const glassMat = createGlassMaterial();
  const loader   = new GLTFLoader();

  loader.load(
    CFG.modelPath,

    // onLoad
    (gltf) => {
      const model = gltf.scene;
      model.traverse(child => {
        if (child.isMesh) {
          child.material    = glassMat;
          child.castShadow    = false;
          child.receiveShadow = false;
        }
      });
      model.scale.setScalar(CFG.scale);
      scene.add(model);
      heroMesh = model;
      console.log('✓ Hero model loaded:', CFG.modelPath);
    },

    undefined,

    // onError — show fallback while waiting for your model
    (err) => {
      console.warn('Hero model not found — showing fallback shape.');
      console.warn('Drop your .glb at:', CFG.modelPath);
      useFallback(glassMat);
    }
  );
}

// ── Fallback geometry ─────────────────────────────────────
// Shows while your model isn't ready yet. Uses the same
// glass material so it already looks intentional.
// TorusKnot chosen for its complex silhouette — glass refracts
// beautifully through it while you prep your real mesh.

function useFallback(glassMat) {
  // TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q)
  // p/q control the knot topology — try (2,3), (3,5), (3,4) for different shapes
  const geo  = new THREE.TorusKnotGeometry(1.6, 0.45, 200, 40, 2, 3);
  const mesh = new THREE.Mesh(geo, glassMat);
  scene.add(mesh);
  heroMesh = mesh;
}

// ── Per-frame update ──────────────────────────────────────

export function updateHeroObject(delta, elapsed) {
  if (!heroMesh) return;

  // ── Scroll velocity → rotation ────────────────────────────
  // Decay the velocity each frame (simulates inertia).
  // 0.92 = fast decay (snappy stop), 0.97 = slow decay (floaty).
  scrollVelocity *= 0.87;

  // Clamp — cap at a gentle per-frame nudge, not a full spin
  const MAX = 0.018;
  if (scrollVelocity >  MAX) scrollVelocity =  MAX;
  if (scrollVelocity < -MAX) scrollVelocity = -MAX;

  // Idle rotation + scroll boost on Y axis
  // X tilts slightly on scroll for a more 3D feel
  heroMesh.rotation.y += CFG.rotationSpeed.y + scrollVelocity;
  heroMesh.rotation.x += CFG.rotationSpeed.x + scrollVelocity * 0.3;

  // Subtle float
  heroMesh.position.y = Math.sin(elapsed * 0.5) * 0.18;
}
