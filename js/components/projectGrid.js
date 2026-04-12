// ============================================================
//  PROJECT GRID + MODAL
//  Renders project cards with video-on-hover, category
//  filtering, and a full video modal on click.
// ============================================================

import { PROJECTS } from '../../data/projects.js';

// ── Render the grid ───────────────────────────────────────

export function initProjectGrid(containerSelector = '.projects-grid', featuredOnly = false) {
  const grid = document.querySelector(containerSelector);
  if (!grid) return;

  const list = featuredOnly
    ? PROJECTS.filter(p => p.featured)
    : PROJECTS;

  grid.innerHTML = list.map((project, index) => buildCard(project, index)).join('');

  // Wire up interactions for each card
  grid.querySelectorAll('.project-card').forEach((card, index) => {
    const project = list[index];

    // Click → open modal
    card.addEventListener('click', () => openModal(project));

    // Video-on-hover (only for local videoFile — YouTube can't autoplay this way)
    const video = card.querySelector('.project-card__video-preview');
    if (video) {
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {}); // .catch silences autoplay policy errors
        video.classList.add('playing');
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        video.classList.remove('playing');
      });
    }
  });
}

// ── Build a single project card ───────────────────────────

function buildCard(project) {
  const hasLocalVideo = Boolean(project.videoFile);
  const hasVideo      = hasLocalVideo || Boolean(project.videoEmbed);

  // Thumbnail image
  const thumbImg = project.thumbnail
    ? `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--color-text-faint);font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;position:absolute;inset:0;">No image yet</div>`;

  // Local video element for hover preview (muted, no controls, looped)
  // Only rendered when a local video file is provided.
  // YouTube embeds are NOT previewed on hover — they open in the modal instead.
  const videoPreview = hasLocalVideo
    ? `<video
         class="project-card__video-preview"
         src="${project.videoFile}"
         muted
         loop
         playsinline
         preload="none"
       ></video>`
    : '';

  // Badge: "▶ Video" for embed, "▶ Preview" for local hover
  const badge = hasVideo
    ? `<span class="project-card__badge">${hasLocalVideo ? '▶ Preview' : '▶ Video'}</span>`
    : '';

  return `
    <article class="project-card glass-card" data-category="${project.category}">
      <div class="project-card__thumbnail">
        ${thumbImg}
        ${videoPreview}
        ${badge}
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__desc">${project.description}</p>
        <div class="project-card__tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

// ── Category filter tabs ──────────────────────────────────

export function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterGrid(tab.dataset.filter);
    });
  });
}

function filterGrid(category) {
  document.querySelectorAll('.project-card').forEach(card => {
    const matches = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !matches);
    if (matches) {
      // Restart entry animation
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = '';
    }
  });
}

// ── Modal ─────────────────────────────────────────────────

function openModal(project) {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('modal');
  if (!overlay || !modal) return;

  // Video section
  let videoHTML = '';
  if (project.videoEmbed) {
    videoHTML = `
      <div class="modal__video">
        <iframe src="${project.videoEmbed}" allowfullscreen
          allow="autoplay; fullscreen; picture-in-picture"></iframe>
      </div>`;
  } else if (project.videoFile) {
    videoHTML = `
      <div class="modal__video">
        <video src="${project.videoFile}" controls playsinline autoplay></video>
      </div>`;
  } else if (project.thumbnail) {
    videoHTML = `
      <div class="modal__video" style="max-height:360px;">
        <img src="${project.thumbnail}" alt="${project.title}"
          style="width:100%;height:100%;object-fit:cover;" />
      </div>`;
  }

  const linkHTML = project.link
    ? `<a href="${project.link}" target="_blank" rel="noopener" class="btn btn-primary">View Project ↗</a>`
    : '';

  modal.innerHTML = `
    <button class="modal__close" id="modal-close" aria-label="Close">✕</button>
    ${videoHTML}
    <div class="modal__body">
      <h2 class="modal__title">${project.title}</h2>
      <p class="modal__desc">${project.description}</p>
      <div class="modal__footer">
        <div class="project-card__tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        ${linkHTML}
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  const video  = overlay.querySelector('video');
  if (video) video.pause();
  const iframe = overlay.querySelector('iframe');
  if (iframe) { const s = iframe.src; iframe.src = ''; iframe.src = s; }
}

export function initModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}
