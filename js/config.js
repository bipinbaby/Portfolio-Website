// ============================================================
//  SITE CONFIGURATION — your main control panel
//  Edit anything in this file freely. Changes apply site-wide.
// ============================================================

export const SITE = {
  name:        "Bipin Baby",
  tagline:     "Creative Technologist",
  description: "Building interactive systems, digital twins, and immersive experiences.",
  email:       "bipinbabyvarghese@gmail.com",
};

export const SOCIALS = [
  // Each entry: { label, url, icon }
  // 'icon' matches a filename in assets/icons/ — or remove icon entirely, text works fine
  { label: "ArtStation",  url: "https://bipinbabyvarghese.artstation.com/" },
  { label: "Behance",     url: "https://www.behance.net/bipinbabyvarghese" },
  { label: "LinkedIn",    url: "https://www.linkedin.com/in/bipin-baby-7436a7196/" },
  { label: "GitHub",      url: "https://github.com/bipinbaby" },
  { label: "Instagram",   url: "https://www.instagram.com/madebybipin" },
  { label: "Photography", url: "https://www.instagram.com/by_a_baby" },
];

// ============================================================
//  YOUTUBE SHORTS SYNC
//  A GitHub Action (.github/workflows/sync-social.yml) runs
//  scripts/sync-social.mjs once a day. It reads the Shorts from
//  this channel and writes data/social.json + assets/social/*.jpg.
//  The same posts go to LinkedIn + Instagram, so YouTube is the
//  single source. Link a Short to a project with `shorts: [...]` in
//  data/projects.js; unlinked ones join Selected Works on their own
//  (js/components/shorts.js).
//
//  channelId: starts with "UC…" — find it on YouTube under
//  Settings → Advanced settings, or paste your channel URL into
//  any "YouTube channel ID finder".
// ============================================================

export const YOUTUBE = {
  channelId:  "UCuiD_quHBSP3BjCEiO0qFTg",  // @bipinthebaby1
  channelUrl: "https://www.youtube.com/@bipinthebaby1",
  maxShorts:     16,                   // how many recent Shorts the daily sync keeps
  maxAutoShorts: 5,                    // unlinked Shorts added to Selected Works as Short-only projects
};

// ============================================================
//  3D CAROUSELS  (Blender rig → assets/models/carousel.glb)
//  Rig from CAROUSEL.blend: Carousel_Root → Carousel_Spin →
//  Card_Slot_XX → Card_XX (8 cards). Re-export the GLB from
//  Blender and drop it in assets/models/ — no code changes needed.
// ============================================================

export const CAROUSEL = {
  modelPath:  "assets/models/carousel.glb",
  background: "#114339",   // must match --color-bg in css/variables.css (used for fog)

  // Card look from the Figma "carousel" frame: thick yellow frame + big
  // round corners. Values are fractions of the card's height.
  cardDesktop: { aspect: 1450 / 816, radius: 148 / 816, border: 19 / 816, color: "#ffcc00" },

  // Selected Works ring (front view — one big card at a time, slides side to side)
  wheel: {
    cardFill:      0.9,     // how much of the canvas width the card fills (0–1; front card also scales up 6%)
    scrollPerCard: 0.6,     // screen-heights of scrolling per project
    damping:       0.09,    // 0.05 = floaty, 0.2 = snappy
    fog:           [30, 40],// (effectively off — side cards are hidden)

    // Slide animation between projects. A leaving card swings away,
    // rolls, drifts diagonally and sinks back; the next one does the
    // mirror and settles flat. Set any value to 0 to switch that part off.
    motion: {
      smoothTime: 0.8,      // seconds for the ring to glide to the next card
      swing:      1.5,      // Y — turn like a door (radians; 1.5 ≈ 86°)
      roll:       0.45,     // Z — spin like a steering wheel (radians; ≈ 26°)
      tip:        0.55,     // X — lean back (radians; ≈ 32°)
      lift:       0.9,      // diagonal drift up/down (world units)
      push:       1.8,      // sink backwards (world units)
      shrink:     1.0,      // scale: 1 = grows from 0 to full size (and shrinks back to 0 when leaving)
      fadeSpan:   1.1,      // fade speed away from the front (higher = fades sooner)
      respectReducedMotion: false,  // true = plain glide when the OS asks for reduced motion
    },
  },

};

// ============================================================
//  THREE.JS HERO SETTINGS
//  Tweak these to change how the hero scene looks and feels.
// ============================================================

export const PARTICLES = {
  count:        5000,    // number of stars — higher = denser, heavier on GPU
  spread:       28,      // how wide the star field spreads (world units)
  size:         0.05,    // star dot size
  color:        "#8f7dff", // base colour (overridden per-star by twinkle system)
  mouseRadius:  3.5,     // how far the mouse influence reaches (world units)
  repelStrength:0.18,    // how hard stars are pushed from the mouse
  returnSpeed:  0.035,   // how fast stars drift back to origin
  driftSpeed:   0.0003,  // idle float animation speed
};

export const HERO_OBJECT = {
  // Path to your custom .glb model.
  // Drop your file into assets/models/ and update this path.
  // Until your model is ready, a fallback geometry is shown.
  enabled:     false,   // Orbit redesign: the carousels are the 3D moment. Set true to bring the glass object back.
  modelPath:   "assets/models/hero.glb",

  // ── Realistic glass material ─────────────────────────────
  // See js/three/heroObject.js for full explanation of each property.
  glass: {
    color:              "#c8e8f8",  // surface tint — very light icy blue
    transmission:        1.0,       // 1.0 = fully see-through glass
    roughness:           0.18,      // frosted level: 0=crystal  0.18=etched  1=milky
    thickness:           2.5,       // glass volume depth (affects tint + refraction)
    ior:                 1.52,      // index of refraction (glass=1.5, ice=1.31)
    dispersion:          0.45,      // rainbow/prism effect at edges (0–1)
    iridescence:         0.30,      // thin-film colour shift — subtle soap-bubble

    // ── Clearcoat — glossy outer layer over frosted interior ──
    // This is what makes it look like real frosted/etched glass.
    clearcoat:           0.85,      // 0=off  1=full gloss coat
    clearcoatRoughness:  0.04,      // keep this near 0 for sharp surface highlights

    // ── Specular ──────────────────────────────────────────────
    specularIntensity:   1.2,       // brightness of direct light reflections
    specularColor:      "#daf0ff",  // cold icy white specular tint

    attenuationColor:   "#6ab4d8",  // ice-blue volumetric tint inside thick areas
    attenuationDistance: 3.0,       // how deep the tint penetrates
    envIntensity:        3.5,       // environment reflection strength (higher = more reflective)
  },

  // Animation
  rotationSpeed: { x: 0.0008, y: 0.0015 },  // idle rotation (radians/frame)
  scale: 1.0,   // adjust if your model comes in too big or small
};

export const LIGHTS = {
  ambient:    { color: "#2a4a6a", intensity: 1.8 },
  key:        { color: "#88ccee", intensity: 4.5, position: [5, 8, 5] },
  fill:       { color: "#4a8ab0", intensity: 2.5, position: [-6, 2, -4] },
  rim:        { color: "#aad8f0", intensity: 3.0, position: [0, -5, -8] },
};
