// ============================================================
//  PROJECT WHEEL — featured projects on a scroll-driven 3D ring
//
//  The section is tall (one "stop" per project) with a sticky
//  inner stage. As you scroll through it, the Blender carousel
//  rig turns side to side on the left (16:9 cards, Figma frame
//  style), and the text block on the right cross-fades to the
//  project that's at the front.
//
//  Data:   data/projects.js  (featured: true) + YouTube Shorts from
//          data/social.json — see js/components/shorts.js
//  Tuning: js/config.js → CAROUSEL.wheel
//  Markup: index.html  → <section class="orbit" id="work">
//
//  Without WebGL the section falls back to a plain list of cards
//  (.orbit--static). With "reduce motion" on, the wheel still shows
//  but eases faster.
// ============================================================

import { PROJECTS } from '../../data/projects.js';
import { CAROUSEL } from '../config.js';
import { createRingCarousel, canUse3D, prefersReducedMotion } from '../three/ringCarousel.js';
import { loadShorts, buildWork, pillarbox, openShort, escapeHtml } from './shorts.js';

const pad = n => String(n + 1).padStart(2, '0');

// Card width in world units along the ring (8 cards, radius ≈ 3.4)
const CARD_W = 2.5;

// Space the resting card keeps from the canvas edges (matches the CSS:
// title margin on desktop, 20px each side on phones)
const pageMargin = () => window.innerWidth > 900
  ? { left: Math.max(140, window.innerWidth * 0.05), right: 48 }   // left = --edge (clears the side bars); right = the faded 3rem gap
  : { left: 20, right: 20 };

