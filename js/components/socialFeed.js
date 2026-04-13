// ============================================================
//  SOCIAL FEED — auto-pulls latest posts from your platforms.
//
//  WHAT WORKS OUT OF THE BOX (no setup needed):
//    ✓ ArtStation  — fetches via RSS
//    ✓ Behance     — fetches via RSS
//
//  INSTAGRAM (requires one-time setup):
//    Instagram removed public RSS. To connect it:
//    See the "Instagram Setup" section at the bottom of this file.
//    Until then, the Instagram tab shows a "View on Instagram" fallback.
//
//  HOW TO CHANGE WHICH PLATFORMS SHOW:
//    Edit the FEEDS object below — comment out or remove entries.
// ============================================================

// ── CORS proxy chain ──────────────────────────────────────
// Proxies are tried in order. If the first one is down or
// rate-limited, the second is used automatically.
// For production, swap these for a Vercel/Netlify serverless
// function (see README.md → Deploying) to avoid rate limits.

const PROXY_CHAIN = [
  {
    buildUrl: url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    // allorigins wraps the response in JSON: { contents: "..." }
    extract:  async res => (await res.json()).contents,
  },
  {
    buildUrl: url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // corsproxy returns the raw response text directly
    extract:  async res => res.text(),
  },
];

// ── Feed sources ──────────────────────────────────────────
const FEEDS = {
  artstation: {
    label: 'ArtStation',
    rss:   'https://www.artstation.com/bipinbabyvarghese.rss',
    link:  'https://bipinbabyvarghese.artstation.com/',
  },
  behance: {
    label: 'Behance',
    rss:   'https://feeds.behance.net/feeds/user?username=bipinbabyvarghese',
    link:  'https://www.behance.net/bipinbabyvarghese',
  },
    instagram_creative: {
    label: 'Instagram',
    rss:   'https://rss.app/feed/PidYslG3yGJCwDOC',
    link:  'https://www.instagram.com/madebybipin',
  },
};

// ── Fetch raw XML text through the proxy chain ────────────

