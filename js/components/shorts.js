// ============================================================
//  SHORTS — YouTube Shorts as part of your projects
//
//  data/social.json is written once a day by the GitHub Action
//  (scripts/sync-social.mjs). This module turns it into work:
//
//   • LINKED Shorts — list a Short's video ID in a project's
//     `shorts: [...]` field (data/projects.js). The project gets a
//     "Watch the Short" button, and its page shows the clip.
//   • UNLINKED Shorts — every other recent Short becomes its own
//     "Short-only" project on the Selected Works wheel
//     (newest first, up to YOUTUBE.maxAutoShorts).
//
//  Short-only cards stay 16:9 like the rest: the portrait video
//  sits in the middle of a blurred, enlarged copy of itself.
// ============================================================

import { SOCIALS, YOUTUBE } from '../config.js';
import { SHORT_OVERRIDES } from '../../data/shorts.js';
import { openCustomModal } from './projectGrid.js';

// ── Data ─────────────────────────────────────────────────

let shortsPromise;
export function loadShorts() {
  shortsPromise ??= fetch('data/social.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : { items: [] }))
    .then(d => (d.items ?? []).map(withOverrides))
    .catch(() => []);
  return shortsPromise;
}

// Apply data/shorts.js fixes, and work out the category pills
function withOverrides(s) {
  const o = SHORT_OVERRIDES[s.id] ?? {};
  return {
    ...s,
    title:    o.title ?? s.title,
    tags:     o.tags ?? tagsFromPost(s),
    category: o.category ?? 'creative-tech',
  };
}

// Category pills from the post's #hashtags (title first, then text).
// Only hashtags listed here become pills — generic ones (#creative,
// #technology…) are skipped. Add your own mappings as you post more.
const TAG_NAMES = {
  touchdesigner: 'TouchDesigner', madewithtouchdesigner: 'TouchDesigner',
  arduino: 'Arduino', arduinoproject: 'Arduino', esp32: 'ESP32',
  electronics: 'Electronics', electronic: 'Electronics',
  interactiveart: 'Interactive', interactive: 'Interactive', immersiveart: 'Immersive Art',
  creativecoding: 'Creative Coding', coding: 'Creative Coding', programming: 'Creative Coding',
  generativeart: 'Generative Art', generativedesign: 'Generative Art', fractalart: 'Fractals',
  livevisuals: 'Live Visuals', realtimevisuals: 'Live Visuals', concertvisuals: 'Live Visuals', vjing: 'Live Visuals',
  audioreactive: 'Audio Reactive', audiovisual: 'Audio Reactive', audiovisualart: 'Audio Reactive',
  stagedesign: 'Stage Design',
  unrealengine: 'Unreal Engine', python: 'Python', mediapipe: 'Computer Vision',
  opencv: 'Computer Vision', computervision: 'Computer Vision', handtracking: 'Computer Vision',
  robotics: 'Robotics', controlrig: 'Control Rig', techart: 'Tech Art',
};
export function tagsFromPost(s, max = 3) {
  const hashtags = `${s.title ?? ''} ${s.description ?? ''}`.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  const tags = [];
  for (const h of hashtags) {
    const name = TAG_NAMES[h.slice(1).toLowerCase()];
    if (name && !tags.includes(name)) tags.push(name);
    if (tags.length === max) break;
  }
  return tags.length ? tags : ['Short-form'];
}

// Projects + Short-only projects, in wheel/grid order.
// `allProjects` = every project (so a Short linked to a project that
// isn't in `projects` still isn't added again on its own).
export function buildWork(projects, shorts, allProjects = projects) {
  const byId   = new Map(shorts.map(s => [s.id, s]));
  const linked = new Set(allProjects.flatMap(p => p.shorts ?? []));

  const work = projects.map(p => ({
    ...p,
    shortItems: (p.shorts ?? []).map(id => byId.get(id)).filter(Boolean),
  }));

  // Only your latest N posts are considered; any of those already linked
  // to a project show up inside that project instead.
  const auto = [...shorts]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, YOUTUBE.maxAutoShorts ?? 5)
    .filter(s => !linked.has(s.id))
    .map(s => ({
      slug:        `short-${s.id}`,
      title:       cleanTitle(s.title),
      // Your post text (first sentence or two), else the date
      description: summary(s.description) || `Short-form clip · ${fmtDate(s.date)}`,
      thumbnail:   s.thumb,
      tags:        s.tags,
      category:    s.category,
      date:        s.date,
      isShort:     true,
      shortItems:  [s],
    }));

  // Newest first, projects and Shorts mixed. A project's date is its
  // `date`, else its newest linked Short, else its year; undated go last.
  // (Array.sort is stable, so equal dates keep their projects.js order.)
  const when = p => p.date
    ?? p.shortItems.map(s => s.date).filter(Boolean).sort().at(-1)
    ?? (p.year ? String(p.year) : '');
  return [...work, ...auto].sort((a, b) => when(b).localeCompare(when(a)));
}

