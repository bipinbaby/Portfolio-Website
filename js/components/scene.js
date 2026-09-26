// ============================================================
//  SCENE — each page's creature in the lower-right corner
//  (Figma desktop frames "landing", "about", "project",
//  "contact" + their phone frames). Fixed to the screen, so the
//  page scrolls over it. The creature's black eye blinks.
//
//  Art:     assets/shapes/scene-<name>.svg — the Figma group,
//           exported as SVG with the frame background removed.
//  Place:   SCENES below, in Figma pixels:
//             r, b   → gap from the right / bottom of the 1440-wide frame
//                      (negative = hangs off the edge)
//             ms     → size on phones vs desktop (phone art is scaled down)
//             mr, mb → right / bottom gap in the 402-wide phone frame
//  Styles:  .scene in css/components.css
// ============================================================

import { blinkEyes } from './nav.js';
import { initSideBars } from './equalizer.js';

// How far the creatures' eyes glance toward the cursor
const LOOK = {
  range: 0.5,           // × the eye's radius (keeps the pupil on the head)
  maxPx: 5,             // never more than this (in Figma px)
  reach: 300,           // cursor distance (screen px) for a full glance
};

const SCENES = {
  home:     { r: 0, b: 0,  ms: 1,     mr: 3,  mb: -155 },   // the long-necked one
  about:    { r: 0, b: 13, ms: 0.672, mr: -95, mb: 0 },     // the rabbit
  projects: { r: 0, b: 0,  ms: 0.757, mr: 0,  mb: -32 },    // the fox
  contact:  { r: 0, b: 5,  ms: 0.761, mr: -6, mb: -38 },    // the lizard
};

/**
 * @param {string} name       key in SCENES (also the svg file name)
 * @param {object} [opts]
 * @param {string} [opts.awayWhile]  selector: on phones, the scene hides
 *                                   while this element is on screen
 */
export async function initScene(name, { awayWhile } = {}) {
  const cfg = SCENES[name];
  if (!cfg) return;

  // Side bars (desktop) — the equaliser, same on every page
  initSideBars();

  let svgText;
  try {
    const res = await fetch(`assets/shapes/scene-${name}.svg`);
    if (!res.ok) return;
    svgText = await res.text();
  } catch { return; }

  const el = document.createElement('div');
  el.className = `scene scene--${name}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = svgText;                 // inline, so the eye can be animated
  const svg = el.querySelector('svg');
  if (!svg) return;

  const [, , w, h] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  for (const [k, v] of Object.entries({ w, h, ...cfg })) el.style.setProperty(`--${k}`, v);
  document.body.prepend(el);

  // The eye: black circles. Figma sometimes has a copy stacked on the
  // same spot, so circles at the same place blink together.
  const eyes = [];
  const byPlace = new Map();
  svg.querySelectorAll('circle[fill="black"], ellipse[fill="black"]').forEach(c => {
    const key = `${c.getAttribute('cx')},${c.getAttribute('cy')}`;
    byPlace.set(key, [...(byPlace.get(key) || []), c]);
  });
  // Each eye is wrapped in its own <g> and the wrapper blinks: some
  // eyes carry a transform (rotate / matrix) from Figma, and changing
  // their own transform-origin would knock them out of place.
  byPlace.forEach(group => {
    const wraps = group.map(c => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      c.replaceWith(g);
      g.appendChild(c);
      g.style.transformBox = 'fill-box';
      g.style.transformOrigin = '50% 50%';
      return g;
    });
    blinkEyes(wraps);
    eyes.push(...wraps);
  });
  followCursor(eyes);

  // Phones: step aside while e.g. the home hero is on screen
  const away = awayWhile && document.querySelector(awayWhile);
  if (away) {
    const phone = window.matchMedia('(max-width: 899px)');
    let heroOn = true;
    const update = () => el.classList.toggle('is-away', phone.matches && heroOn);
    new IntersectionObserver(([e]) => { heroOn = e.intersectionRatio > 0.35; update(); },
                             { threshold: [0, 0.35, 1] }).observe(away);
    phone.addEventListener('change', update);
    update();
  }
}

// Eyes glance toward the cursor (mouse / pen only — touch has no cursor).
// Uses the `translate` property, so it layers with the blink's `scale`.
function followCursor(eyes) {
  if (!eyes.length) return;
  const range = eyes.map(g => {
    const c = g.firstElementChild;
    const r = Number(c.getAttribute('r') || c.getAttribute('rx') || 6);
    g.style.transition = 'translate 140ms linear';
    return Math.min(LOOK.maxPx, r * LOOK.range);
  });
  let raf = null;
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      eyes.forEach((g, i) => {
        const box = g.getBoundingClientRect();
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height / 2);
        const d  = Math.hypot(dx, dy) || 1;
        const k  = Math.min(1, d / LOOK.reach) * range[i];
        g.style.translate = `${((dx / d) * k).toFixed(2)}px ${((dy / d) * k).toFixed(2)}px`;
      });
    });
  }, { passive: true });
}
