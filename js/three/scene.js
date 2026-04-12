// ============================================================
//  THREE.JS SCENE SETUP
// ============================================================

import * as THREE from 'three';
import { LIGHTS } from '../config.js';

export let scene, camera, renderer, clock;

export function initScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // ── Renderer ───────────────────────────────────────────────
  // NOTE: alpha is intentionally false here.
  // Glass transmission (MeshPhysicalMaterial) requires a real
  // background scene to refract — a transparent canvas gives
  // nothing for the glass to bend. We set background color
  // below to match the CSS page color so it looks seamless.
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace   = THREE.SRGBColorSpace;

  // ── Scene ──────────────────────────────────────────────────
  scene = new THREE.Scene();

  // Background matches CSS --color-bg exactly — makes canvas
  // look like it's part of the page while enabling glass refraction
  scene.background = new THREE.Color(0x080d18);

  // Volumetric fog — Iceland/mist depth effect
  // Fog(color, near, far) — increase 'far' to reduce fog density
  scene.fog = new THREE.FogExp2(0x080d18, 0.025);

  // ── Camera ─────────────────────────────────────────────────
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 10);

  // ── Clock ──────────────────────────────────────────────────
  clock = new THREE.Clock();

  // ── Environment map ────────────────────────────────────────
  // Critical for realistic glass: the env map provides what
  // the glass refracts and reflects. A cold, icy environment
  // gives the material its glacial quality.
  scene.environment = buildColdEnvironment(renderer);

  // ── Lights ─────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(LIGHTS.ambient.color, LIGHTS.ambient.intensity);
  scene.add(ambient);

  const key = new THREE.PointLight(LIGHTS.key.color, LIGHTS.key.intensity, 30);
  key.position.set(...LIGHTS.key.position);
  scene.add(key);

  const fill = new THREE.PointLight(LIGHTS.fill.color, LIGHTS.fill.intensity, 25);
  fill.position.set(...LIGHTS.fill.position);
  scene.add(fill);

  const rim = new THREE.PointLight(LIGHTS.rim.color, LIGHTS.rim.intensity, 20);
  rim.position.set(...LIGHTS.rim.position);
  scene.add(rim);

  // Extra rim from below for the icy under-light
  const underLight = new THREE.PointLight(0x4a9ec4, 1.5, 18);
  underLight.position.set(0, -6, 4);
  scene.add(underLight);

  // ── Resize handler ─────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  return { scene, camera, renderer, clock };
}

// ── Cold environment builder ───────────────────────────────
// Builds a PMREM environment map for realistic glass refraction.
//
// Glass transmission is driven by what the env map contains —
// the brighter and more contrasty the env, the more the glass
// "pops" with internal light. We simulate an icy overcast sky:
// very bright cold top, dark cold base, punchy key highlights.
//
// Three bright "hot spots" give the glass convincing specular
// flares and visible edge-refraction even at transmission = 1.

function buildColdEnvironment(renderer) {
  const envScene = new THREE.Scene();

  // Bright emissive sphere — acts like an overcast icy sky dome.
  // This is the single most important thing for making glass look
  // good: a large, bright ambient source for it to refract.
  const domeMat = new THREE.MeshBasicMaterial({
    color:  0x3a6e96,  // cold mid-sky blue
    side:   THREE.BackSide,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 16), domeMat);
  envScene.add(dome);

  // Point lights provide the high-contrast hot-spots that make
  // glass prismatic edges and refractions visible.
  const envLights = [
    // Hard sun — primary specular source, cold white
    { color: 0xddf4ff, intensity: 28, pos: [14,  18,  10] },
    // Icy sky fill — top ambient
    { color: 0x88c8e8, intensity: 12, pos: [ 0,  20,   0] },
    // Front rim — glacial specular punch
    { color: 0xb8e8ff, intensity: 14, pos: [ 2,   4,  16] },
    // Side key — icy blue
    { color: 0x6ab4d8, intensity: 10, pos: [-12,  6,   8] },
    // Under-ice glow — cold ground bounce
    { color: 0x2a5070, intensity:  6, pos: [  0, -14,   4] },
  ];

  envLights.forEach(({ color, intensity, pos }) => {
    const l = new THREE.PointLight(color, intensity, 120);
    l.position.set(...pos);
    envScene.add(l);
  });

  const pmrem  = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  envScene.clear();

  return envTex;
}

// ── Render loop ────────────────────────────────────────────

export function startRenderLoop(updateFns = []) {
  function tick() {
    requestAnimationFrame(tick);
    const delta   = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    updateFns.forEach(fn => fn(delta, elapsed));
    renderer.render(scene, camera);
  }
  tick();
}