// ── 16:9 card image for a portrait Short ─────────────────
// Draws the thumbnail blurred + darkened to fill a 16:9 frame,
// then the sharp portrait image centred on top. Returns a data
// URL (or the original URL if the image can't be processed).

const pillarCache = new Map();
export function pillarbox(url) {
  if (!pillarCache.has(url)) {
    pillarCache.set(url, new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const W = 1280, H = 720;
          const c = document.createElement('canvas');
          c.width = W; c.height = H;
          const ctx = c.getContext('2d');

          // Background: cover-fit, blurred, darkened
          const cover = Math.max(W / img.width, H / img.height) * 1.15;
          ctx.filter = 'blur(28px) brightness(0.5)';
          ctx.drawImage(img, (W - img.width * cover) / 2, (H - img.height * cover) / 2,
                        img.width * cover, img.height * cover);

          // Foreground: contain-fit, sharp
          ctx.filter = 'none';
          const fit = H / img.height;
          ctx.drawImage(img, (W - img.width * fit) / 2, 0, img.width * fit, H);

          resolve(c.toDataURL('image/jpeg', 0.86));
        } catch {
          resolve(url);   // cross-origin image → can't read pixels; use as-is
        }
      };
      img.onerror = () => resolve(url);
      img.src = encodeURI(url);
    }));
  }
  return pillarCache.get(url);
}

// ── Portrait player modal ────────────────────────────────

export function openShort(it) {
  const also = SOCIALS.filter(s => /linkedin|instagram\.com\/madebybipin/i.test(s.url));
  openCustomModal(`
    <div class="modal__video modal__video--reel">
      <iframe src="${it.embedUrl}?autoplay=1&rel=0&playsinline=1" title="${escapeHtml(it.title)}"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
    </div>
    <div class="modal__body">
      <p class="short__date">${fmtDate(it.date)}</p>
      <h2 class="modal__title">${escapeHtml(cleanTitle(it.title))}</h2>
      ${postParagraphs(it.description).map(p => `<p class="modal__desc">${escapeHtml(p)}</p>`).join('')}
      <div class="modal__footer">
        <span class="short__also">Also on
          ${also.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join(' · ')}
        </span>
        <a href="${it.url}" target="_blank" rel="noopener" class="btn btn-ghost">YouTube ↗</a>
      </div>
    </div>`, 'modal--reel');
}

// ── Helpers ──────────────────────────────────────────────

// ── Your post text → readable paragraphs ─────────────────
// Removes #hashtags, turns @handles into names, drops lines that
// were only tags. Blank lines in the post become paragraph breaks.
const HANDLES = {
  'arduino.cc': 'Arduino', 'arduino': 'Arduino',
  'touchdesigner': 'TouchDesigner', 'touchdes': 'TouchDesigner',
};
export function postParagraphs(text = '') {
  return text
    .replace(/@(\w+(?:\.[a-z]{2,})?)/gi, (m, h) => HANDLES[h.toLowerCase()] ?? h)
    .split(/\n\s*\n/)
    .map(p => p.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 1);
}

// First sentence or two of the post (for the wheel's text block)
export function summary(text = '', max = 170) {
  const first = postParagraphs(text).find(p => !/^music\s*:/i.test(p)) ?? '';
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return end > 60 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

// Drop #hashtags from a Short's title for the headline ("… #Minecraft #YouTubePartner")
export function cleanTitle(t = '') {
  return t.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s{2,}/g, ' ').trim() || t;
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
