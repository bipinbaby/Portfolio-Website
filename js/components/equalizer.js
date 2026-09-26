// ============================================================
//  EQUALISER — the three yellow bars down the top-left edge
//  (Figma desktop frames). They hang from the top and bounce
//  like an audio equaliser: each bar jumps up fast and falls
//  back slowly. Scrolling "turns the music up".
//  Desktop only (hidden on phones in CSS). Styles: .side-bars
//  in css/components.css.
// ============================================================

const EQ = {
  // Height range of each bar in px (Figma resting heights: 452, 96, 40)
  bars: [
    { min: 190, max: 452 },
    { min: 40,  max: 300 },
    { min: 30,  max: 190 },
  ],
  beatMin: 110,         // ms between new levels (random in this range)
  beatMax: 320,
  attack: 0.28,         // how fast a bar rises (0–1 per frame)
  release: 0.07,        // how fast it falls back
  idleLevel: 0.5,       // how lively it is when the page is still (0–1)
  scrollBoost: 0.012,   // extra liveliness per px of scroll per frame
};

export function initSideBars() {
  if (document.querySelector('.side-bars')) return;

  const wrap = document.createElement('div');
  wrap.className = 'side-bars';
  wrap.setAttribute('aria-hidden', 'true');
  const bars = EQ.bars.map((range, i) => {
    const el = document.createElement('span');
    el.style.left = `${i * 28}px`;          // Figma: 23 px bars, 5 px gaps
    wrap.appendChild(el);
    return { el, ...range, h: range.max, target: range.max, next: 0 };
  });
  document.body.appendChild(wrap);

  // Scroll energy: jumps with scroll speed, fades out over ~1s
  let energy = 0, lastY = window.scrollY;

  let visible = true;
  const desktop = window.matchMedia('(min-width: 900px)');
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible || !desktop.matches) return;

    const dy = Math.abs(window.scrollY - lastY);
    lastY = window.scrollY;
    energy = Math.min(1, energy * 0.95 + dy * EQ.scrollBoost);
    const level = EQ.idleLevel + (1 - EQ.idleLevel) * energy;

    for (const b of bars) {
      if (t >= b.next) {
        // New level: random, biased higher when the page is scrolling
        const r = Math.pow(Math.random(), 1.4 - level);
        b.target = b.min + (b.max - b.min) * Math.min(1, r * (0.45 + 0.55 * level) + 0.1);
        b.next = t + EQ.beatMin + Math.random() * (EQ.beatMax - EQ.beatMin);
      }
      b.h += (b.target - b.h) * (b.target > b.h ? EQ.attack : EQ.release);
      b.el.style.height = `${b.h.toFixed(1)}px`;
    }
  }
  requestAnimationFrame(frame);
}
