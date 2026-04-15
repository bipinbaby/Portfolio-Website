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
    slug:        "mediapipe-unreal",
    title:       "Interactive robot arm in Unreal Engine using Mediapipe and Python",
    featured:    true,   // ← shows on homepage. Set to false to hide from homepage.
    category:    "creative-tech",
    year:        "2026",
    role:        "Developer",
    description: "An interactive piece cominbining Python and Unreal Engine using Mediapipe and OSC signals",
    longDescription: [
      // Each string is one paragraph on the detail page.
      // Replace these with your actual project write-up.
      "This uses Google's OpenCV library to run the hand tracking using Python to drive the animation of a robot arm in Unreal Engine. I had to brush up on my 3D modelling skills and modelled the robot in Blender and used Unreal Engine's control rig to create an IK rig, and honestly, that was the easy part! When I brought this model in blueprints, the control rig was not animating at all. It took me a day and a half to figure out that it was one button in the control rig menu, and almost no documentation I could find. I also wanted to add sounds for each joint movement, and I kind of got it to work, but I found out my skills were abhorrent and my ears were going deaf, hearing servo sounds going haywire. If anyone knows how I can tackle sound design cleanly, please do let me know!!!! I tried to ask Claude to help me out wherever I lacked the knowledge, but it doesn't seem to work well with Unreal, so this was mostly me, and I used Claude to keep track of my progress and for documentation.", 
      "Well, for updates, since my right hand does the movement of the body, I was thinking of using my left hand to animate the gripper."

      
    ],
    images:      [],   // e.g. ["assets/images/projects/twin-1.jpg", "assets/images/projects/twin-2.jpg"]
    thumbnail:   "assets/images/projects/Robot Interactive.jpg",
    videoEmbed:  null,   // e.g. "https://www.youtube.com/embed/your_id"
    videoFile:   "assets/videos/projects/robot hand tracking (1).mp4",
    link:        "https://www.linkedin.com/feed/update/urn:li:activity:7449871730875006976/",
    tags:        ["Unreal Engine", "Python", "OpenCV", "Real-time Data", "OSC"],
  },

  {
    slug:        "mediapipe-touchdesigner",
    title:       "TouchDesigner: Mediapipe Experiment",
    featured:    false,   // ← shows on homepage. Set to false to hide from homepage.
    category:    "creative-tech",
    year:        "2026",
    role:        "Developer",
    description: "An experiment using Googles Mediapipe content with custom python code in TouchDesigner",
    longDescription: [
      // Each string is one paragraph on the detail page.
      // Replace these with your actual project write-up.
      "This time, I am testing out the Google Mediapipe algorithm in Derivative's TouchDesigner with the help of Claude Code! I am aware that there is a plugin that allows access to Mediapipe, but I wanted to test sending OSC signals from Python into TouchDesigner directly, so I can send those signals in other software like Unreal Engine with relative ease (hopefully).", 
      "There is a slight delay in the video because of recording from 2 different video sources. Also, please ignore my frowny face; I'm just camera shy.",
      "FYI, this work was inspired by that scene from Project Hail Mary (how good was that movie?)"

      
    ],
    images:      [],   // e.g. ["assets/images/projects/twin-1.jpg", "assets/images/projects/twin-2.jpg"]
    thumbnail:   "assets/images/projects/opencv-td.jpg",
    videoEmbed:  null,   // e.g. "https://www.youtube.com/embed/your_id"
    videoFile:   "assets/videos/projects/opencv-touchdesigner (1).mp4",
    link:        "https://www.linkedin.com/feed/update/urn:li:activity:7446268376974307328/",
    tags:        ["TouchDesigner", "Python", "OpenCV", "Real-time Data", "Claude Code"],
  },


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
    link:        "https://www.linkedin.com/feed/update/urn:li:activity:7444446600787230720/",
    tags:        ["Unreal Engine 5", "Python", "Digital Twin", "Real-time Data", "Blender"],
  },

  {
    slug:        "td-installation",
    title:       "TouchDesigner: OSC Sensor Simulation",
    featured:    true,
    category:    "creative-tech",
    year:        "2026",
    role:        "Artist / Developer",
    description: "Generative system that responds to  OSC values . Built for live performance environments.",
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
    link:        "https://www.linkedin.com/feed/update/urn:li:activity:7438996850969354241/",
    tags:        ["TouchDesigner", "Python", "OSC"],
  },

    {
    slug:        "td-audio-reactive",
    title:       "TouchDesigner: Audio Reactive",
    featured:    true,
    category:    "creative-tech",
    year:        "2026",
    role:        "Artist / Developer",
    description: "An audio visual syetem that moves according to the music",
    longDescription: [
      // Replace with your actual project write-up.
      "The Concept A series of visual experiments exploring the intersection of sound and motion. This project marks the beginning of my journey into creative technology, focusing on real-time data visualization and procedural animation.",
      "Technical Details * Audio-Reactive System: Developed using TouchDesigners CHOPs to analyze frequency spectrums, mapping low-end transients to scale and high-end peaks to particle turbulence.",
      "Animation: A secondary study in noise-based displacement and feedback loops to create organic, non-reactive motion.",
      "Soundtrack Mario Piu - The Vision (Suncraft Remix)"
    ],
    images:      [],
    thumbnail:   "assets/images/projects/Audio Reactive 1.jpg",
    videoEmbed:  null,
    videoFile:   "assets/videos/projects/audio reactive (1).mp4",
    link:        "https://www.linkedin.com/feed/update/urn:li:activity:7434885481055776768/",
    tags:        ["TouchDesigner"],
  },


  {
    slug:        "td-simple-reactive",
    title:       "TouchDesigner: Interactive Flower",
    featured:    false,
    category:    "creative-tech",
    year:        "2026",
    role:        "Artist / Developer",
    description: "A simple 3D interactive Gem Flower what moves towards the direction of the mouse ",
    longDescription: [
      // Replace with your actual project write-up.
      "The Concept",
      "An exploration into procedural growth and interactive geometry. The goal was to create a Gem Flower that responds to user input using a mouse, blending organic forms with crystalline structures.",

      "The Process & Pivot",

      "Initial Approach: Due to a lack of experieience python couldnt get a real-time workflow set up so I had to pivot  ",

      "The Solution: Transitioned to a purely node-based, non-destructive workflow. Drawing on my experience with Houdini, I rebuilt the logic using CHOPs (Channel Operators) and SOPs (Surface Operators)",

      "Result: This shift eliminated the overhead of script execution, ensuring 60fps performance and a fully 'live' environment where every parameter remains tweakable in real-time.",

      "Technical Highlights",

      "Procedural Modeling: Geometric growth patterns driven by noise-weighted attributes.",

      "Interactive Logic: Zero-code implementation using Feedback loops and Math CHOPs for state management and works with mouse movement.",

      "Performance: Optimized for real-time rendering without the need for external scripting.",
    ],
    images:      [],
    thumbnail:   "assets/images/projects/Flower.jpg",
    videoEmbed:  null,
    videoFile:   "assets/videos/projects/flower.mp4",
    link:        "https://www.linkedin.com/feed/update/urn:li:activity:7435774621443833857/",
    tags:        ["TouchDesigner", "Interactive"],
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
    longDescription: ["The Collection of Photographs I take to still be artistic follow the link to my Instagram below"],
    images:      [],
    thumbnail:   "assets/images/projects/Photography.jpg",
    videoEmbed:  null,
    videoFile:   null,
    link:        "https://www.instagram.com/by_a_baby",
    tags:        ["Photography"],
  },

];
