// ============================================================
//  RING CAROUSEL — drives the Blender carousel rig in the browser
//
//  The rig comes from CAROUSEL.blend → assets/models/carousel.glb:
//
//    Carousel_Root   (userData: radius, card_count)
//      └ Carousel_Spin          ← we rotate this (y = -index · 2π / count)
//          └ Card_Slot_00..07   ← evenly spaced around the ring
//              └ Card_00..07    ← the card plane (free for scale / hover)
//
//  One GLB, two looks:
//    orient: 'vertical'   → ring stood on its side, spins like a
//                           Ferris wheel (featured projects)
//    orient: 'horizontal' → flat ring seen from slightly above
//                           (social reels)
//
//  The rig only has 8 cards, but you can pass any number of items.
//  Each card shows whichever item is "at its position" in an
//  endless list — when a card swings round the back, its image is
//  quietly swapped for the next item coming up. So 3 items or 30
//  both work.
//
//  Usage:
//    const ring = await createRingCarousel(canvas, {
//      items, getImage: item => item.thumbnail,   // URL or Promise<URL>
//      orient: 'vertical', cardAspect: 16/10,
//      onActive: i => …, onClick: i => …,
//    });
//    ring.setTarget(2.5);   // float index — the ring eases towards it
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── Shared loaders (one GLB download for every carousel) ──

const rigCache = new Map();
function loadRig(path) {
  if (!rigCache.has(path)) rigCache.set(path, new GLTFLoader().loadAsync(path));
  return rigCache.get(path);
}

const textureLoader = new THREE.TextureLoader();
const textureCache  = new Map();
function loadTexture(url) {
  if (!textureCache.has(url)) {
    textureCache.set(url, new Promise(resolve => {
      textureLoader.load(
        encodeURI(url),
        tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.flipY      = false;    // glTF UVs are top-down (Blender export)
          tex.anisotropy = 4;
          resolve(tex);
        },
        undefined,
        () => resolve(null),   // missing image → card stays as a dark placeholder
      );
    }));
  }
  return textureCache.get(url);
}

// 1×1 dark texture so every card always has a map (keeps the shader simple)
const blankTexture = new THREE.DataTexture(new Uint8Array([20, 25, 34, 255]), 1, 1);
blankTexture.colorSpace = THREE.SRGBColorSpace;
blankTexture.needsUpdate = true;

const mod = (a, n) => ((a % n) + n) % n;

// ── Card material ──────────────────────────────────────────
// Unlit (colours stay true to the image) with a small shader
// patch for the Figma card look: rounded corners + a thick
// yellow frame. Side and back cards are dimmed.
//
//   frame.radius  corner radius  (fraction of card height)
//   frame.border  frame thickness (fraction of card height)
//   frame.color   frame colour

