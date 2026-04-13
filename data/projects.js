// ============================================================
//  PROJECTS DATA — add, remove, or edit your projects here.
//
//  CATEGORIES (use exactly these strings):
//    "creative-tech"  → Creative Technology tab
//    "3d-design"      → 3D Art & Design tab
//    "photography"    → Photography tab
//
//  SLUG:
//    A unique URL-safe ID for this project (lowercase, hyphens only).
//    This is used in the URL: project.html?slug=your-slug-here
//    Make it short and descriptive. No spaces or special characters.
//
//  VIDEO OPTIONS (use one, both, or neither):
//    videoFile  → local file: "assets/videos/projects/your-video.mp4"
//    videoEmbed → YouTube: "https://www.youtube.com/embed/VIDEO_ID"
//               → Vimeo:   "https://player.vimeo.com/video/VIDEO_ID"
//    To get a YouTube embed URL: take the video ID from the normal URL
//    (e.g. youtube.com/watch?v=ABC123) and use:
//    "https://www.youtube.com/embed/ABC123"
//
//  THUMBNAIL:
//    Drop a .jpg or .png into assets/images/projects/ and reference it here.
//    If omitted, a placeholder is shown.
//
//  LONG DESCRIPTION:
//    Shown on the dedicated project detail page. Add as many paragraphs
//    as you like — each string in the array becomes a paragraph.
//    If empty [], the short 'description' is used instead.
//
//  IMAGES (gallery on detail page):
//    Array of image paths shown below the description on the detail page.
//    e.g. ["assets/images/projects/twin-1.jpg", "assets/images/projects/twin-2.jpg"]
//    Leave as [] if you have no extra images yet.
//
//  YEAR / ROLE:
//    Shown as metadata on the detail page. Set to null to hide.
//
//  LINK (optional):
//    External URL shown as a secondary button on the detail page.
//    Set to null if there's no external link.
// ============================================================

export const PROJECTS = [

  // ── CREATIVE TECHNOLOGY ─────────────────────────────────────

  {
    slug:        "building-twin",
    title:       "Digital Twin — Office Floor Twin",
    featured:    true,   // ← shows on homepage. Set to false to hide from homepage.
    category:    "creative-tech",
    year:        "2026",
    role:        "Developer",
    description: "Real-time digital twin built in Unreal Engine 5 with simulated live data feeds via Python. Visualises operational metrics as interactive 3D overlays.",
    longDescription: [
      // Each string is one paragraph on the detail page.
      // Replace these with your actual project write-up.
      "A real-time digital twin of a commercial building, built entirely in Unreal Engine 5. Live sensor data — temperature, occupancy, energy usage — is piped in via a Python backend and visualised as interactive 3D overlays directly on the building model.",
      "The system demonstrates how physical infrastructure can be monitored and understood through an immersive 3D interface, bridging the gap between raw data and spatial intuition.",
      "Python handles the data simulation and http requests; UE5 Blueprints consume the feed and update the visualisation in real time with zero perceptible lag.",
    ],
    images:      [],   // e.g. ["assets/images/projects/twin-1.jpg", "assets/images/projects/twin-2.jpg"]
    thumbnail:   "assets/images/projects/twin-thumb.jpg",
    videoEmbed:  null,   // e.g. "https://www.youtube.com/embed/your_id"
    videoFile:   "assets/videos/projects/Building Twin Demo.mp4",
    link:        "https://www.linkedin.com/in/bipin-baby-7436a7196/",
    tags:        ["Unreal Engine 5", "Python", "Digital Twin", "Real-time Data"],
  },

  {
    slug:        "td-installation",
    title:       "TouchDesigner OSC Sensor Simulation",
    featured:    true,
    category:    "creative-tech",
    year:        "2026",
    role:        "Artist / Developer",
    description: "Generative audiovisual system that responds to crowd movement using computer vision and OSC. Built for live performance environments.",
    longDescription: [
      // Replace with your actual project write-up.
      "I tried to work with Python, and coming from a C++ background, it was really intuitive! That being said, I haven't written code in ages and barely have my groove back!",
      "So for this project, I used OSC to drive touchDesigner values to create a digital twin or at least a usable UI interface where sensor values drive and create data visualisation. ",
      "The only problem was that I couldn't get the real-time sensor values for free, so I used Claude AI to simulate real-time data such as temperature, humidity and power. So when the temperature crosses a threshold (90 degrees in this instance), it changes from white to red visuals (I may have taken some artistic license with it ). "
    ],
    images:      [],
    thumbnail:   "assets/images/projects/td-thumb.jpg",
    videoEmbed:  null,
    videoFile:   "assets/videos/projects/tempscale_render.mp4",
    link:        "https://www.instagram.com/madebybipin",
    tags:        ["TouchDesigner", "Python", "OSC"],
  },

  // ── 3D ART & DESIGN ─────────────────────────────────────────

  {
    slug:        "procedural-3d",
    title:       "Procedural 3D Technical Art",
    featured:    true,
    category:    "3d-design",
    year:        null,
    role:        "Technical Artist",
    description: "Description of the piece — materials, concept, tools used.",
    longDescription: [],  // leave empty to use the short description above
    images:      [],
    thumbnail:   "assets/images/projects/Tech_Art_Thumb.jpg",
    videoEmbed:  null,
    videoFile:   "assets/videos/projects/technical_art.mp4",
    link:        "https://bipinbabyvarghese.artstation.com/",
    tags:        ["Blender", "Unreal Engine", "Houdini", "Substance Painter"],
  },

  {
    slug:        "graphic-design",
    title:       "Graphic Design",
    category:    "3d-design",
    year:        null,
    role:        "Designer",
    description: "A collection of work I have done working as a Graphic Designer.",
    longDescription: [],
    images:      [],
    thumbnail:   "assets/images/projects/Graphic_thumb.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://www.behance.net/bipinbabyvarghese",
    tags:        ["Graphic Design", "Behance"],
  },

  // ── PHOTOGRAPHY ─────────────────────────────────────────────

  {
    slug:        "photo-series",
    title:       "Complete Collection",
    category:    "photography",
    year:        null,
    role:        "Photographer",
    description: "All Photographs I have taken! (published on Instagram)",
    longDescription: [],
    images:      [],
    thumbnail:   "assets/images/projects/photo-thumb.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://www.instagram.com/by_a_baby",
    tags:        ["Photography"],
  },

];
