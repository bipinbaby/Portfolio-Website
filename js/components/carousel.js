// ============================================================
//  CAROUSEL — two modes
//
//  1. initCarousel(selector)
//     Manual snap carousel: scroll-snap, dots, arrow buttons.
//     Good for small sets where you want explicit navigation.
//
//  2. makeCarouselInfinite(selector, pxPerSec?)
//     Seamless auto-scrolling ribbon.
//     Technique: clones all cards and appends them, then runs a
//     CSS translateX animation from 0 → -50% (exactly one copy's
//     width). At -50% the visuals are identical to 0, so the
//     loop is completely seamless. Hover/focus pauses it.
//     Clicking a clone delegates to the original card so modals
//     and links still work.
//
// ============================================================

// ── Manual snap carousel ──────────────────────────────────

export function initCarousel(selector) {
  const root = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!root) return;

  const track   = root.querySelector('.carousel__track');
  const dotsEl  = root.querySelector('.carousel__dots');
  const prevBtn = root.querySelector('.carousel__btn--prev');
  const nextBtn = root.querySelector('.carousel__btn--next');

  if (!track) return;

  // Filter out clones so dots only count real cards
  const cards = () => [...track.children].filter(c => !c.dataset.clone);

  function activeIndex() {
    const cx = track.getBoundingClientRect().left + track.getBoundingClientRect().width / 2;
    let best = 0, bestDist = Infinity;
    cards().forEach((card, i) => {
      const r    = card.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - cx);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  function scrollTo(index) {
    const list = cards();
    if (!list[index]) return;
    list[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function scrollByOne(dir) {
    const list = cards();
    if (!list.length) return;
    scrollTo(Math.max(0, Math.min(list.length - 1, activeIndex() + dir)));
  }

  function buildDots() {
    if (!dotsEl) return;
    const list = cards();
    if (!list.length) { dotsEl.innerHTML = ''; return; }
    dotsEl.innerHTML = list.map((_, i) =>
      `<button class="carousel__dot${i === 0 ? ' active' : ''}"
               data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');
    dotsEl.querySelectorAll('.carousel__dot').forEach(dot => {
      dot.addEventListener('click', () => scrollTo(+dot.dataset.index));
    });
  }

  function syncDots() {
    if (!dotsEl) return;
    const idx = activeIndex();
    dotsEl.querySelectorAll('.carousel__dot').forEach((dot, i) =>
      dot.classList.toggle('active', i === idx));
  }

  prevBtn?.addEventListener('click', () => scrollByOne(-1));
  nextBtn?.addEventListener('click', () => scrollByOne(+1));

  let rafId;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(syncDots);
  }, { passive: true });

  // Rebuild dots when async content arrives (social feed skeletons → real cards)
  const observer = new MutationObserver(() => { buildDots(); syncDots(); });
  observer.observe(track, { childList: true });

  buildDots();
}

// ── Infinite auto-scroll ribbon ───────────────────────────

export function makeCarouselInfinite(selector, pxPerSec = 65) {
  const root = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!root) return;

  const track = root.querySelector('.carousel__track');
  if (!track) return;

  let mutationObserver;

  function setup() {
    // Pause observation during DOM manipulation to avoid re-entry
    mutationObserver?.disconnect();

    // Remove infinite class now so the animation restarts cleanly
    // once we re-apply it after measuring the new card set
    root.classList.remove('carousel--infinite');

    // Remove any previous clones
    track.querySelectorAll('[data-clone]').forEach(el => el.remove());

    // Only real, non-skeleton cards
    const originals = [...track.children].filter(
      el => !el.dataset.clone && !el.classList.contains('feed-skeleton')
    );
    if (originals.length < 1) {
      // No real content yet — resume watching
      mutationObserver?.observe(track, { childList: true });
      return;
    }

    // If there are very few cards, triple them so the ribbon
    // looks full and the loop isn't too tight
    const copies = originals.length < 4 ? 3 : 2;
    for (let c = 0; c < copies - 1; c++) {
      originals.forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = 'true';
        clone.setAttribute('aria-hidden', 'true');
        // Clicks on clones fire the original's click handler
        // so modals, links, and video-hover all keep working
        clone.addEventListener('click', e => {
          e.preventDefault();
          originals[index].click();
        });
        track.appendChild(clone);
      });
    }

    // Measure original content width after a layout tick
    requestAnimationFrame(() => {
      const gap       = parseFloat(getComputedStyle(track).columnGap ||
                                   getComputedStyle(track).gap) || 20;
      const origWidth = originals.reduce((w, el) => w + el.offsetWidth + gap, 0);
      const totalCopies = copies; // originals + (copies-1) clones
      const loopFraction = (1 / totalCopies) * 100; // % to translate per one copy

      // Minimum 18 s so a tiny set of cards doesn't blur past
      const duration = Math.max(18, origWidth / pxPerSec);

      root.style.setProperty('--carousel-duration',  `${duration}s`);
      root.style.setProperty('--carousel-loop-pct',  `-${loopFraction.toFixed(4)}%`);
      root.classList.add('carousel--infinite');

      // Resume observer now that setup is done
      mutationObserver?.observe(track, { childList: true });
    });
  }

  // Watch for async content (feed skeletons → real cards)
  mutationObserver = new MutationObserver(() => {
    const hasReal = [...track.children].some(
      el => !el.dataset.clone && !el.classList.contains('feed-skeleton')
    );
    if (hasReal) setup();
  });

  // Run now if cards already exist, otherwise wait for observer
  const hasCards = [...track.children].some(
    el => !el.classList.contains('feed-skeleton')
  );
  if (hasCards) {
    setup();
  } else {
    mutationObserver.observe(track, { childList: true });
  }
}
