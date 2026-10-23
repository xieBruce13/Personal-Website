// Original Canvas 2D particle field. Edit the constants here to tune the effect.
// Hero-only field with soft boundaries and overscan for cursor displacement.
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (ctx) {
    const BLEED = 160;
    const SPACING = 15;
    const CLUSTER_SHARE = 0.55; // Remaining particles form a sparse background.
    const clusters = [
      { x: 0.16, y: 0.32, sx: 0.13, sy: 0.19, phase: 0 },
      { x: 0.46, y: 0.62, sx: 0.16, sy: 0.17, phase: 1.8 },
      { x: 0.79, y: 0.43, sx: 0.14, sy: 0.20, phase: 3.4 },
      { x: 0.91, y: 0.78, sx: 0.11, sy: 0.12, phase: 5.1 },
    ];
    const hero = canvas.closest('.hero');
    const HUE_SPEED = 5; // Degrees per second; one gentle cycle every 72 seconds.
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    const pointer = { x: -9999, y: -9999 };
    let width = 0, height = 0, points = [];
    let paused = reduce.matches, visible = true, time = 0, last = 0, raf = 0;
    let seed = 3491;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    function resize() {
      width = hero.clientWidth;
      height = hero.clientHeight;
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
      const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(random(), 0.0001))) * Math.cos(2 * Math.PI * random());
      const count = Math.min(6000, Math.ceil(width * height / (spacing * spacing)));
      // Broad overlapping clouds mixed with a sparse field, not a defined shape.
      for (let i = 0; i < count; i++) {
        const cluster = random() < CLUSTER_SHARE ? clusters[Math.floor(random() * clusters.length)] : null;
        points.push({
          x: cluster ? (cluster.x + gaussian() * cluster.sx) * width : random() * width,
          y: cluster ? (cluster.y + gaussian() * cluster.sy) * height : random() * height,
          cluster,
          radius: 0.65 + random() * 0.65, alpha: 0.24 + random() * 0.33,
          phase: random() * Math.PI * 2, hue: random() * 26,
          ox: 0, oy: 0, vx: 0, vy: 0,
        });
      }
      draw(false);
    }

    function draw(advancePhysics) {
      ctx.clearRect(0, 0, width + BLEED * 2, height + BLEED * 2);
      for (const p of points) {
        const driftX = p.cluster ? Math.sin(time * 0.08 + p.cluster.phase) * Math.min(28, width * 0.025) : 0;
        const driftY = p.cluster ? Math.cos(time * 0.07 + p.cluster.phase) * 18 : 0;
        const x = p.x + driftX + Math.sin(time * 0.16 + p.phase) * 4;
        const y = p.y + driftY + Math.cos(time * 0.13 + p.phase) * 4;
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
        // Fade into black before Selected Work; no visibly sliced particle boundary.
        const edge = Math.max(0, Math.min(1, px / 22, py / 22, (width - px) / 22, (height - py) / 100));
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
      if (paused || document.hidden || !visible) return;
      if (now - last >= 30) {
        time += Math.min((now - last) / 1000, 0.08);
        last = now;
        draw(true);
      }
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (!raf && !paused && !document.hidden && visible) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function sync() {
      if (paused) stop(); else start();
    }
    function leave() { pointer.x = pointer.y = -9999; }
    window.addEventListener('pointermove', event => {
      if (paused || !fine.matches || event.pointerType === 'touch') return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      if (pointer.y < 0 || pointer.y > height) leave();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('scroll', leave, { passive: true });
    new ResizeObserver(resize).observe(hero);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else { stop(); leave(); }
    }).observe(hero);
    reduce.addEventListener('change', () => { paused = reduce.matches; sync(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    resize();
    sync();
  } else {
    canvas.hidden = true;
  }
}
