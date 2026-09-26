// ============================================================
//  SYNC SOCIAL — pulls your latest YouTube Shorts into the site
//
//  Run by .github/workflows/sync-social.yml once a day, or by
//  hand:   node scripts/sync-social.mjs
//
//  • Reads YOUTUBE.channelId from js/config.js
//    (or the YT_CHANNEL_ID environment variable).
//  • Uses YouTube's public RSS feed — no API key, no login.
//    The "UUSH…" playlist is YouTube's built-in Shorts-only list.
//  • Downloads each thumbnail into assets/social/<id>.jpg so the
//    3D ring can use it (and it never expires).
//  • Also fetches any Short linked to a project (`shorts: [...]` in
//    data/projects.js), even if it's older than the recent feed.
//  • Writes data/social.json, which js/components/shorts.js reads.
//
//  No dependencies — plain Node 18+.
// ============================================================

import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT     = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = path.join(ROOT, 'data', 'social.json');
const IMG_DIR  = path.join(ROOT, 'assets', 'social');

// ── Settings from js/config.js ─────────────────────────────
const configSrc = await readFile(path.join(ROOT, 'js', 'config.js'), 'utf8');
const pick = key => configSrc.match(new RegExp(`${key}:\\s*["']([^"']*)["']`))?.[1] ?? '';
const channelId = process.env.YT_CHANNEL_ID || pick('channelId');
const maxShorts = Number(configSrc.match(/maxShorts:\s*(\d+)/)?.[1] ?? 16);

if (!/^UC[\w-]{22}$/.test(channelId)) {
  console.log('No valid YouTube channelId in js/config.js (should start with "UC") — nothing to sync.');
  process.exit(0);
}

// ── Fetch the feed ─────────────────────────────────────────
const shortsFeed  = `https://www.youtube.com/feeds/videos.xml?playlist_id=UUSH${channelId.slice(2)}`;
const uploadsFeed = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

async function getText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'portfolio-sync/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

let xml, source = 'shorts';
try {
  xml = await getText(shortsFeed);
} catch (err) {
  console.warn(`Shorts playlist unavailable (${err.message}) — falling back to all uploads.`);
  xml = await getText(uploadsFeed);
  source = 'uploads';
}

// ── Parse (the feed is simple Atom — a few regexes are enough) ──
const decode = s => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].trim()) : '';
};

const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
  .map(m => m[1])
  .map(block => ({
    id:    tag(block, 'yt:videoId'),
    title: tag(block, 'title'),
    date:  tag(block, 'published'),
    description: tag(block, 'media:description'),   // the text you wrote for the post
  }))
  .filter(e => e.id)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, maxShorts);

// ── Shorts linked to projects (may be older than the feed) ──
const projectsSrc = await readFile(path.join(ROOT, 'data', 'projects.js'), 'utf8');
const linkedIds = [...projectsSrc.matchAll(/shorts:\s*\[([^\]]*)\]/g)]
  .flatMap(m => [...m[1].matchAll(/["']([\w-]{11})["']/g)].map(x => x[1]));

for (const id of new Set(linkedIds)) {
  if (entries.some(e => e.id === id)) continue;
  let title = '';
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/shorts/${id}`);
    if (res.ok) title = (await res.json()).title ?? '';
  } catch {}
  entries.push({ id, title, date: '', description: '' });
}

// ── Thumbnails ─────────────────────────────────────────────
// oar2.jpg is YouTube's portrait (9:16) thumbnail for Shorts;
// hqdefault.jpg (4:3) is the fallback for anything else.
await mkdir(IMG_DIR, { recursive: true });

async function saveThumb(id) {
  const file = path.join(IMG_DIR, `${id}.jpg`);
  if (existsSync(file)) return true;
  for (const name of ['oar2.jpg', 'maxresdefault.jpg', 'hqdefault.jpg']) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${name}`);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) continue;          // YouTube's grey "no thumbnail" placeholder
    await writeFile(file, buf);
    return true;
  }
  return false;
}

const items = [];
for (const e of entries) {
  const ok = await saveThumb(e.id);
  items.push({
    id:       e.id,
    title:    e.title,
    date:     e.date,
    description: e.description,
    url:     `https://www.youtube.com/shorts/${e.id}`,
    embedUrl: `https://www.youtube.com/embed/${e.id}`,
    thumb:    ok ? `assets/social/${e.id}.jpg` : `https://i.ytimg.com/vi/${e.id}/hqdefault.jpg`,
  });
}

// Remove thumbnails for Shorts that dropped out of the list
const keep = new Set(items.map(i => `${i.id}.jpg`));
for (const f of await readdir(IMG_DIR)) {
  if (f.endsWith('.jpg') && !keep.has(f)) await unlink(path.join(IMG_DIR, f));
}

// ── Write data/social.json (only if the content changed) ──
const next = { source, channelId, items };
let prev = null;
try { prev = JSON.parse(await readFile(OUT_JSON, 'utf8')); } catch {}
const same = prev && JSON.stringify({ ...prev, updated: undefined }) === JSON.stringify(next);

if (same) {
  console.log(`No new Shorts (${items.length} in feed).`);
} else {
  await writeFile(OUT_JSON, JSON.stringify({ updated: new Date().toISOString(), ...next }, null, 2) + '\n');
  console.log(`Wrote ${items.length} ${source} to data/social.json`);
}
