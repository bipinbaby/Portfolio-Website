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

## Design Language  (redesign/orbit branch, from Figma)
- **Source of truth:** Figma "PORTFOLIO" — https://www.figma.com/design/XRj5AKP3PuU4Kkj8sEzpnJ/PORTFOLIO (phone frames 2:2 hero, 5:118 About me, 6:2 Selected Works; 15:50 desktop carousel)
- **Colors:** green #114339 · yellow #FFCC00 · orange #FF8D28 · red #FF383C · white · black (tokens in `css/variables.css`)
- **Fonts:** Karantina (headlines, line-height 0.737) + JetBrains Mono (body 400, labels 800)
- **Motifs:** red pill = menu button (fixed, top centre) · ONE fixed "face" (yellow bar + eyes, red pill as its nose) — sections opt in with data-face / data-face="bottom" (hero); collapses into the pill, pill squash-stretches, re-emerges per section; black pupils blink randomly + follow cursor (nav.js initFaces, FACE timings) · yellow outline frame on hero · yellow creature + orange blobs on About (SVGs in `assets/shapes/`, downloaded from Figma)
- **Carousels:** Blender ring rig (`assets/models/carousel.glb`) rendered by `js/three/ringCarousel.js`; cards get Figma look (thick yellow frame, round corners) via shader. Selected Works = one big 16:9 card, straight-on front view (other cards hidden via sideOpacity 0), ring snaps card-by-card side to side with scroll; text block on the right cross-fades per project. Size via CAROUSEL.wheel.cardFill; slide flourish (spring glide + swing/roll/tip/lift/push/shrink) via CAROUSEL.wheel.motion — off under prefers-reduced-motion.
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

## File Map (updated)
| File | Purpose |
|---|---|
| `project.html` | Single template for all project detail pages — URL: `project.html?slug=your-slug` |
| `js/components/projectDetail.js` | Reads ?slug from URL, finds project in projects.js, renders detail page |
| `css/pages/project.css` | Styles for the project detail page |

