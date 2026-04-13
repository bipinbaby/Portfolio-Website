# Bipin Baby — Portfolio

Personal portfolio website. Cinematic, frosted-glass aesthetic with Three.js interactive hero.

---

## How to run locally

You **cannot** open the HTML files directly by double-clicking — browsers block ES modules
when loading from the filesystem. You need a local server. The easiest way:

**Option A — VS Code (recommended):**
1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Site opens at `http://127.0.0.1:5500`

**Option B — Python (if you have it installed):**
```bash
cd path/to/portfolio
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## File map — what to edit

| File | What it controls |
|---|---|
| `js/config.js` | Site name, tagline, email, social links, particle settings, glass material, lights |
| `data/projects.js` | All projects — add/remove/edit here |
| `css/variables.css` | Colors, fonts, spacing — edit once, updates everywhere |
| `about.html` | Your bio text and skills list |
| `contact.html` | Email address and availability blurb |
| `project.html` | Project detail page template — do not edit; it's driven by `data/projects.js` |
| `assets/models/hero.glb` | Drop your custom 3D model here |
| `assets/images/projects/` | Project thumbnail images + extra gallery images |
| `assets/images/about/` | Your portrait photo |
| `assets/videos/projects/` | Local video files for projects |

---

## Adding a project

Open `data/projects.js` and add an object to the `PROJECTS` array:

```js
{
  slug:        "my-project",           // unique URL ID — lowercase, hyphens only, no spaces
  title:       "Your Project Title",
  featured:    false,                  // true = also shows on the homepage carousel
  category:    "creative-tech",        // "creative-tech" | "3d-design" | "photography"
  year:        "2024",                 // shown on detail page, or null to hide
  role:        "Developer",            // shown on detail page, or null to hide
  description: "Short one-liner shown on the project card.",
  longDescription: [
    // Each string is one paragraph on the detail page.
    // Add as many as you like. If you leave this empty ([]),
    // the short 'description' above is used instead.
    "First paragraph about what it is and why you made it.",
    "Second paragraph about tools, process, or outcome.",
  ],
  images:      [
    // Extra images shown as a gallery on the detail page.
    // Drop files into assets/images/projects/ and list them here.
    // "assets/images/projects/my-project-1.jpg",
    // "assets/images/projects/my-project-2.jpg",
  ],
  thumbnail:   "assets/images/projects/your-thumb.jpg",
  videoEmbed:  null,    // YouTube: "https://www.youtube.com/embed/VIDEO_ID"
  videoFile:   null,    // Local:   "assets/videos/projects/demo.mp4"
  link:        "https://...",  // optional external link shown on detail page, or null
  tags:        ["Unreal Engine", "Python"],
},
```

Clicking the card on the projects page will now take visitors to a dedicated detail page at:
`project.html?slug=my-project`

### Getting a YouTube embed URL
Take a normal YouTube URL like:
`https://www.youtube.com/watch?v=ABC123`

The embed URL is:
`https://www.youtube.com/embed/ABC123`

---

## Filling in project detail pages

Each project has its own detail page at `project.html?slug=your-slug`. The page is generated automatically — you only edit `data/projects.js`.

**On the detail page you can show:**
- A full-width hero video (local `.mp4` or YouTube/Vimeo embed) or image
- Year, Role, and Type metadata
- Long-form description (multiple paragraphs via `longDescription[]`)
- An image gallery (via `images[]`)
- An optional "View on External Site ↗" button (via `link`)

**To write up a project:**
1. Open `data/projects.js`
2. Find the project by its `slug`
3. Fill in `longDescription` with as many paragraphs as you need
4. Add extra images to `assets/images/projects/` and list the paths in `images[]`
5. Set `year` and `role` — or set either to `null` to hide it
6. Set `link` to an external URL if you want a reference button, or `null` to remove it

---

## Adding your photo (About page)

1. Put your portrait at `assets/images/about/portrait.jpg`
2. Open `about.html`
3. Find the comment `<!-- TO ADD YOUR PHOTO -->`
4. Delete the placeholder div
5. Uncomment the `<img>` tag

---

## Adding your 3D model (Hero)

1. Export your mesh from Blender as a `.glb` file
   - File → Export → glTF 2.0 (.glb)
   - Check "Apply Modifiers" and "Include: Selected Objects"
2. Drop it into `assets/models/hero.glb`
3. Open the site — the glass material is applied automatically
4. If the model is too large or small, adjust `HERO_OBJECT.scale` in `js/config.js`

---

## Changing colors

Open `css/variables.css`. Every color has a comment explaining what it affects.
The key ones:

```css
--color-bg:      #080d18;   /* page background */
--color-accent:  #6aacce;   /* glacial blue highlight */
--color-text:    #d8e8f2;   /* main text */
```

---

## Changing particle behavior

Open `js/config.js` → `PARTICLES` section:

```js
count:        4000,    // more = denser cloud
mouseRadius:  3.5,     // larger = mouse affects more particles
repelStrength:0.18,    // larger = stronger push
returnSpeed:  0.04,    // larger = particles snap back faster
```

