// ============================================================
//  PROJECT DETAIL PAGE
//  Reads ?slug=your-slug from the URL, finds the matching
//  project in data/projects.js, and renders the full detail view.
//
//  You don't need to edit this file.
//  Edit data/projects.js to update project content.
// ============================================================

import { PROJECTS } from '../../data/projects.js';

export function initProjectDetail() {
  const slug    = new URLSearchParams(window.location.search).get('slug');
  const project = PROJECTS.find(p => p.slug === slug);
  const main    = document.getElementById('project-detail-main');
  if (!main) return;

  // ── Project not found ──────────────────────────────────────
  if (!project) {
    main.innerHTML = `
      <div class="container project-not-found">
        <p class="section-label">404</p>
        <h1 class="section-title">Project not found</h1>
        <p style="color:var(--color-text-muted);margin-top:var(--space-sm);">
          That project doesn't exist or may have been renamed.
        </p>
        <a href="projects.html" class="btn btn-primary" style="margin-top:var(--space-md);">
          ← Back to Projects
        </a>
      </div>
    `;
    return;
  }

  // ── Update browser tab title ───────────────────────────────
  document.title = `${project.title} — Bipin Baby`;

  // ── Hero media ─────────────────────────────────────────────
  let heroHTML = '';
  if (project.videoEmbed) {
    // YouTube / Vimeo embed — autoplay muted
    const src = project.videoEmbed.includes('?')
      ? project.videoEmbed + '&autoplay=1&mute=1&loop=1'
      : project.videoEmbed + '?autoplay=1&mute=1&loop=1';
    heroHTML = `<iframe src="${src}" allowfullscreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  title="${project.title}"></iframe>`;
  } else if (project.videoFile) {
    heroHTML = `<video src="${project.videoFile}" autoplay muted loop playsinline></video>`;
  } else if (project.thumbnail) {
    heroHTML = `<img src="${project.thumbnail}" alt="${project.title}" />`;
  } else {
    heroHTML = `<div class="project-detail__hero-placeholder">No media yet</div>`;
  }

  // ── Description paragraphs ─────────────────────────────────
  // Uses longDescription[] if populated, falls back to short description.
  const paras = (project.longDescription && project.longDescription.length > 0)
    ? project.longDescription
    : [project.description];
  const descHTML = paras.map(p => `<p>${p}</p>`).join('');

  // ── Image gallery ──────────────────────────────────────────
  const galleryHTML = (project.images && project.images.length > 0)
    ? `<div class="project-detail__gallery">
        ${project.images.map(src => `
          <div class="project-detail__gallery-item">
            <img src="${src}" alt="${project.title}" loading="lazy" />
          </div>
        `).join('')}
       </div>`
    : '';

  // ── Metadata (year, role, category) ───────────────────────
  const catLabel = {
    'creative-tech': 'Creative Technology',
    '3d-design':     '3D & Design',
    'photography':   'Photography',
  };
  const metaItems = [];
  if (project.year)     metaItems.push({ label: 'Year',     value: project.year });
  if (project.role)     metaItems.push({ label: 'Role',     value: project.role });
  if (project.category) metaItems.push({ label: 'Type',     value: catLabel[project.category] || project.category });

  const metaHTML = metaItems.length
    ? `<div class="project-detail__meta">
        ${metaItems.map(m => `
          <div class="project-detail__meta-item">
            <span class="project-detail__meta-label">${m.label}</span>
            <span class="project-detail__meta-value">${m.value}</span>
          </div>
        `).join('')}
       </div>`
    : '';

  // ── External link ──────────────────────────────────────────
  const linkHTML = project.link
    ? `<a href="${project.link}" target="_blank" rel="noopener" class="btn btn-ghost project-detail__ext-link">
         View on External Site ↗
       </a>`
    : '';

  // ── Assemble page ──────────────────────────────────────────
  main.innerHTML = `
    <div class="project-detail__hero">${heroHTML}</div>

    <div class="project-detail__content">
      <div class="container">

        <a href="projects.html" class="project-back">← All Projects</a>

        ${metaHTML}

        <h1 class="project-detail__title">${project.title}</h1>

        <div class="project-detail__tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>

        <div class="project-detail__body">
          <div class="project-detail__description">${descHTML}</div>
          ${galleryHTML}
          ${linkHTML}
        </div>

      </div>
    </div>
  `;
}
