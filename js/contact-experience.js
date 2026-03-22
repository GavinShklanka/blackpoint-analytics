/**
 * Blackpoint Signal Arc — Contact Page Canvas Experience
 * Procedural animation: tapered arc, drifting particles, pulse rings, grid overlay.
 * Scroll-reactive intensity. Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('signal-arc-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Palette ────────────────────────────────────────── */
  const CYAN = { r: 56, g: 189, b: 248 };
  const DEEP_BLUE = { r: 30, g: 64, b: 175 };

  function rgba(c, a) {
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }

  /* ── State ──────────────────────────────────────────── */
  let W, H, heroEl, scrollRatio = 0, time = 0;
  const particles = [];
  const pulses = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    heroEl = canvas.closest('.sa-hero') || canvas.parentElement;
    W = canvas.width = heroEl.offsetWidth;
    H = canvas.height = heroEl.offsetHeight;
    initParticles();
  }

  /* ── Particles ──────────────────────────────────────── */
  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  }

  function updateParticles(speed) {
    for (const p of particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    }
  }

  function drawParticles(globalAlpha) {
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(CYAN, p.alpha * globalAlpha);
      ctx.fill();
    }
    // connection lines
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = rgba(CYAN, 0.06 * (1 - dist / maxDist) * globalAlpha);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Signal Arc ─────────────────────────────────────── */
  function drawSignalArc(progress, globalAlpha) {
    // Origin point: lower-left quadrant
    const ox = W * 0.15;
    const oy = H * 0.75;

    // End point: upper-right area
    const ex = W * 0.82;
    const ey = H * 0.18;

    // Animate arc extension
    const ext = 0.5 + 0.5 * Math.sin(time * 0.0004) * (1 - scrollRatio * 0.5);

    // Control points for a smooth routing vector (not a swoosh)
    const cp1x = ox + (ex - ox) * 0.25;
    const cp1y = oy - H * 0.35 * ext;
    const cp2x = ox + (ex - ox) * 0.7;
    const cp2y = ey + H * 0.15 * ext;

    // Draw tapered arc by sampling the curve
    const steps = 80;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      pts.push({
        x: mt * mt * mt * ox + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * ex,
        y: mt * mt * mt * oy + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * ey,
        t
      });
    }

    // Draw segments with varying width and glow
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      // Taper: thick in middle, thin at ends
      const taper = Math.sin(p1.t * Math.PI);
      const width = taper * 3.5 + 0.3;
      const alpha = taper * 0.7 * globalAlpha;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = rgba(CYAN, alpha);
      ctx.lineWidth = width;
      ctx.shadowColor = rgba(CYAN, alpha * 0.8);
      ctx.shadowBlur = 18 + taper * 12;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Origin point glow
    const originPulse = 0.6 + 0.4 * Math.sin(time * 0.002);
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fillStyle = rgba(CYAN, 0.9 * globalAlpha * originPulse);
    ctx.shadowColor = rgba(CYAN, 0.6);
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Destination node
    const destPulse = 0.5 + 0.5 * Math.sin(time * 0.0015 + 1);
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(DEEP_BLUE, 0.8 * globalAlpha * destPulse);
    ctx.shadowColor = rgba(DEEP_BLUE, 0.4);
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* ── Pulse Rings ────────────────────────────────────── */
  function spawnPulse() {
    pulses.push({
      x: W * 0.15,
      y: H * 0.75,
      radius: 4,
      maxRadius: 100 + Math.random() * 80,
      alpha: 0.5
    });
  }

  function updatePulses() {
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.radius += 0.4;
      p.alpha = 0.5 * (1 - p.radius / p.maxRadius);
      if (p.radius >= p.maxRadius) {
        pulses.splice(i, 1);
      }
    }
  }

  function drawPulses(globalAlpha) {
    for (const p of pulses) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(CYAN, p.alpha * globalAlpha);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* ── Grid Overlay ───────────────────────────────────── */
  function drawGrid(globalAlpha) {
    const spacing = 50;
    const drift = (time * 0.008) % spacing;
    ctx.strokeStyle = rgba(CYAN, 0.03 * globalAlpha);
    ctx.lineWidth = 0.5;

    for (let x = -spacing + drift; x < W + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = -spacing + drift * 0.6; y < H + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  /* ── Ambient Glow ───────────────────────────────────── */
  function drawAmbientGlow(globalAlpha) {
    // Upper-right glow
    const grad1 = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, W * 0.45);
    grad1.addColorStop(0, rgba(CYAN, 0.06 * globalAlpha));
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, W, H);

    // Lower-left glow
    const grad2 = ctx.createRadialGradient(W * 0.15, H * 0.75, 0, W * 0.15, H * 0.75, W * 0.35);
    grad2.addColorStop(0, rgba(DEEP_BLUE, 0.08 * globalAlpha));
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Scroll Tracking ────────────────────────────────── */
  function onScroll() {
    if (!heroEl) return;
    const heroH = heroEl.offsetHeight;
    scrollRatio = Math.min(1, Math.max(0, window.scrollY / heroH));
  }

  /* ── Render Loop ────────────────────────────────────── */
  let lastPulseTime = 0;

  function frame(ts) {
    time = ts;
    const globalAlpha = 1 - scrollRatio * 0.6; // fade as user scrolls

    ctx.clearRect(0, 0, W, H);

    // Speed factor: slows with scroll
    const speed = 1 + (1 - scrollRatio) * 0.5;

    drawGrid(globalAlpha);
    drawAmbientGlow(globalAlpha);

    if (!prefersReducedMotion) {
      updateParticles(speed);
      updatePulses();

      // Spawn pulse every ~3 seconds
      if (ts - lastPulseTime > 3000) {
        spawnPulse();
        lastPulseTime = ts;
      }
    }

    drawParticles(globalAlpha);
    drawSignalArc(0, globalAlpha);
    drawPulses(globalAlpha);

    if (!prefersReducedMotion) {
      requestAnimationFrame(frame);
    }
  }

  /* ── Init ───────────────────────────────────────────── */
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });

  resize();
  onScroll();

  if (prefersReducedMotion) {
    // Render a single static frame
    frame(0);
  } else {
    requestAnimationFrame(frame);
  }
})();
