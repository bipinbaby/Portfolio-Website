// ============================================================
//  WAVE — the orange line under each section heading (Figma)
//
//  Drawn live as an SVG path and animated by shifting its phase,
//  so it slowly travels sideways. Two sine curves are mixed so it
//  looks hand-drawn rather than perfectly regular.
//
//  Usage: <div class="wave" aria-hidden="true"></div>
//  Size/spacing: .wave in css/components.css
//  Motion: WAVE below.
// ============================================================

const WAVE = {
  color:      '#ff8d28',   // --color-orange
  thickness:  5,           // px
  wavelength: 0.75,        // of the element's width (min 520px)
  amplitude:  0.32,        // of the element's height
  speed:      0.55,        // radians per second (higher = faster travel)
  step:       10,          // px between points (lower = smoother)
};

export function initWaves(selector = '.wave') {
  const waves = [...document.querySelectorAll(selector)].map(el => {
    el.innerHTML = `<svg width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <path fill="none" stroke="${WAVE.color}" stroke-width="${WAVE.thickness}" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    return { el, svg: el.firstElementChild, path: el.querySelector('path'), visible: true };
  });
  if (!waves.length) return;

  // Only animate waves that are on screen
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const w = waves.find(w => w.el === e.target);
    if (w) w.visible = e.isIntersecting;
  }));
  waves.forEach(w => io.observe(w.el));

  function draw(w, t) {
    const W = w.el.clientWidth, H = w.el.clientHeight;
    if (!W || !H) return;
    w.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const k   = (Math.PI * 2) / Math.max(520, W * WAVE.wavelength);
    const A   = (H - WAVE.thickness) * WAVE.amplitude;
    const mid = H / 2;
    const ph  = t * WAVE.speed;
    let d = '';
    for (let x = -WAVE.step; x <= W + WAVE.step; x += WAVE.step) {
      const y = mid
        + A * Math.sin(k * x - ph)                       // main swell
        + A * 0.35 * Math.sin(k * 2.3 * x + ph * 0.6);  // small ripple on top
      d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    w.path.setAttribute('d', d);
  }

  const start = performance.now();
  (function loop(now) {
    const t = (now - start) / 1000;
    for (const w of waves) if (w.visible) draw(w, t);
    requestAnimationFrame(loop);
  })(start);
}
