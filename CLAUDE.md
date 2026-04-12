# Portfolio — Claude Working Notes

## About Bipin
- No prior web dev experience (HTML/CSS/JS all new)
- Makes all design decisions himself — Claude advises, doesn't decide
- Wants to be able to edit files manually; keep code modular and well-documented

## Project Goal
Personal portfolio targeting employers/clients in the creative technology space.

## Stack
- HTML / CSS / JS (vanilla)
- Three.js for interactive 3D hero
- Hosted on GitHub Pages or Vercel (free)

## File Map
| File | Purpose |
|---|---|
| `js/config.js` | Central control panel — site name, email, socials, particle/glass/light settings |
| `data/projects.js` | All project entries — add/remove/edit here |
| `css/variables.css` | Design tokens — colors, fonts, spacing |
| `about.html` | Bio text and skills list |
| `contact.html` | Email and availability |
| `assets/models/hero.glb` | Custom 3D model for hero (Bipin to provide) |
| `assets/images/projects/` | Project thumbnails |
| `assets/images/about/` | Portrait photo (Bipin to provide) |
| `assets/videos/projects/` | Local `.mp4` files for project demos |

## Design Language
- **Aesthetic:** Frosted glass / iOS 26 Liquid Glass — cinematic, cold, foggy (Iceland/Scottish highlands)
- **Colors:** Deep cold navy/slate backgrounds, muted icy blues, low-opacity glass panels
- **Typography:** Syne (headings) + Outfit (body) — Google Fonts
- **Hero:** Three.js particle field + custom `.glb` object with frosted glass `MeshPhysicalMaterial`
- **Philosophy:** Modular, well-commented, easy for Bipin to edit without Claude

## Pages
- `index.html` — Scrollable home: hero → featured projects → live social feed → about teaser
- `projects.html` — Full project grid with video modal
- `about.html` — Name + photo (placeholder until Bipin adds portrait)
- `contact.html` — Email + social handles

## Social Links (in config.js)
| Platform | URL | Content |
|---|---|---|
| ArtStation | https://bipinbabyvarghese.artstation.com/ | 3D art |
| LinkedIn | https://www.linkedin.com/in/bipin-baby-7436a7196/ | Professional |
| Instagram @madebybipin | https://www.instagram.com/madebybipin | Creative tech |
| Instagram @by_a_baby | https://www.instagram.com/by_a_baby | Photography |
| Behance | https://www.behance.net/bipinbabyvarghese | Graphic design |

## Content Pillars
1. Creative Technology (Python, Unreal Engine, TouchDesigner, interactive systems, digital twins)
2. 3D Art & Graphic Design
3. Photography

## What's Done
- [2026-04-12] Full site scaffolded: 4 HTML pages, CSS system, Three.js hero, project grid, nav/footer
- [2026-04-12] `config.js` control panel + `data/projects.js` data layer
- [2026-04-12] iOS 26 Liquid Glass CSS (prismatic borders, backdrop saturate, multi-layer specular)
- [2026-04-12] Homepage restructured: hero → featured projects → social feed → about teaser
- [2026-04-12] Social feed component (ArtStation + Behance via RSS/CORS proxy; Instagram fallback with setup guide)
- [2026-04-12] README with editing instructions

## Pending (Bipin's to-do)
- [ ] Add portrait photo → `assets/images/about/portrait.jpg`
- [ ] Export and drop in custom `.glb` hero model → `assets/models/hero.glb`
- [ ] Add project thumbnails → `assets/images/projects/`
- [ ] Add project video files → `assets/videos/projects/`
- [ ] Update real email address in `config.js` / `contact.html`
- [ ] Push to GitHub and deploy to Vercel or GitHub Pages

## Session Log
- **Session 1 [2026-04-12]:** Vision locked in. Stack, hosting, design direction decided. Full site built.
- **Session 2 [2026-04-12]:** iOS 26 Liquid Glass CSS, homepage scroll restructure, social feed component.
- **Session 3 [2026-04-12]:** CLAUDE.md created for continuity across sessions.
- **Session 4 [2026-04-12]:** Lenis smooth scroll added to all 4 pages (Webflow-style buttery scroll). Name locked to one line (white-space: nowrap). Hero desc + about teaser updated from CV. Contact email fixed. Frosted glass shader upgraded: clearcoat layer, specular, sharper env map with sky sphere geometry, roughness tuned to 0.18.
- **Session 5 [2026-04-12]:** Hero centered (text + CTA). Section order changed: Hero → About → Latest Posts → Featured Projects. README updated with full structured update + deploy workflow (first-time GitHub setup, Vercel, GitHub Pages, common edits table).
- **Session 6 [2026-04-12]:** Canvas moved to position:fixed (z-index:-1) — 3D mesh + particles now persist as background while scrolling all sections. Body background set transparent so canvas shows through. Scroll wheel velocity drives mesh Y rotation + X tilt (with inertia damping). Particle field drifts upward on fast scroll. Fixed black appearance: reverted sky-sphere env map to point-lights approach + added bright emissive dome + boosted scene lights.
- **Session 7 [2026-04-12]:** particles.js fully rewritten — hyperspace warp streaks on scroll (radial LineSegments, opacity+length scale with wheel velocity), per-star twinkle (independent sine phase+frequency, power-curve, color variation warm/cold). Canvas z-index fixed to 0 (sections at z-index:1). Removed hero fog gradient (was causing black seam). Star count 4k→5k, spread 18→28. Footer + sections explicitly positioned above canvas.
- **Session 8 [2026-04-13]:** Scroll speed dialled down (multiplier 0.0012→0.00022, MAX 0.06→0.018, decay 0.92→0.87). Warp streak speed reduced. carousel.js created — CSS scroll-snap, centre-snap padding trick, dot indicators with MutationObserver for async feed, arrow buttons. Featured projects + social feed both converted to carousel on homepage. Grid CSS overrides removed. Cards 360px (featured) and 270px (feed).
- **Session 9 [2026-04-13]:** All homepage sections centred. Section order: Hero → Latest Posts → Featured Projects → About. .home-section-header utility class (flex column, align-items:center). Feed tabs centred. About teaser redesigned: centred bio paragraph + two glass cards side by side (currently seeking + background), both centred with text-align:center.
- **Session 10 [2026-04-13]:** Section order changed to Hero → Featured Projects → About → Latest Posts (user confirmed). Both carousels converted to infinite auto-scroll ribbons (makeCarouselInfinite). carousel.js: clones cards 2× or 3×, CSS translateX(0 → --carousel-loop-pct) animation, hover/focus pauses, MutationObserver for async feed, class removed + re-added on re-setup for clean animation restart. components.css: .carousel--infinite block (overflow:hidden, @keyframes carousel-scroll, pause on hover, hides buttons/dots). socialFeed.js: proxy fallback chain (allorigins.win → corsproxy.io), AbortSignal.timeout(8s), improved image extraction with getElementsByTagNameNS for media: namespace + content:encoded fallback.