---

## How to update and deploy

This is the full routine from editing a file to it being live on your site.

### Step 1 — Make your change locally

Edit the relevant file (see **File map** above). Save it.
Preview locally using Live Server in VS Code — right-click `index.html` → Open with Live Server.

---

### Step 2 — Push to GitHub

Open a terminal in the portfolio folder and run these three commands:

```bash
git add .
git commit -m "describe what you changed"
git push
```

That's it. If your site is on **Vercel**, it automatically rebuilds and goes live in ~30 seconds.
If it's on **GitHub Pages**, it rebuilds in ~60 seconds.

---

### Step 3 — Check it live

Visit your live URL and hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear the browser cache.

---

### First-time setup (do this once)

#### A — Create a GitHub repo

1. Go to github.com → click **New repository**
2. Name it `portfolio` (or anything you like)
3. Leave it **Public**, don't add a README
4. Click **Create repository**

In your terminal, inside the portfolio folder:
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git add .
git commit -m "initial commit"
git push -u origin main
```

#### B — Deploy on Vercel (recommended — fastest, zero config)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Select your `portfolio` repo → click **Deploy**
4. Done — Vercel gives you a live URL instantly
5. Every future `git push` auto-deploys — you never touch Vercel again

#### C — Deploy on GitHub Pages (alternative)

1. In your GitHub repo, go to **Settings → Pages**
2. Under *Source*, select **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → **Save**
4. Your site will be at `https://YOUR_USERNAME.github.io/portfolio`

---

---

## Connecting Instagram to the Live Feed

Instagram doesn't have a public RSS feed, but a free third-party service can generate one for you. This takes about 5 minutes.

### Step 1 — Generate an RSS URL for your Instagram

1. Go to [rss.app](https://rss.app) and sign up for a free account
2. Click **Create RSS Feed**
3. Paste your Instagram profile URL, e.g. `https://www.instagram.com/madebybipin`
4. RSS.app generates a feed URL — copy it (looks like `https://rss.app/feeds/xxxxxxxxxxxxxxxx.xml`)
5. Repeat for your second account (`by_a_baby`) if you want both

> **Note:** RSS.app's free plan limits you to a few feeds. If you only want one Instagram tab, pick whichever account you post to most.

---

### Step 2 — Add Instagram to `js/components/socialFeed.js`

Open `js/components/socialFeed.js`. Find the `FEEDS` object near the top (around line 37) and add an Instagram entry:

```js
const FEEDS = {
  artstation: { ... },  // existing
  behance:    { ... },  // existing

  // ← ADD THIS:
  instagram_creative: {
    label: 'Instagram',
    rss:   'https://rss.app/feeds/PASTE_YOUR_URL_HERE.xml',
    link:  'https://www.instagram.com/madebybipin',
  },
};
```

If you want both accounts as separate tabs, add two entries with different keys:

```js
  instagram_creative: {
    label: '@madebybipin',
    rss:   'https://rss.app/feeds/FIRST_FEED_ID.xml',
    link:  'https://www.instagram.com/madebybipin',
  },
  instagram_photo: {
    label: '@by_a_baby',
    rss:   'https://rss.app/feeds/SECOND_FEED_ID.xml',
    link:  'https://www.instagram.com/by_a_baby',
  },
```

---

### Step 3 — Add the tab button in `index.html`

Find the Live Feed section in `index.html` — look for `live-feed__tabs`. Add a button for each Instagram feed you defined:

```html
<button class="live-feed__tab" data-source="instagram_creative">@madebybipin</button>
```

The `data-source` value must exactly match the key you used in the `FEEDS` object.

---

### Step 4 — Test it locally

1. Open Live Server in VS Code
2. Navigate to the homepage → scroll to **Latest Posts**
3. Click your new Instagram tab — posts should load within a few seconds

If no posts appear, open the browser console (F12 → Console) and look for `[socialFeed]` warnings. The most common issue is the RSS URL being wrong — double-check the URL copied from RSS.app.

---

### Common content updates

| What you want to do | Where to edit |
|---|---|
| Add a project | `data/projects.js` — copy an existing entry, fill in your details |
| Write up a project detail page | `data/projects.js` → fill in `longDescription[]`, `images[]`, `year`, `role` |
| Add gallery images to a detail page | Drop files in `assets/images/projects/`, add paths to `images[]` in `data/projects.js` |
| Edit bio text | `about.html` — find the text and change it directly |
| Change hero tagline | `index.html` — look for `hero__tagline` |
| Update "currently seeking" | `index.html` — look for `Currently seeking` comment |
| Change colors | `css/variables.css` — every color has a comment |
| Update contact email | `js/config.js` → `SITE.email` AND `contact.html` |
| Swap 3D model | Replace `assets/models/hero.glb` with your new export |
| Add your photo | Put image at `assets/images/about/portrait.jpg`, then in `about.html` delete the placeholder div and uncomment the `<img>` tag |
