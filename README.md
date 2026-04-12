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
| `assets/models/hero.glb` | Drop your custom 3D model here |
| `assets/images/projects/` | Project thumbnail images |
| `assets/images/about/` | Your portrait photo |
| `assets/videos/projects/` | Local video files for projects |

---

## Adding a project

Open `data/projects.js` and add an object to the `PROJECTS` array:

```js
{
  title:       "Your Project Title",
  category:    "creative-tech",        // "creative-tech" | "3d-design" | "photography"
  description: "What it is and how you made it.",
  thumbnail:   "assets/images/projects/your-thumb.jpg",
  videoEmbed:  null,    // YouTube: "https://www.youtube.com/embed/VIDEO_ID"
  videoFile:   null,    // Local:   "assets/videos/projects/demo.mp4"
  link:        "https://...",           // or null
  tags:        ["Unreal Engine", "Python"],
},
```

### Getting a YouTube embed URL
Take a normal YouTube URL like:
`https://www.youtube.com/watch?v=ABC123`

The embed URL is:
`https://www.youtube.com/embed/ABC123`

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

### Common content updates

| What you want to do | Where to edit |
|---|---|
| Add a project | `data/projects.js` — copy an existing entry, fill in your details |
| Edit bio text | `about.html` — find the text and change it directly |
| Change hero tagline | `index.html` — look for `hero__tagline` |
| Update "currently seeking" | `index.html` — look for `Currently seeking` comment |
| Change colors | `css/variables.css` — every color has a comment |
| Update contact email | `js/config.js` → `SITE.email` AND `contact.html` |
| Swap 3D model | Replace `assets/models/hero.glb` with your new export |
| Add your photo | Put image at `assets/images/about/portrait.jpg`, then in `about.html` delete the placeholder div and uncomment the `<img>` tag |
