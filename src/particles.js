// Original Canvas 2D particle field. Edit the constants here to tune the effect.
// It spans the viewport with 160px of overscan: no hero/container clipping.
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (ctx) {
    const BLEED = 160;
    const SPACING = 15;
    const HUE_SPEED = 5; // Degrees per second; one gentle cycle every 72 seconds.
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    const toggle = document.getElementById('motion-toggle');
    const pointer = { x: -9999, y: -9999 };
    let width = 0, height = 0, points = [];
    let paused = reduce.matches, time = 0, last = 0, raf = 0;
    let seed = 3491;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = (width + BLEED * 2) * dpr;
      canvas.height = (height + BLEED * 2) * dpr;
      canvas.style.left = canvas.style.top = `${-BLEED}px`;
      canvas.style.width = `${width + BLEED * 2}px`;
      canvas.style.height = `${height + BLEED * 2}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 3491;
      points = [];
      const spacing = width < 680 ? 18 : SPACING;
      // One point per cell, with jitter: even coverage without a visible grid.
      for (let y = -BLEED; y < height + BLEED; y += spacing) {
        for (let x = -BLEED; x < width + BLEED; x += spacing) {
          points.push({
            x: x + random() * spacing, y: y + random() * spacing,
            radius: 0.65 + random() * 0.65, alpha: 0.24 + random() * 0.33,
            phase: random() * Math.PI * 2, hue: random() * 26,
            ox: 0, oy: 0, vx: 0, vy: 0,
          });
        }
      }
      draw(false);
    }

    function draw(advancePhysics) {
      ctx.clearRect(0, 0, width + BLEED * 2, height + BLEED * 2);
      for (const p of points) {
        const x = p.x + Math.sin(time * 0.16 + p.phase) * 4;
        const y = p.y + Math.cos(time * 0.13 + p.phase) * 4;
        if (advancePhysics) {
          const dx = x + p.ox - pointer.x, dy = y + p.oy - pointer.y;
          const distance = Math.hypot(dx, dy);
          // Preserve the original repulsion, spring return, and damping.
          if (distance < 115 && distance > 0.1) {
            const force = (1 - distance / 115) * 2.9;
            p.vx += dx / distance * force;
            p.vy += dy / distance * force;
          }
          p.vx = (p.vx - p.ox * 0.025) * 0.89;
          p.vy = (p.vy - p.oy * 0.025) * 0.89;
          p.ox += p.vx;
          p.oy += p.vy;
        }
        const px = x + p.ox, py = y + p.oy;
        // Soften only the outer viewport edge, not a box around the artwork.
        const edge = Math.max(0, Math.min(1, Math.min(px, py, width - px, height - py) / 22));
        const opacity = p.alpha * edge * edge * (3 - 2 * edge);
        if (opacity < 0.01) continue;
        const hue = (145 + time * HUE_SPEED + p.x / width * 55 + p.y / height * 35 + p.hue) % 360;
        ctx.fillStyle = `hsla(${hue}, 58%, 73%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(px + BLEED, py + BLEED, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick(now) {
      raf = 0;
      if (paused || document.hidden) return;
      if (now - last >= 30) {
        time += Math.min((now - last) / 1000, 0.08);
        last = now;
        draw(true);
      }
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (!raf && !paused && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function sync() {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? toggle.dataset.play : toggle.dataset.pause);
      toggle.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
      if (paused) stop(); else start();
    }
    function leave() { pointer.x = pointer.y = -9999; }
    window.addEventListener('pointermove', event => {
      if (paused || !fine.matches || event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('scroll', leave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    toggle.addEventListener('click', () => { paused = !paused; sync(); });
    reduce.addEventListener('change', () => { paused = reduce.matches; sync(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    resize();
    sync();
  } else {
    canvas.hidden = true;
    document.querySelector('.particle-controls').hidden = true;
  }
}