function makeCardMaterial(aspect, frame, sideOpacity = 1) {
  const uniforms = {
    uAspect:      { value: aspect },
    uRadius:      { value: frame.radius },
    uBorder:      { value: frame.border },
    uBorderColor: { value: new THREE.Color(frame.color) },
    uActive:      { value: 0 },                           // 0 → 1 as the card reaches the front
    uLight:       { value: 1 },                           // brightness from angle to camera
    uSideAlpha:   { value: sideOpacity },                 // opacity of cards away from the front (0 = hidden)
  };

  const mat = new THREE.MeshBasicMaterial({
    map: blankTexture,
    side: THREE.DoubleSide,
    transparent: true,
  });

  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vCardUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvCardUv = uv;');

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec2 vCardUv;
        uniform float uAspect, uRadius, uBorder, uActive, uLight, uSideAlpha;
        uniform vec3  uBorderColor;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        // Rounded-rectangle signed distance in card space (height = 1)
        vec2  p    = (vCardUv - 0.5) * vec2(uAspect, 1.0);
        vec2  b    = vec2(uAspect, 1.0) * 0.5 - uRadius;
        float d    = length(max(abs(p) - b, 0.0)) - uRadius;
        float aa   = fwidth(d);
        float mask = 1.0 - smoothstep(-aa, aa, d);

        // Yellow frame: everything within uBorder of the edge
        float frameT = smoothstep(-uBorder - aa, -uBorder + aa, d);

        float light = gl_FrontFacing ? uLight : uLight * 0.25;
        diffuseColor.rgb *= mix(light, 1.0, uActive);
        diffuseColor.rgb  = mix(diffuseColor.rgb, uBorderColor * mix(0.55 + 0.45 * light, 1.0, uActive), frameT);
        diffuseColor.a   *= mask * mix(uSideAlpha, 1.0, uActive);`);
  };

  mat.userData.uniforms = uniforms;
  return mat;
}

// ── Cover-fit an image onto a card (like CSS object-fit: cover) ──

function fitCover(tex, cardAspect) {
  const img = tex.image;
  if (!img?.width) return tex;
  const t = tex.clone();               // clone so one image can sit on cards of different shapes
  const imgAspect = img.width / img.height;
  t.repeat.set(1, 1);
  t.offset.set(0, 0);
  if (imgAspect > cardAspect) {
    t.repeat.x = cardAspect / imgAspect;
    t.offset.x = (1 - t.repeat.x) / 2;
  } else {
    t.repeat.y = imgAspect / cardAspect;
    t.offset.y = (1 - t.repeat.y) / 2;
  }
  t.needsUpdate = true;
  return t;
}

// ============================================================

export async function createRingCarousel(canvas, opts) {
  const {
    modelPath   = 'assets/models/carousel.glb',
    items       = [],
    getImage    = item => item.image,
    orient      = 'horizontal',
    cardAspect  = 5 / 7,
    tangentSize = orient === 'vertical' ? 2.1 : 2.0,  // card size along the ring (world units)
    tilt        = 0,
    yaw         = 0,
    offsetX     = () => 0,       // fraction of canvas width to shift the ring (neg = left)
    frame       = null,          // (w, h) => ({ distance?, yaw?, tilt? }) — per-size camera framing
    camera: camCfg = {},
    fog         = [7, 15],
    background  = '#114339',
    cardStyle   = { radius: 0.12, border: 0.023, color: '#ffcc00' },  // Figma card: corner + yellow frame (fractions of card height)
    sideOpacity = 1,             // 0 = only the front card is visible; the rest fade out
    fadeSpan    = 1.6,           // how quickly cards fade away from the front (higher = sooner)
    smoothTime  = 0,             // > 0 → spring easing (seconds to settle) instead of plain damping
    motion      = null,          // per-card transition flourish, see applyMotion() below
    damping     = 0.09,
    onActive    = () => {},
    onClick     = () => {},
    onHover     = () => {},
  } = opts;

  // ── Renderer / scene / camera ────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);  // transparent — the page background shows through

  const scene = new THREE.Scene();
  scene.fog   = new THREE.Fog(background, fog[0], fog[1]);

  const camera = new THREE.PerspectiveCamera(camCfg.fov ?? 38, 1, 0.1, 60);

  // ── Rig ──────────────────────────────────────────────────
  const gltf = await loadRig(modelPath);
  const root = gltf.scene.getObjectByName('Carousel_Root').clone(true);
  const spin = root.getObjectByName('Carousel_Spin');
  const radius    = root.userData.radius     ?? 3.4;
  const slotCount = root.userData.card_count ?? 8;

  // Wrapper groups: stage (yaw / tilt / position) → root (orientation)
  const stage = new THREE.Group();
  stage.rotation.order = 'YXZ';
  stage.rotation.set(tilt, yaw, 0);
  stage.add(root);
  scene.add(stage);

  if (orient === 'vertical') root.rotation.set(0, 0, Math.PI / 2);   // ring axis → horizontal

  // Card size: `tangentSize` along the ring, the other side from the aspect
  const along  = tangentSize;
  const across = orient === 'vertical' ? tangentSize * cardAspect : tangentSize / cardAspect;
  const cardW  = orient === 'vertical' ? across : along;
  const cardH  = orient === 'vertical' ? along  : across;

  const cards = [];
  for (let k = 0; k < slotCount; k++) {
    const id   = String(k).padStart(2, '0');
    const node = root.getObjectByName(`Card_${id}`);
    const mesh = node?.isMesh ? node : node?.getObjectByProperty('isMesh', true);
    if (!mesh) continue;

    mesh.geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    mesh.geometry.boundingBox.getSize(size);           // Blender card: 2 × 2.8

    const mat = makeCardMaterial(cardW / cardH, cardStyle, sideOpacity);
    mesh.material = mat;

    // Vertical wheel: undo the root's 90° roll so cards stay upright
    if (orient === 'vertical') node.rotation.z = -Math.PI / 2;
    const base = new THREE.Vector3(cardW / size.x, cardH / size.y, 1);
    node.scale.copy(base);

    cards.push({ slot: k, node, mesh, mat, base, baseRot: node.rotation.clone(), hover: 0, itemIndex: null, loading: null });
  }

  // ── Camera framing ───────────────────────────────────────
  const camDist = camCfg.distance ?? (radius + 6);
  camera.position.set(0, camCfg.height ?? 0, camDist);
  camera.lookAt(0, camCfg.lookY ?? 0, camCfg.lookZ ?? radius * 0.5);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const f = frame?.(w, h) ?? {};
    camera.position.z = f.distance ?? camDist;
    stage.rotation.y  = f.yaw ?? yaw;
    stage.rotation.x  = f.tilt ?? tilt;
    camera.lookAt(0, camCfg.lookY ?? 0, camCfg.lookZ ?? radius * 0.5);
    const shift = offsetX(w, h);
    if (shift) camera.setViewOffset(w, h, -shift * w, 0, w, h);
    else       camera.clearViewOffset();
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ── Item ↔ card mapping (the endless-list trick) ─────────
  const n = items.length;

  function assignItem(card, logical) {
    const itemIndex = mod(logical, n);
    if (card.itemIndex === itemIndex) return;
    card.itemIndex = itemIndex;
    card.logical   = logical;

    const src = getImage(items[itemIndex]);      // a URL, or a Promise of one
    card.mat.map = blankTexture;
    if (!src) return;

    const token = {};
    card.loading = token;
    Promise.resolve(src).then(url => (url ? loadTexture(url) : null)).then(tex => {
      if (!tex || card.loading !== token) return;   // a newer item replaced this one
      card.mat.map = fitCover(tex, cardW / cardH);
      card.mat.needsUpdate = true;
      needsRender = true;
    });
  }

  // ── Interaction: hover + click via raycasting ────────────
  const raycaster = new THREE.Raycaster();
  const pointer   = new THREE.Vector2();
  let hovered = null;
  let downAt  = null;

  function pick(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    // Hidden side cards can't be hovered or clicked
    const pickable = cards.filter(c => sideOpacity > 0.05 || c.mat.userData.uniforms.uActive.value > 0.5);
    const hit = raycaster.intersectObjects(pickable.map(c => c.mesh), false)[0];
    return hit ? cards.find(c => c.mesh === hit.object) : null;
  }

  function onPointerMove(e) {
    const c = pick(e);
    if (c !== hovered) {
      hovered = c;
      canvas.style.cursor = c ? 'pointer' : '';
      onHover(c ? c.itemIndex : null);
    }
  }
  function onPointerDown(e) { downAt = { x: e.clientX, y: e.clientY }; }
  function onPointerUp(e) {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 6) return;                 // it was a drag, not a click
    const c = pick(e);
    if (c) onClick(c.itemIndex, c.logical);
  }
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup',   onPointerUp);
  canvas.addEventListener('pointerleave', () => { hovered = null; canvas.style.cursor = ''; onHover(null); });

  // ── Animation state ──────────────────────────────────────
  let target  = 0;
  let velocity = 0;   // for the spring easing
  let current = 0;
  let lastActive = null;
  let needsRender = true;
  let visible = true;
  let running = true;
  let rafId;
  let last = performance.now();
  const step = (Math.PI * 2) / slotCount;

  function update(dt) {
    // Frame-rate independent easing towards the target index
    const k = 1 - Math.pow(1 - damping, dt * 60);
    const prev = current;
    if (smoothTime > 0) {
      // Critically damped spring: eases in AND out, never overshoots
      const omega  = 2 / smoothTime;
      const x      = omega * dt;
      const decay  = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const change = current - target;
      const temp   = (velocity + omega * change) * dt;
      velocity = (velocity - omega * temp) * decay;
      current  = target + (change + temp) * decay;
      if (Math.abs(target - current) < 1e-4 && Math.abs(velocity) < 1e-4) { current = target; velocity = 0; }
    } else {
      current += (target - current) * k;
      if (Math.abs(target - current) < 1e-4) current = target;
    }

    spin.rotation.y = -current * step;

    let moving = current !== prev;
    for (const card of cards) {
      // Where is this slot relative to the front? (-slotCount/2 … +slotCount/2)
      const rel = mod(card.slot - current + slotCount / 2, slotCount) - slotCount / 2;
      assignItem(card, Math.round(current + rel));

      const facing  = Math.cos(rel * step);                         // 1 = front, -1 = back
      const isFront = Math.max(0, 1 - Math.abs(rel) * fadeSpan);    // 0 → 1 as it reaches the front
      const hoverT  = card === hovered ? 1 : 0;
      card.hover += (hoverT - card.hover) * k;
      if (Math.abs(hoverT - card.hover) > 1e-3) moving = true;

      const u = card.mat.userData.uniforms;
      u.uLight.value  = THREE.MathUtils.clamp(0.25 + 0.75 * facing, 0.12, 1) + card.hover * 0.15;
      u.uActive.value = isFront;

      let s = 1 + isFront * 0.06 + card.hover * 0.03;
      if (motion) s *= applyMotion(card, rel);
      card.node.scale.set(card.base.x * s, card.base.y * s, 1);
    }

    const active = n ? mod(Math.round(current), n) : null;
    if (active !== lastActive) { lastActive = active; onActive(active); }

    return moving;
  }

  // ── Transition flourish ───────────────────────────────────
  // As a card moves off the front (rel → ±1) it swings away, rolls,
  // drifts diagonally and sinks back; an incoming card does the
  // mirror of that and settles flat. All values in `motion`:
  //   swing (rad, turn around its vertical axis) · roll (rad) ·
  //   tip (rad, lean back) · lift (units, diagonal drift) ·
  //   push (units, backwards) · shrink (0–1)
  // Returns an extra scale factor.
  function applyMotion(card, rel) {
    const t    = THREE.MathUtils.clamp(rel, -1, 1);
    const a    = Math.abs(t);
    const e    = a * a * (3 - 2 * a);           // smoothstep — soft start and finish
    const sign = Math.sign(t);                   // +1 = coming up next, -1 = just left
    const m    = motion;
    card.node.rotation.set(
      card.baseRot.x + (m.tip   ?? 0) * e,
      card.baseRot.y - (m.swing ?? 0) * e * sign,
      card.baseRot.z + (m.roll  ?? 0) * e * sign,
    );
    card.node.position.set(0, -(m.lift ?? 0) * e * sign, -(m.push ?? 0) * e);
    return Math.max(0.001, 1 - (m.shrink ?? 0) * e);   // uniform scale; never exactly 0 (keeps raycasting happy)
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!visible) return;
    const moving = api.tick ? api.tick(dt) : false;   // components can add per-frame logic (auto-spin)
    if (update(dt) || moving || needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  }

  // Pause rendering while the canvas is off-screen
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = performance.now();
  });
  io.observe(canvas);

  resize();
  update(0);
  rafId = requestAnimationFrame(loop);

  // ── Public API ───────────────────────────────────────────
  const api = {
    setTarget(v)  { target = v; },
    nudge(d)      { target += d; },
    snap()        { target = Math.round(target); },
    get target()  { return target; },
    get current() { return current; },
    get count()   { return n; },
    tick: null,
    goTo(itemIndex) {
      // shortest way round to that item
      const cur = mod(Math.round(target), n);
      let d = itemIndex - cur;
      if (d >  n / 2) d -= n;
      if (d < -n / 2) d += n;
      target = Math.round(target) + d;
    },
    render() { needsRender = true; },
    dispose() {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect(); io.disconnect();
      renderer.dispose();
    },
  };
  return api;
}

// Quick capability check used by components to decide on the fallback layout.
// "Reduce motion" does NOT switch the 3D off (Windows reports it whenever
// animation effects are turned off) — components just drop auto-spin and
// ease faster instead. See prefersReducedMotion().
export function canUse3D() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
