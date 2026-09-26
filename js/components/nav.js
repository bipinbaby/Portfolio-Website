// ============================================================
//  NAV COMPONENT
//  Injects the nav into every page automatically.
//  To add a new nav link, add an entry to the `links` array.
// ============================================================

import { SITE, SOCIALS } from '../config.js';

export function initNav() {
  const navEl = document.querySelector('.nav');
  if (!navEl) return;

  // Determine the current page to highlight the active link
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  const links = [
    { label: 'Home',     href: 'index.html' },
    { label: 'About',    href: 'about.html' },
    { label: 'Projects', href: 'projects.html' },
    { label: 'Contact',  href: 'contact.html' },
  ];

  // The red pill (Figma) is the menu button. Clicking it stretches the
  // pill sideways into a full nav bar (see .nav-bar in components.css).
  navEl.innerHTML = `
    <div class="nav-bar">
      <div class="nav-inner" id="nav-inner">
        <a href="index.html" class="nav-logo">${SITE.name}</a>
        <ul class="nav-links">
          ${links.map(link => `
            <li><a href="${link.href}" ${currentFile === link.href ? 'class="active"' : ''}>${link.label}</a></li>
          `).join('')}
        </ul>
      </div>
      <button class="nav-pill" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-inner">
        <span></span><span></span>
      </button>
    </div>
  `;

  const pill = navEl.querySelector('.nav-pill');
  const inner = navEl.querySelector('.nav-inner');
  const bar = navEl.querySelector('.nav-bar');

  // ── Breathing (closed pill only) ──────────────────────────
  // A slow pulse every few seconds that says "I'm clickable".
  // Run from JS (not a CSS animation) so it can ease out smoothly
  // when the pill is pressed, instead of snapping mid-breath.
  let breathe = null, breatheTimer = null;
  const startBreathing = () => {
    if (breathe || navEl.classList.contains('is-open')) return;
    breathe = bar.animate([
      { transform: 'scale(1, 1)',       offset: 0 },
      { transform: 'scale(1, 1)',       offset: 0.62 },
      { transform: 'scale(1.08, 1.1)',  offset: 0.74 },   // breathe in
      { transform: 'scale(0.98, 0.97)', offset: 0.86 },   // settle
      { transform: 'scale(1, 1)',       offset: 1 },
    ], { duration: 3600, iterations: Infinity, easing: 'ease-in-out' });
  };
  const stopBreathing = () => {
    clearTimeout(breatheTimer);
    if (!breathe) return;
    const now = getComputedStyle(bar).transform;       // wherever the breath is right now
    breathe.cancel();
    breathe = null;
    if (now && now !== 'none') {
      bar.animate([{ transform: now }, { transform: 'none' }],
                  { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }
  };

  const setOpen = open => {
    if (open) stopBreathing();
    else { clearTimeout(breatheTimer); breatheTimer = setTimeout(startBreathing, 700); }   // after the bar has shrunk back
    navEl.classList.toggle('is-open', open);
    pill.setAttribute('aria-expanded', String(open));
    pill.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    inner.inert = !open;           // closed links can't be tabbed to
    document.body.classList.toggle('nav-open', open);   // the face tucks away while the menu is open
  };
  setOpen(false);
  startBreathing();
  pill.addEventListener('click', () => setOpen(!navEl.classList.contains('is-open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  // Click anywhere outside the bar closes it
  document.addEventListener('pointerdown', e => {
    if (navEl.classList.contains('is-open') && !navEl.contains(e.target)) setOpen(false);
  });

  // Squish on press: the pill eases down under your finger / cursor and
  // springs back with a soft overshoot when you let go. Uses the `scale`
  // property, so it layers with the breathing (`transform`). Every step
  // starts from wherever the pill currently is, so nothing jumps.
  let squish = null;
  const currentScale = () => {
    const v = getComputedStyle(bar).scale;
    return v && v !== 'none' ? v : '1';
  };
  pill.addEventListener('pointerdown', () => {
    stopBreathing();
    const from = currentScale();
    squish?.cancel();
    squish = bar.animate([{ scale: from }, { scale: '1.08 0.84' }],
                         { duration: 200, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'forwards' });
  });
  const release = () => {
    if (!squish) return;
    const from = currentScale();
    squish.cancel();
    squish = null;
    bar.animate([
      { scale: from },
      { scale: '0.97 1.05', offset: 0.45 },
      { scale: '1.01 0.99', offset: 0.75 },
      { scale: '1' },
    ], { duration: 620, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  };
  pill.addEventListener('pointerup', release);
  pill.addEventListener('pointercancel', release);
  pill.addEventListener('pointerleave', release);

  // Scrolling away closes the open menu. The pill itself always stays:
  // the face at the top of each section is anchored to it.
  let openedAt = 0;
  pill.addEventListener('click', () => { openedAt = window.scrollY; });
  window.addEventListener('scroll', () => {
    if (navEl.classList.contains('is-open') && Math.abs(window.scrollY - openedAt) > 60) setOpen(false);
  }, { passive: true });
}

// ============================================================
//  THE FACE: yellow bar + two eyes (Figma), fixed to the top
//  edge of the screen on every page, with the red pill under it.
//  It stays put: no section-change animation.
//  The black pupils blink at random, follow the cursor, and
//  watch the red menu pill (see "Where the pupils look").
//
//  Blink timings are in FACE below. Styles: .face in components.css.
// ============================================================

const FACE = {
  blinkMin: 2200,       // ms between blinks (random in this range)
  blinkMax: 6000,
  blinkDuration: 700,   // ms for one blink (close + open) — higher = slower
  doubleBlink: 0.3,     // chance a blink is a double blink
  // Most blinks: both eyes together. Every Nth blink one eye lags
  // behind by a random amount (which eye leads is random too).
  offsetEvery: 3,       // every 3rd blink is staggered (0 = never)
  offsetMin: 250,       // ms the second eye lags on those blinks
  offsetMax: 450,
};

export function initFaces() {
  if (document.querySelector('.face')) return;

  const face = document.createElement('div');
  face.className = 'face is-open';
  face.setAttribute('aria-hidden', 'true');
  const eyeHTML = side => `<span class="face__eye face__eye--${side}"><span class="face__ball"></span><span class="face__pupil"><span class="face__iris"></span></span></span>`;
  face.innerHTML = `<span class="face__bar"></span>${eyeHTML('l')}${eyeHTML('r')}`;
  document.body.appendChild(face);

  // Fade band under the face once the page has scrolled (.face::before)
  const onScroll = () => face.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const irises = [...face.querySelectorAll('.face__iris')];
  const pill   = () => document.querySelector('.nav-bar');   // the red pill

  // Random blinking: the black pupils only
  let blinks = 0;
  function blink() {
    if (face.classList.contains('is-open') && !document.hidden) {
      blinks++;
      const staggered = FACE.offsetEvery > 0 && blinks % FACE.offsetEvery === 0;
      const lag = staggered ? FACE.offsetMin + Math.random() * (FACE.offsetMax - FACE.offsetMin) : 0;
      const order = Math.random() < 0.5 ? irises : [...irises].reverse();
      const once = delay => order.forEach((el, i) => el.animate(
        [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)' }, { transform: 'scaleY(1)' }],
        { duration: FACE.blinkDuration, delay: delay + i * lag, easing: 'ease-in-out' }));
      once(0);
      if (Math.random() < FACE.doubleBlink) once(FACE.blinkDuration + 80);
    }
    setTimeout(blink, FACE.blinkMin + Math.random() * (FACE.blinkMax - FACE.blinkMin));
  }
  setTimeout(blink, 1500);

  // ── Where the pupils look ───────────────────────────────
  // They follow the cursor, but when it gets close to the red pill
  // they lock onto the pill and widen a little ("ooh, a button").
  // Touch screens have no cursor, so there the eyes glance at the
  // pill every few seconds, and whenever it's pressed.
  const pupils = [...face.querySelectorAll('.face__pupil')];
  const pillCentre = () => {
    const r = pill()?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  };
  function lookAt(x, y, widen = 1) {
    pupils.forEach(p => {
      const r  = p.parentElement.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const d  = Math.hypot(dx, dy) || 1;
      const k  = Math.min(1, d / 200) * 12;      // max 12px from centre
      p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px) scale(${widen})`;
    });
  }
  const lookAhead = () => pupils.forEach(p => { p.style.transform = ''; });

  let raf = null;
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const c = pillCentre();
      const near = c && Math.hypot(e.clientX - c.x, e.clientY - c.y) < 140;
      if (near) lookAt(c.x, c.y, 1.25);          // watching the button
      else      lookAt(e.clientX, e.clientY);    // watching you
    });
  }, { passive: true });

  // Touch screens: glance at the pill now and then, and when it's pressed
  const glance = (ms = 1100) => {
    const c = pillCentre();
    if (!c || !face.classList.contains('is-open')) return;
    lookAt(c.x, c.y, 1.25);
    setTimeout(lookAhead, ms);
  };
  if (window.matchMedia('(hover: none)').matches) {
    (function idleGlance() {
      if (!document.hidden && !document.body.classList.contains('nav-open')) glance();
      setTimeout(idleGlance, 5000 + Math.random() * 4000);
    })();
  }
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && e.target.closest?.('.nav-pill')) glance(700);
  });
}

// ============================================================
//  EYES — any element with data-eye (and the creatures' eyes in
//  js/components/scene.js) blinks at random. They don't move.
//  Blink timing is shared with FACE above.
// ============================================================

export function initEyes() {
  document.querySelectorAll('[data-eye]').forEach(eye => {
    eye.style.transformOrigin = '50% 50%';
    blinkEyes([eye]);
  });
}

// Blinks a group of elements together, on its own random rhythm
export function blinkEyes(els) {
  (function blink() {
    if (!document.hidden) {
      const once = delay => els.forEach(el => el.animate(
        [{ scale: '1 1' }, { scale: '1 0.08' }, { scale: '1 1' }],
        { duration: FACE.blinkDuration, delay, easing: 'ease-in-out' }));
      once(0);
      if (Math.random() < FACE.doubleBlink) once(FACE.blinkDuration + 80);
    }
    setTimeout(blink, FACE.blinkMin + Math.random() * (FACE.blinkMax - FACE.blinkMin));
  })();
}

// ============================================================
//  FOOTER COMPONENT
//  Call initFooter() on any page that has a <footer class="footer">
// ============================================================

export function initFooter() {
  const footerEl = document.querySelector('.footer');
  if (!footerEl) return;

  const year = new Date().getFullYear();

  footerEl.innerHTML = `
    <div class="container">
      <div class="footer__inner">
        <nav class="footer__socials">
          ${SOCIALS.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join('')}
        </nav>
        <p class="footer__copy">© ${year} ${SITE.name}</p>
      </div>
    </div>
  `;
}