export async function initProjectWheel(selector = '#work') {
  const section = document.querySelector(selector);
  if (!section) return;

  // Featured projects, then recent Shorts that aren't linked to a project
  const list     = buildWork(PROJECTS.filter(p => p.featured), await loadShorts(), PROJECTS);
  const cfg      = CAROUSEL.wheel;
  const card     = CAROUSEL.cardDesktop;     // 16:9, thick yellow frame (Figma carousel)
  // Plain glide instead of the flourish only if the config asks to honour
  // the OS "reduce motion" setting (Windows turns it on whenever
  // animation effects are off, so it's opt-in here).
  const calm     = cfg.motion.respectReducedMotion && prefersReducedMotion();
  const listEl   = section.querySelector('.orbit__list');
  const canvas   = section.querySelector('.orbit__canvas');
  const counter  = section.querySelector('.orbit__count');

  // ── Title list (replaces the static SEO markup) ──────────
  // Projects link to their page; Short-only items open the player.
  const href = p => p.isShort ? p.shortItems[0].url : `project.html?slug=${p.slug}`;
  listEl.innerHTML = list.map((p, i) => `
    <li class="orbit__item${p.isShort ? ' orbit__item--short' : ''}" data-index="${i}">
      <a class="orbit__link" href="${href(p)}"${p.isShort ? ' target="_blank" rel="noopener"' : ''}>
        <img class="orbit__thumb" src="${p.thumbnail ?? ''}" alt="" loading="lazy" />
        <span class="orbit__num">${pad(i)}</span>
        <h3 class="orbit__title">${escapeHtml(p.title)}</h3>
        <p class="orbit__desc">${escapeHtml(p.description)}</p>
        <span class="orbit__chips">
          ${p.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
        </span>
      </a>
      ${p.shortItems.length ? `
        <button class="orbit__short" type="button" data-index="${i}">
          <img src="${p.shortItems[0].thumb}" alt="" loading="lazy" />
          <span>▶ Watch the Short</span>
        </button>` : ''}
    </li>`).join('');

  // Short buttons + Short-only links open the portrait player
  listEl.querySelectorAll('.orbit__short').forEach(btn =>
    btn.addEventListener('click', () => openShort(list[+btn.dataset.index].shortItems[0])));
  listEl.querySelectorAll('.orbit__item--short .orbit__link').forEach((a, k) =>
    a.addEventListener('click', e => {
      e.preventDefault();
      openShort(list[+a.closest('.orbit__item').dataset.index].shortItems[0]);
    }));

  const items = [...listEl.querySelectorAll('.orbit__item')];

  if (!canUse3D() || !list.length) {
    section.classList.add('orbit--static');
    return;
  }

  // Desktop: the 3D area starts just below the "Selected Works" title and
  // stops above the bottom padding, so the card never rides up under the
  // title on tall screens. (Phones use the CSS layout.)
  const sticky = section.querySelector('.orbit__sticky');
  const header = section.querySelector('.orbit__header');
  function placeCanvas() {
    if (window.innerWidth <= 900) { canvas.style.top = ''; canvas.style.height = ''; return; }
    const top = header.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top + 24;
    canvas.style.top    = `${Math.round(top)}px`;
    canvas.style.height = `calc(100% - ${Math.round(top + 40)}px)`;
  }
  placeCanvas();
  window.addEventListener('resize', placeCanvas);
  document.fonts?.ready.then(placeCanvas);   // title height changes once Karantina loads

  // Tall section: one screen for the intro + scrollPerCard screens per project
  section.style.setProperty('--orbit-stops', list.length);
  section.style.setProperty('--orbit-per-card', cfg.scrollPerCard);

  let ring;
  try {
    ring = await createRingCarousel(canvas, {
      modelPath:  CAROUSEL.modelPath,
      background: CAROUSEL.background,
      items:      list,
      // Short-only items: portrait thumbnail on a blurred 16:9 backdrop
      getImage:   p => (p.isShort ? pillarbox(p.thumbnail) : p.thumbnail),
      orient:     'horizontal',
      cardAspect: card.aspect,
      cardStyle:  card,
      tangentSize: CARD_W,
      tilt:       0,                // straight-on front view
      sideOpacity: 0,               // only the front card shows; others fade out
      fadeSpan:   cfg.motion.fadeSpan,
      smoothTime: calm ? 0.08 : cfg.motion.smoothTime,
      motion:     calm ? null : cfg.motion,
      fog:        cfg.fog,
      damping:    calm ? 0.35 : cfg.damping,
      camera:     { fov: 36, height: 0, lookY: 0, lookZ: 3.4 },
      // The canvas runs to the screen edge (so leaving cards glide off it);
      // shift the view so the resting card sits inside the page margins.
      offsetX:    w => pageMargin().left / (2 * w) - pageMargin().right / (2 * w),
      // Size the camera so the front card fills most of the space between
      // the margins: ~cardFill of its width, never more than ~86% of its height.
      frame:      (w, h) => {
        const m    = pageMargin();
        const tanV = Math.tan((36 / 2) * Math.PI / 180);
        const tanH = tanV * ((w - m.left - m.right) / h);
        const cardH = CARD_W / card.aspect;
        const fillW = cfg.cardFill ?? 0.92;
        return { distance: 3.4 + Math.max((CARD_W / 2) / fillW / tanH, (cardH / 2) / 0.86 / tanV) };
      },
      onActive:   i => {
        items.forEach((el, j) => el.classList.toggle('is-active', j === i));
        if (counter) counter.textContent = `${pad(i)} / ${pad(list.length - 1)}`;
      },
      onClick:    i => {
        if (list[i].isShort) openShort(list[i].shortItems[0]);
        else window.location.href = `project.html?slug=${list[i].slug}`;
      },
    });
  } catch (err) {
    console.warn('[projectWheel] 3D failed, using static list:', err);
    section.classList.add('orbit--static');
    return;
  }

  section.classList.add('orbit--live');

  // ── Scroll → wheel index ─────────────────────────────────
  // Progress through the tall section (0 at its top, 1 when its
  // bottom reaches the bottom of the screen) maps to 0 … n-1.
  function readScroll() {
    const r     = section.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    const p     = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
    // Snap to whole cards: each project eases fully to the front view
    ring.setTarget(Math.round(p * (list.length - 1)));
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);
  readScroll();

  // ── Text block ───────────────────────────────────────────
  // Only the front project's text shows; .is-active (set in
  // onActive above) cross-fades the blocks — see .orbit__item in
  // css/pages/home.css.
}
