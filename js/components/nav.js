// ============================================================
//  NAV COMPONENT
//  Injects the nav into every page automatically.
//  To add a new nav link, add an entry to the `links` array.
// ============================================================

import { SITE, SOCIALS } from '../config.js';

export function initNav() {
  const navEl = document.querySelector('.nav');
  if (!navEl) return;

  // Determine the current page to highlight the active link
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  const links = [
    { label: 'Home',     href: 'index.html' },
    { label: 'About',    href: 'about.html' },
    { label: 'Projects', href: 'projects.html' },
    { label: 'Contact',  href: 'contact.html' },
  ];

  navEl.innerHTML = `
    <a href="index.html" class="nav-logo">${SITE.name}</a>
    <ul class="nav-links">
      ${links.map(link => `
        <li>
          <a href="${link.href}" ${currentFile === link.href ? 'class="active"' : ''}>
            ${link.label}
          </a>
        </li>
      `).join('')}
    </ul>
  `;
}

// ============================================================
//  FOOTER COMPONENT
//  Call initFooter() on any page that has a <footer class="footer">
// ============================================================

export function initFooter() {
  const footerEl = document.querySelector('.footer');
  if (!footerEl) return;

  const year = new Date().getFullYear();

  footerEl.innerHTML = `
    <div class="container">
      <div class="footer__inner">
        <nav class="footer__socials">
          ${SOCIALS.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join('')}
        </nav>
        <p class="footer__copy">© ${year} ${SITE.name}</p>
      </div>
    </div>
  `;
}
