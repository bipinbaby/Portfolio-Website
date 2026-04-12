// ============================================================
//  PROJECTS DATA — add, remove, or edit your projects here.
//
//  CATEGORIES (use exactly these strings):
//    "creative-tech"  → Creative Technology tab
//    "3d-design"      → 3D Art & Design tab
//    "photography"    → Photography tab
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
//  LINK (optional):
//    External URL that opens when clicking "View Project".
//    Set to null if there's no external link.
// ============================================================

export const PROJECTS = [

  // ── CREATIVE TECHNOLOGY ─────────────────────────────────────

  {
    title:       "Digital Twin — Industrial Site",
    featured:    true,   // ← shows on homepage. Set to false to hide from homepage.
    category:    "creative-tech",
    description: "Real-time digital twin built in Unreal Engine 5 with live data feeds via Python. Visualises operational metrics as interactive 3D overlays.",
    thumbnail:   "assets/images/projects/twin-thumb.jpg",
    videoEmbed:  null,   // e.g. "https://www.youtube.com/embed/your_id"
    videoFile:   null,   // e.g. "assets/videos/projects/twin.mp4"
    link:        "https://www.linkedin.com/in/bipin-baby-7436a7196/",
    tags:        ["Unreal Engine 5", "Python", "Digital Twin", "Real-time Data"],
  },

  {
    title:       "TouchDesigner Interactive Installation",
    featured:    true,
    category:    "creative-tech",
    description: "Generative audiovisual system that responds to crowd movement using computer vision and OSC. Built for live performance environments.",
    thumbnail:   "assets/images/projects/td-thumb.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://www.instagram.com/madebybipin",
    tags:        ["TouchDesigner", "Python", "OSC", "Computer Vision"],
  },

  // ── 3D ART & DESIGN ─────────────────────────────────────────

  {
    title:       "3D Art — Title",
    featured:    true,
    category:    "3d-design",
    description: "Description of the piece — materials, concept, tools used.",
    thumbnail:   "assets/images/projects/art-thumb.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://bipinbabyvarghese.artstation.com/",
    tags:        ["Blender", "Unreal Engine"],
  },

  {
    title:       "Graphic Design — Title",
    category:    "3d-design",
    description: "Description of the project.",
    thumbnail:   "assets/images/projects/design-thumb.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://www.behance.net/bipinbabyvarghese",
    tags:        ["Graphic Design", "Behance"],
  },

  // ── PHOTOGRAPHY ─────────────────────────────────────────────

  {
    title:       "Series — Title",
    category:    "photography",
    description: "A short description of the series, location, or concept.",
    thumbnail:   "assets/images/projects/photo-thumb.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://www.instagram.com/by_a_baby",
    tags:        ["Photography"],
  },

];
