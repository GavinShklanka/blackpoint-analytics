/* ================================================================
   BLACKPOINT LABS — SITE ENGINE
   Project rendering, filters, mobile nav, scroll animations
   ================================================================ */

(function () {
  'use strict';

  /* ── STATE ───────────────────────────────────────────────────── */
  let projectData = [];
  let activeFilter = 'all';

  /* ── INIT ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollAnimations();
    initActiveNav();

    // Page-specific init
    const page = document.body.dataset.page;
    if (page === 'home') loadFeatured();
    if (page === 'projects') loadProjects();

    // Dynamic year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ── MOBILE NAV ──────────────────────────────────────────────── */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        toggle.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────────────────── */
  function initActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (path.endsWith(href) || (href === 'index.html' && (path.endsWith('/') || path.endsWith('/index.html')))) {
        link.classList.add('active');
      }
    });
  }

  /* ── SCROLL ANIMATIONS ──────────────────────────────────────── */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  /* ── LOAD FEATURED (HOMEPAGE) ────────────────────────────────── */
  async function loadFeatured() {
    const container = document.getElementById('featured-projects');
    if (!container) return;

    try {
      const data = await fetchProjects();
      const featured = data.filter(p => p.featured).sort((a, b) => a.sort_order - b.sort_order);
      container.innerHTML = featured.map(p => renderProjectCard(p)).join('');
      // Re-init scroll animations for dynamically added cards
      initScrollAnimations();
    } catch (e) {
      console.warn('Could not load featured projects:', e);
    }
  }

  /* ── LOAD PROJECTS (PROJECTS PAGE) ───────────────────────────── */
  async function loadProjects() {
    const container = document.getElementById('projects-grid');
    const filterBar = document.getElementById('filter-bar');
    if (!container) return;

    try {
      projectData = await fetchProjects();
      projectData.sort((a, b) => a.sort_order - b.sort_order);

      // Build filter buttons
      if (filterBar) {
        const categories = ['All', ...new Set(projectData.map(p => p.category))];
        filterBar.innerHTML = categories.map(cat => {
          const slug = cat.toLowerCase().replace(/\s+/g, '-');
          return `<button class="filter-btn${cat === 'All' ? ' active' : ''}" data-filter="${slug}">${cat}</button>`;
        }).join('');

        filterBar.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            activeFilter = btn.dataset.filter;
            filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFilteredProjects(container);
          });
        });
      }

      renderFilteredProjects(container);
    } catch (e) {
      console.warn('Could not load projects:', e);
    }
  }

  function renderFilteredProjects(container) {
    const filtered = activeFilter === 'all'
      ? projectData
      : projectData.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === activeFilter);

    container.innerHTML = filtered.map(p => renderProjectCard(p, true)).join('');

    // Re-init scroll animations for new cards
    initScrollAnimations();
  }

  /* ── RENDER PROJECT CARD ─────────────────────────────────────── */
  function renderProjectCard(project, showSummary = false) {
    const tags = project.tags.map(t =>
      `<span class="tag">${t}</span>`
    ).join('');

    const status = project.status === 'in-progress'
      ? '<span class="tag tag--status in-progress">In Progress</span>'
      : '<span class="tag tag--status">Completed</span>';

    const heroImg = project.hero_image
      ? `<img class="card-image" src="${project.hero_image}" alt="${project.title}" loading="lazy">`
      : `<div class="card-image--gradient"></div>`;

    const summary = showSummary
      ? `<p class="card-text">${project.short_summary}</p>`
      : '';

    const liveBtn = project.live_url
      ? `<a href="${project.live_url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Live Demo</a>`
      : '';

    return `
      <article class="card fade-in">
        ${heroImg}
        <div class="card-body">
          <div class="tags" style="margin-bottom: 0.6rem;">
            ${status}
            ${tags}
          </div>
          <h3 class="card-title">${project.title}</h3>
          <p class="card-subtitle">${project.subtitle}</p>
          ${summary}
          <div class="card-actions">
            <a href="projects/${project.slug}.html" class="btn btn-primary btn-sm">View Case Study</a>
            <a href="${project.github_url}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.22.66-.48v-1.7c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53.93 1.53.93.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99.97-2.69-.1-.25-.42-1.27.09-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0112 6.84c.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.51 1.37.19 2.39.1 2.64.6.7.97 1.59.97 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.16.58.68.48A10 10 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>
              GitHub
            </a>
            ${liveBtn}
          </div>
        </div>
      </article>
    `;
  }

  /* ── FETCH PROJECTS ──────────────────────────────────────────── */
  async function fetchProjects() {
    if (projectData.length) return projectData;

    // Handle both root and /projects/ context
    const paths = ['data/projects.json', '../data/projects.json'];
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          projectData = await res.json();
          return projectData;
        }
      } catch (_) { /* try next */ }
    }
    throw new Error('Could not find projects.json');
  }

})();
