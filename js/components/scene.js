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

// Poke a creature's eye: the pupil turns into an ✕ for a moment
const POKE = {
  hurtFor: 1500,        // ms before it recovers
  reach: 16,            // px around the eye that still counts as a poke
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
  measureFixedGap();

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
  const eyes = [], pokeable = [];
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
    pokeable.push(wraps);
  });
  followCursor(eyes);
  pokeEyes(pokeable);

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

// Poke an eye: the creature sits behind the page, so clicks never reach
// it directly. Instead any click near an eye (that isn't on a link,
// button or form field) counts: the pupil becomes an ✕, the eye winces,
// then it recovers. `groups` = one array of stacked copies per eye.
function pokeEyes(groups) {
  const NS = 'http://www.w3.org/2000/svg';
  const eyes = groups.map(wraps => {
    wraps.forEach(g => {
      // The ✕ lives inside the eye's wrapper, so it follows the cursor too
      const b = g.getBBox();
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2, r = Math.max(b.width, b.height) / 2;
      const x = document.createElementNS(NS, 'path');
      x.setAttribute('class', 'eye-x');
      x.setAttribute('d', `M${cx - r} ${cy - r}L${cx + r} ${cy + r}M${cx + r} ${cy - r}L${cx - r} ${cy + r}`);
      x.setAttribute('stroke', 'black');
      x.setAttribute('stroke-width', (r * 0.6).toFixed(2));
      x.setAttribute('stroke-linecap', 'round');
      g.appendChild(x);
    });
    return { wraps, timer: null };
  });

  const hit = (x, y) => eyes.find(({ wraps }) => {
    const r = wraps[0].getBoundingClientRect();
    return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) <= r.width / 2 + POKE.reach;
  });

  // Pointer cursor when hovering an eye
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    document.documentElement.classList.toggle('eye-hover', !!hit(e.clientX, e.clientY));
  }, { passive: true });

  document.addEventListener('click', e => {
    if (e.target.closest?.('a, button, input, textarea, select, label, .nav, .face__eye')) return;
    const eye = hit(e.clientX, e.clientY);
    if (!eye) return;
    clearTimeout(eye.timer);
    eye.wraps.forEach(g => {
      g.classList.add('is-hurt');
      g.animate([
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.3, 0.7) rotate(-12deg)', offset: 0.2 },
        { transform: 'scale(0.9, 1.12) rotate(9deg)',  offset: 0.45 },
        { transform: 'scale(1.04, 0.96) rotate(-4deg)', offset: 0.7 },
        { transform: 'scale(1) rotate(0deg)' },
      ], { duration: 520, easing: 'ease-out' });
    });
    eye.timer = setTimeout(() => eye.wraps.forEach(g => g.classList.remove('is-hurt')), POKE.hurtFor);
  });
}

// Phones: Safari (iOS 26) can place bottom: 0 above its floating
// toolbar while the page itself runs down behind it, leaving a gap under
// the creature. Measure it: a fixed probe from top to bottom vs the
// window height. The difference goes into --fixed-gap (0 elsewhere).
// Add ?debug to the address to see the numbers on the phone.
function measureFixedGap() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;bottom:0;left:0;width:1px;visibility:hidden;pointer-events:none;' +
                        'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);box-sizing:border-box';
  document.body.appendChild(probe);
  const debug = /[?&]debug/.test(location.search) && document.createElement('pre');
  if (debug) {
    debug.style.cssText = 'position:fixed;left:8px;top:120px;z-index:999;margin:0;padding:8px;' +
                          'background:rgba(0,0,0,.8);color:#0f0;font:11px/1.35 monospace;pointer-events:none;white-space:pre';
    document.body.appendChild(debug);
  }
  const vh = unit => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;height:100${unit};width:1px;visibility:hidden`;
    document.body.appendChild(d);
    const h = d.getBoundingClientRect().height;
    d.remove();
    return Math.round(h);
  };
  let lastGap = -1;
  const update = () => {
    const fixedH = probe.getBoundingClientRect().height;
    const cs = getComputedStyle(probe);
    const gap = Math.max(0, Math.round(window.innerHeight - fixedH));
    if (gap !== lastGap) document.documentElement.style.setProperty('--fixed-gap', `${gap}px`);
    lastGap = gap;
    if (debug) {
      const sc = document.querySelector('.scene')?.getBoundingClientRect();
      debug.textContent = [
        `innerHeight   ${window.innerHeight}`,
        `fixed top→bot ${Math.round(fixedH)}`,
        `clientHeight  ${document.documentElement.clientHeight}`,
        `visualVP      ${Math.round(visualViewport?.height ?? 0)} (top ${Math.round(visualViewport?.offsetTop ?? 0)})`,
        `screen        ${screen.width}x${screen.height}`,
        `safe top/bot  ${cs.paddingTop} / ${cs.paddingBottom}`,
        `svh/lvh/dvh   ${vh('svh')} / ${vh('lvh')} / ${vh('dvh')}`,
        `--fixed-gap   ${gap}px`,
        `scene bottom  ${sc ? Math.round(sc.bottom) : '-'}`,
        `scrollY       ${Math.round(window.scrollY)}`,
      ].join('\n');
    }
  };
  update();
  setTimeout(update, 1500);             // again once the creature has loaded
  window.addEventListener('resize', update);
  visualViewport?.addEventListener('resize', update);
  window.addEventListener('scroll', update, { passive: true });
}
