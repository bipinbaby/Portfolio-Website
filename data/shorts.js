// ============================================================
//  SHORTS — fixes and extras for your YouTube Shorts
//
//  Titles, text and thumbnails come from YouTube automatically
//  (data/social.json, synced daily). Use this file when you want
//  the site to show something different from YouTube, without
//  editing the post itself.
//
//  Key = the Short's video ID (the part after /shorts/ in its link).
//
//  Fields (all optional):
//    title     → replaces the YouTube title (e.g. to fix a typo)
//    tags      → category pills, instead of the ones worked out
//                automatically from the post's #hashtags
//    category  → "creative-tech" | "3d-design" | "photography"
//                (which filter tab it appears under on the
//                Projects page; default "creative-tech")
// ============================================================

export const SHORT_OVERRIDES = {

  "SwsGbn0EbLg": {
    title: "Joystick Controller",          // YouTube title says "Conttoller"
  },

};
