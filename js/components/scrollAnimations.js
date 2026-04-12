// ============================================================
//  SCROLL ANIMATIONS — Lenis smooth scroll + reveal on scroll
//
//  Lenis (https://lenis.darkroom.engineering) is loaded as a
//  CDN script in each HTML page. It replaces the browser's
//  built-in scroll with a buttery, physics-based version —
//  the same technique used by Webflow and award-winning sites.
//
//  HOW TO USE:
//  Add data-animate to any HTML element you want to animate.
//
//  data-animate="fade-up"     → fades in from below (default)
//  data-animate="fade-left"   → slides in from the left
//  data-animate="fade-right"  → slides in from the right
//  data-animate="fade"        → fades in, no movement
//  data-animate="stagger"     → staggers direct children in sequence
//  data-animate="scale"       → scales up from slightly smaller
//
//  Optional: add a delay
//  data-delay="200"           → waits 200ms before animating
//
//  Example:
//  <section data-animate="fade-up" data-delay="100">
//
// ============================================================

export function initScrollAnimations() {

  // ── Lenis smooth scroll ───────────────────────────────────
  // Lenis is loaded via CDN <script> tag in each HTML page.
  // It intercepts scroll events and replaces the default with
  // a smooth, spring-physics version. window.scrollY still
  // works normally so all other scroll code is unaffected.

  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration:           1.25,   // scroll animation duration in seconds
      easing:             t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:        'vertical',
      gestureOrientation: 'vertical',
      smoothWheel:        true,
      wheelMultiplier:    1.0,
      touchMultiplier:    2.0,
    });

    // Wire into rAF — Lenis needs to tick every frame
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ── Reveal observer ───────────────────────────────────────
  // Watches elements and adds 'is-visible' when they enter viewport

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0);

      setTimeout(() => {
        el.classList.add('is-visible');

        // Stagger: animate direct children sequentially
        if (el.dataset.animate === 'stagger') {
          [...el.children].forEach((child, i) => {
            child.style.transitionDelay = `${i * 80}ms`;
            child.classList.add('is-visible');
          });
        }
      }, delay);

      // Stop observing once revealed (one-shot)
      observer.unobserve(el);
    });
  }, {
    threshold: 0.12,       // trigger when 12% of element is visible
    rootMargin: '0px 0px -40px 0px', // start slightly before element reaches viewport
  });

  // Observe all animated elements
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });

  // ── Hero parallax on scroll ───────────────────────────────
  // Hero content drifts upward and fades as user scrolls down.
  // This creates the cinematic "pull into the scene" feeling.

  const heroContent = document.querySelector('.hero__content');
  const heroCanvas  = document.getElementById('hero-canvas');

  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const vh      = window.innerHeight;

      // Only apply while hero is in view
      if (scrollY < vh) {
        const progress = scrollY / vh; // 0 at top, 1 when hero is gone

        // Content drifts up and fades
        heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
        heroContent.style.opacity   = Math.max(0, 1 - progress * 2);

        // Canvas drifts slightly slower (parallax depth)
        if (heroCanvas) {
          heroCanvas.style.transform = `translateY(${scrollY * 0.1}px)`;
        }
      }
    }, { passive: true }); // passive: true = browser can scroll without waiting for JS
  }
}
