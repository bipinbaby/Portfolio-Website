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
  { label: "Instagram ✦", url: "https://www.instagram.com/madebybipin" },
  { label: "Photography", url: "https://www.instagram.com/by_a_baby" },
];

// ============================================================
//  THREE.JS HERO SETTINGS
//  Tweak these to change how the hero scene looks and feels.
// ============================================================

export const PARTICLES = {
  count:        5000,    // number of stars — higher = denser, heavier on GPU
  spread:       28,      // how wide the star field spreads (world units)
  size:         0.05,    // star dot size
  color:        "#8bc4e0", // base colour (overridden per-star by twinkle system)
  mouseRadius:  3.5,     // how far the mouse influence reaches (world units)
  repelStrength:0.18,    // how hard stars are pushed from the mouse
  returnSpeed:  0.035,   // how fast stars drift back to origin
  driftSpeed:   0.0003,  // idle float animation speed
};

export const HERO_OBJECT = {
  // Path to your custom .glb model.
  // Drop your file into assets/models/ and update this path.
  // Until your model is ready, a fallback geometry is shown.
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