async function fetchViaProxy(url) {
  for (const proxy of PROXY_CHAIN) {
    try {
      const res = await fetch(proxy.buildUrl(url), {
        // Abort after 8 s so a hanging proxy doesn't block the page
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const text = await proxy.extract(res);
      if (text) return text;
    } catch (e) {
      console.warn('[socialFeed] proxy failed:', proxy.buildUrl(url), e.message);
    }
  }
  throw new Error('All proxies failed');
}

// ── Parse an RSS feed into a plain array of items ─────────

async function fetchRSS(url) {
  const text   = await fetchViaProxy(url);
  const parser = new DOMParser();
  const xml    = parser.parseFromString(text, 'text/xml');

  return [...xml.querySelectorAll('item')].slice(0, 8).map(item => ({
    title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
    link:  item.querySelector('link')?.textContent?.trim()  || '#',
    image: extractImage(item),
  }));
}

// ── Extract the best available image from an <item> ───────
// Tries multiple locations in order of reliability:
//  1. <enclosure url="...">     — standard podcast/media enclosure
//  2. <media:thumbnail url="">  — Yahoo Media RSS namespace (ArtStation)
//  3. <media:content url="">    — alternate media namespace form
//  4. Namespace-aware lookup    — catches feeds with explicit xmlns
//  5. <description> img src    — fallback: first <img> in the HTML body
//  6. <content:encoded> img    — Behance sometimes uses this field

function extractImage(item) {
  const MEDIA_NS = 'http://search.yahoo.com/mrss/';

  return (
    item.querySelector('enclosure')?.getAttribute('url')                     ||
    item.querySelector('media\\:thumbnail')?.getAttribute('url')             ||
    item.querySelector('thumbnail')?.getAttribute('url')                     ||
    item.querySelector('media\\:content')?.getAttribute('url')               ||
    item.querySelector('content')?.getAttribute('url')                       ||
    item.getElementsByTagNameNS(MEDIA_NS, 'thumbnail')[0]?.getAttribute('url') ||
    item.getElementsByTagNameNS(MEDIA_NS, 'content')[0]?.getAttribute('url')   ||
    extractFirstImage(item.querySelector('description')?.textContent || '')  ||
    extractFirstImage(
      item.querySelector('content\\:encoded, encoded')?.textContent || ''
    )                                                                         ||
    null
  );
}

// Grab the first <img src="..."> out of an HTML string
function extractFirstImage(html) {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

// ── Render feed cards into the carousel track ─────────────

function renderFeed(items, source, trackEl) {
  if (!items.length) {
    trackEl.innerHTML = `
      <p class="feed-error">
        No posts found.
        <a href="${FEEDS[source].link}" target="_blank" rel="noopener">
          View on ${FEEDS[source].label} ↗
        </a>
      </p>`;
    return;
  }

  trackEl.innerHTML = items.map(item => `
    <a href="${item.link}" target="_blank" rel="noopener"
       class="feed-card glass-card">
      <div class="feed-card__thumb">
        ${item.image
          ? `<img src="${item.image}" alt="${item.title}" loading="lazy" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;
                         justify-content:center;color:var(--color-text-faint);
                         font-size:0.7rem;text-transform:uppercase;
                         letter-spacing:0.1em;">No image</div>`
        }
        <span class="feed-card__source">${FEEDS[source].label}</span>
      </div>
      <div class="feed-card__body">
        <p class="feed-card__title">${item.title}</p>
      </div>
    </a>
  `).join('');
}

// Skeleton placeholders shown while the fetch is in flight
function renderSkeletons(trackEl, count = 6) {
  trackEl.innerHTML = Array.from({ length: count },
    () => `<div class="feed-skeleton"></div>`
  ).join('');
}

// ── Public init function ───────────────────────────────────
// Call this on any page that has a .live-feed__grid element.
//
// Usage: initSocialFeed('artstation')
//   or:  initSocialFeed('behance')
//
// The feed tab buttons call this with their data-source value.

export async function initSocialFeed(source = 'artstation') {
  const trackEl = document.querySelector('.live-feed__grid');
  if (!trackEl) return;

  // Highlight the correct tab
  document.querySelectorAll('.live-feed__tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.source === source);
  });

  // Show skeletons while loading
  renderSkeletons(trackEl);

  const feed = FEEDS[source];
  if (!feed) {
    // Instagram (or unknown source) — show manual fallback
    renderInstagramFallback(trackEl);
    return;
  }

  try {
    const items = await fetchRSS(feed.rss);
    renderFeed(items, source, trackEl);
  } catch (err) {
    console.warn(`[socialFeed] all proxies failed for ${source}:`, err);
    trackEl.innerHTML = `
      <p class="feed-error">
        Couldn't load feed right now.
        <a href="${feed.link}" target="_blank" rel="noopener">
          View on ${feed.label} ↗
        </a>
      </p>`;
  }
}

// ── Instagram fallback ────────────────────────────────────
// Shown until the Instagram API is connected (see setup below)

function renderInstagramFallback(trackEl) {
  trackEl.innerHTML = `
    <div class="feed-error">
      <p style="margin-bottom:var(--space-sm);">Instagram requires a one-time API setup.</p>
      <a href="https://www.instagram.com/madebybipin"
         target="_blank" rel="noopener"
         class="btn btn-ghost">View @madebybipin ↗</a>
      &nbsp;
      <a href="https://www.instagram.com/by_a_baby"
         target="_blank" rel="noopener"
         class="btn btn-ghost">View @by_a_baby ↗</a>
    </div>
  `;
}

// ============================================================
//  INSTAGRAM SETUP (one-time, ~15 minutes)
//  ============================================================
//
//  Instagram's Basic Display API lets you pull your own posts.
//  Here's how to connect it:
//
//  1. Go to developers.facebook.com → My Apps → Create App
//     → Consumer → Add "Instagram Basic Display" product
//
//  2. In the app dashboard:
//     - Add your Instagram account as a test user
//     - Get a short-lived token from the API explorer
//     - Exchange it for a long-lived token (60-day expiry)
//
//  3. Store the token in a Vercel Environment Variable called
//     INSTAGRAM_TOKEN (so it's never in your public code)
//
//  4. Create a Vercel serverless function at:
//     api/instagram.js  ← (file already stubbed out for you)
//
//  5. In this file, change initSocialFeed to call:
//     fetch('/api/instagram')
//     instead of fetchViaProxy for Instagram tabs.
//
//  Token refresh: Long-lived tokens last 60 days and can be
//  refreshed automatically. The api/instagram.js stub handles this.
// ============================================================