## New files (redesign/orbit)
| File | Purpose |
|---|---|
| `js/three/ringCarousel.js` | Shared 3D ring engine for the Blender rig (endless list over 8 cards, framed-card shader) |
| `js/components/projectWheel.js` | Selected Works — scroll-driven vertical wheel + title list |
| `data/shorts.js` | Per-Short overrides keyed by video ID: `title` (typo fixes), `tags` (pills), `category` (Projects filter) |
| `js/components/shorts.js` | YouTube Shorts inside projects: `shorts: [ids]` field links them; unlinked Shorts become Short-only wheel items (pillarboxed 16:9 card); portrait player modal |
| `scripts/sync-social.mjs` + `.github/workflows/sync-social.yml` | Daily YouTube Shorts sync → `data/social.json` + `assets/social/` |
| `js/components/wave.js` | Animated orange wave under each section heading (<div class="wave">); settings in WAVE |
| `assets/shapes/*.svg` | Figma shapes (hero corner, About creature/wave/blobs) |

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
- **Session 11 [2026-04-13]:** Project detail pages added. Single template `project.html` reads `?slug=` from URL and renders full project detail (hero video/image, meta, long description, image gallery, external link). `data/projects.js` extended with `slug`, `year`, `role`, `longDescription[]`, `images[]` fields. `projectGrid.js` updated — card clicks navigate to `project.html?slug=...` instead of opening modal. Modal code preserved as fallback for slug-less projects.
- **Session 12 [2026-09-25]:** Branch `redesign/orbit`. 3D carousels built on the Blender ring rig (Skazy-style scroll wheel for featured projects, Shorts ring for latest posts). Daily YouTube Shorts sync via GitHub Action (same content goes to LinkedIn/Instagram, so YouTube is the single token-free source). Restyled to Bipin's Figma: green/yellow/orange/red, Karantina + JetBrains Mono, red pill menu, face dividers, About creature. Particle hero removed from index. PENDING: YOUTUBE.channelId in config.js; other pages (about/projects/contact/project) only inherit tokens — not yet laid out to Figma; commit + push + Vercel preview.
- **Session 13 [2026-09-26]:** Selected Works = one big 16:9 card, front view, snaps per project with spring glide + swing/roll/tip/lift/push + scale 0→1 (CAROUSEL.wheel.motion; flourish plays even with OS reduce-motion unless respectReducedMotion:true). Red pill expands into nav bar. Latest Posts section REMOVED — Shorts now live in projects (shorts.js): linked via `shorts: [...]` in projects.js ("Watch the Short" button + "Process clips" on project page); up to YOUTUBE.maxAutoShorts unlinked Shorts auto-added as Short-only items. Sync script also fetches linked IDs (oEmbed title).
- **Session 13b [2026-09-26]:** YouTube channel connected (@bipinthebaby1, UCuiD_quHBSP3BjCEiO0qFTg); maxAutoShorts=5 = only the latest 5 posts are auto-added (linked ones show inside their project). Sync now stores each post's text (`description`); shorts.js cleans it (hashtags out, @handles → names) for wheel summaries, the player, and "Process clips" on project pages. New project `ultrasonic-touchdesigner` (Arduino UNO R4 WiFi + HC-SR04 → Serial DAT) with combined cover `assets/images/projects/ultrasonic-td.jpg`, linked to both ultrasonic Shorts. Also linked: robot arm → mediapipe-unreal, Audio Visualiser #1 → td-audio-reactive, Gem Flower → td-simple-reactive. Profile (index + about) now mentions microelectronics (Arduino, ESP32) + new skills card.
- **Session 13c [2026-09-26]:** data/shorts.js overrides (fixed "Conttoller" → "Joystick Controller" site-side). Short pills now come from post hashtags via TAG_NAMES map in shorts.js (fallback "Short-form"). Projects page grid (projectGrid.initProjectGrid, now async) includes the auto Short-only items: pillarboxed thumb, "▶ Short" badge, opens portrait player, filed under creative-tech.
- **Session 13d [2026-09-26]:** Wheel + Projects page sorted newest first (buildWork: `date` field → newest linked Short → year; undated last). Added `date` to projects (exact where known: splat 2026-06-18, three.js 2026-05-25, Short dates; "2026-04" approx for ones on the site by 13 Apr). Desktop wheel canvas now placed below the title by JS (placeCanvas) so the card no longer rides under "Selected Works" on tall screens; right 3rem of canvas is a soft fade (pageMargin.right 48) so incoming cards aren't hard-clipped; fadeSpan 1.1.
- **Session 13e [2026-09-26]:** Face rebuilt as a single fixed creature (see Design Language). Old between-section .face dividers removed. Nav pill no longer auto-hides on scroll (face is anchored to it); menu closes when you scroll away; body.nav-open tucks the face. About/orbit top padding increased to clear the face; phone bio 0.86rem so buttons clear the blob.
- **Session 13f [2026-09-26]:** Bipin preferred the face at the BOTTOM: all homepage sections now data-face="bottom" (collapse -> pill pulse -> re-emerge on the bottom edge). Reverted the extra top padding; Selected Works gets bottom padding (5.5rem desktop / 5rem phone) so its button clears the face. Phone wheel: canvas 18%/24%, text rail 20rem, description clamped to 4 lines.
- **Session 13g [2026-09-26]:** Reverted to face at the TOP for About + Selected Works (hero keeps it at the bottom) — Bipin preferred it after trying bottom. Red pill is now plain when closed (no = lines; the x still shows when the menu is open).
- **Session 13h [2026-09-26]:** Clickable hints on the plain red pill: breathing CSS animation (pill-breathe, closed state only), hover lift via `scale`, squish on press (WAAPI `scale` in initNav), eyes lock onto the pill + widen when the cursor is within 140px (initFaces); touch screens (hover: none) glance at the pill every 5-9s and on press.
- **Session 13i [2026-09-26]:** Face simplified: FIXED at the bottom edge on every homepage section, no section-change animation (Bipin found it incoherent). Kept: random pupil blinks, cursor tracking, eyes watching the pill, pill breathing/squish. initFaces now just needs any [data-face] on the page (hero has it). Top spacing reverted; Selected Works has bottom padding for the face.
- **Session 13j [2026-09-26]:** Orange wave is now live-drawn + phase-animated (wave.js, two mixed sines, pauses off-screen) under BOTH headings (About me, Selected Works), 22px below the heading (.wave margin-top). Static about-wave.svg removed. Phone canvas moved to top 23% / 20% to clear the wave.
- **Session 13k [2026-09-26]:** About section filled: framed portrait (assets/images/about/portrait.jpeg, yellow frame, -4deg tilt, straightens on hover) + floating skill pills (desktop >= 900px). Hard bottom edge fixed: desktop lifts the left blob to 60% so it ends inside the section; phones keep Figma 76% with a soft mask fade at the art's bottom.
- **Session 13l [2026-09-26]:** Floating pills removed (Bipin preferred just the photo) — floatingPills.js + SKILL_PILLS deleted. Portrait now centred in the gap between the bio and the creature (--bio-end calc), width clamp(240px, 19vw, 360px), desktop only.
- **Session 13m [2026-09-26]:** About creature's eye animated: generic initEyes() in nav.js — any [data-eye] element blinks on its own random rhythm (FACE timings) and glances toward the cursor (data-eye="N" = look range px, default 3). Wave now runs BEHIND the creature (art z-index 1, wave no z-index), as in the Figma.
- **Session 13n [2026-09-26]:** Creature eye: blink only, no cursor movement (Bipin).
- **Session 14 [2026-09-26]:** New Figma page frames replicated (desktop "landing"/"about"/"project"/"contact" 1440x1024 + phones iPhone 17 - 4/5/6). Each page has its own creature SCENE fixed in the lower-right corner for the whole page (js/components/scene.js, assets/shapes/scene-<page>.svg: home=long-neck, about=rabbit, projects=fox (also project.html), contact=lizard). SCENES table in scene.js holds Figma offsets; .scene CSS sizes it like the frame (1440 wide desktop / 402 phone, shrinks on short screens). Creature eyes (black circles in the svg) blink via blinkEyes(). Home: old in-section About creature removed (scene replaces it); phone hides the scene while the hero is on screen. Face moved to the TOP on every page (as in all new frames; the lower-right is now the creature): phone bar 294x45 + eyes 54 in corners; desktop bar 434x66 + eyes 80 at the bar ends, pill 94x49 at y=62. Fade band under the face once scrolled. Three yellow side bars top-left on desktop (side-bars.svg); --edge gutter (max(140px,5vw) desktop) clears them. Inner pages share .page / .page-head (title + wave). About ground strip extended to the screen edge (.scene--about::before). PENDING: scene-contact.svg — Figma MCP Starter-plan limit hit; export Figma node 43:383 ("Group 10" in the "contact" frame) as SVG to assets/shapes/scene-contact.svg, then delete the grey (#1E1E1E) and green (#114339) background <rect>s.
- **Session 14b [2026-09-26]:** Bipin exported Figma Group 10 (contact lizard) and a fresh Group 7 (projects fox, with eye) himself; saved as scene-contact.svg / scene-projects.svg (group exports have no background rects). All four scenes now live. To update a scene: export the Figma group as SVG and overwrite assets/shapes/scene-<page>.svg.
- **Session 14c [2026-09-26]:** Fixed creature eyes on projects + contact: eyes with a Figma transform (rotate/matrix) were knocked out of place by setting transform-origin on them; scene.js now wraps each eye in a <g> and blinks the wrapper.
- **Session 14d [2026-09-26]:** Selected Works overlap fix. Text blocks now share one grid cell (grid-area 1/1) instead of absolute + translateY(-50%), so the rail is as tall as the tallest block and can never spill over the wave or "All projects" (rail margin-top 1.25rem; All projects margin-top 1.25rem). Desktop: bottom room for the creature = clamp(2.5rem, 30svh - 120px, 30svh); title size clamp(2.4rem, min(4.6vw, 6.5svh), 4.6rem); desc clamped to 5 lines; --size-h2 also caps at 13svh. Phones: the canvas is a grid row (minmax(0,1fr)) between header and text, so card/text cannot overlap; counter moved under the wave (was hidden on the giraffe head); short phones (<=740px tall) hide chips + 2-line desc. Verified no overlap at 1622x821, 1280x720, 1366x768, 1440x900, 1920x1080, 1024x768, 768x1024, 430x932, 375x812, 375x667, 360x640.
- **Session 14e [2026-09-26]:** "All projects" moved out of the bottom of Selected Works (it blended into the creature art) into the header: small outlined yellow pill right after the "Selected Works" title (arrow nudges on hover, fills yellow). Phones: on the counter line under the wave, right-aligned.
- **Session 14f [2026-09-26]:** Side bars are now an animated equaliser (js/components/equalizer.js, called from initScene): 3 spans hanging from the top, random levels every 110-320ms, fast attack (0.28) / slow release (0.07), livelier while scrolling (scroll energy). Tunable in EQ at the top of the file. side-bars.svg deleted.
- **Session 14g [2026-09-26]:** Creature eyes follow the cursor again (Bipin asked; reverses 13n): scene.js followCursor() moves each eye wrapper <g> with the CSS `translate` property (layers with the blink `scale`), up to 0.5 x eye radius / max 5 Figma px, full glance at 300px cursor distance (LOOK at the top of scene.js). Mouse/pen only.
- **Session 14h [2026-09-26]:** Face eyes blink with a slight offset: FACE.eyeOffset = 160ms (was 70, not noticeable) between the two eyes, random eye leads each blink (0 = together again).
- **Session 14i [2026-09-26]:** Slower blinks: FACE.blinkDuration = 320ms (was 170) for face + creature eyes; double blink gap = blinkDuration + 80.
- **Session 14j [2026-09-26]:** FACE.eyeOffset set to 50ms (Bipin trying values).
- **Session 14k [2026-09-26]:** Blink slowed further: FACE.blinkDuration = 500ms; eyeOffset back to 160ms (the "50" was a typo for 500).
- **Session 14l [2026-09-26]:** FACE.blinkDuration = 1000ms (Bipin trying values).
- **Session 14m [2026-09-26]:** FACE.eyeOffset = 400ms to match the 1000ms blink.
- **Session 14n [2026-09-26]:** Settled blink: FACE.blinkDuration = 700ms, eyeOffset = 400ms.
- **Session 14o [2026-09-26]:** Blink stagger now occasional: both eyes blink together except every FACE.offsetEvery (3rd) blink, where one eye lags a random offsetMin-offsetMax (250-450ms). eyeOffset removed. blinkDuration 700.
- **Session 14p [2026-09-26]:** Contact page title capitalised. Red pill press smoothed: breathing moved from CSS keyframes to WAAPI in initNav (startBreathing/stopBreathing) so it eases out from its current pose instead of snapping when pressed/opened; squish eases in over 200ms (to 1.08 x 0.84) and release springs back over 620ms from the current scale (soft overshoot). Hover lift eases over 260ms.
- **Session 14q [2026-09-26]:** Red pill OPEN now uses the same curve as close (width 520ms cubic-bezier(0.65,0,0.2,1.25); height/margin 260ms after 120ms) — Bipin liked the close feel.
- **Session 14r [2026-09-26]:** Root cause of the "instant" menu opening: a leftover @media (prefers-reduced-motion) rule set the OPEN transition to 1ms (Windows reports reduce when animations are off; the closed rule out-specified it, so only closing animated). Removed — the site treats reduced motion as opt-in everywhere.
- **Session 14s [2026-09-26]:** About page: title "About me"; photo gets the yellow frame (var(--frame-width), radius-md) like the home portrait.
- **Session 14t [2026-09-26]:** redesign/orbit fast-forward merged into main (e0fd53c) and pushed; Vercel production deploy succeeded, bipinbaby.info shows the redesign. The daily sync-social GitHub Action now runs from main.
- **Session 14u [2026-09-26]:** iPhone Safari fixes: viewport-fit=cover + theme-color #ffcc00 on all pages; --safe-top = env(safe-area-inset-top); body padded below the status bar; nav pill + face offset by it; .face::after fills the status bar strip yellow (content no longer shows through). Phones: .scene anchored with top: calc(100lvh - ...) instead of bottom, because Safari puts bottom:0 above its toolbar (left a ~90px gap under the creature). Selected Works phone padding-top + safe-top.
