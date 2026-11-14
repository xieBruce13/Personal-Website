// Align the tank to the cut in the source painting and leave its foreground interactive.
(() => {
  const water = document.querySelector('.calling-water');
  if (!water || !window.Worker) return;
  const hero = water.closest('.hero');
  const figures = hero.querySelector('.calling-figures');
  const glyphs = water.querySelector('pre');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const worker = new Worker(water.dataset.workerSrc);
  const cutInPainting = 807 / 929;
  const shoulderInPainting = 405 / 929;
  let cell = 9;
  let inside = false;
  let inView = false;
  let previousGrid = '';

  function sizeWater() {
    const box = figures.getBoundingClientRect();
    const height = Math.max(0, box.top + box.height * cutInPainting - hero.getBoundingClientRect().top);
    const width = hero.clientWidth;
    water.style.height = height + 'px';
    // Bound the work per frame on wide displays while retaining the original 9px glyphs on phones.
    cell = Math.max(9, Math.ceil(Math.sqrt(width * height / 5200)));
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const depthCells = Math.round(box.height * (cutInPainting - shoulderInPainting) / cell);
    const grid = [cols, rows, depthCells].join(':');
    water.style.setProperty('--water-cell', cell + 'px');
    if (grid !== previousGrid) {
      previousGrid = grid;
      worker.postMessage({type: 'resize', cols, rows, depthCells});
    }
  }
  function visibility() {
    worker.postMessage({type: 'visibility', visible: inView && !document.hidden, still: motion.matches});
  }
  function leave() {
    if (inside) worker.postMessage({type: 'leave'});
    inside = false;
  }
  function stir(event) {
    if (!event.isPrimary || !inView || motion.matches) return;
    const rect = water.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height ||
        event.target.closest('a, button, [contenteditable="true"]') ||
        document.documentElement.classList.contains('copy-editing')) {
      leave();
      return;
    }
    inside = true;
    const gridY = (event.clientY - glyphs.getBoundingClientRect().top) / cell;
    worker.postMessage({type: event.type === 'pointerdown' ? 'press' : 'move', x: x / cell, y: gridY, time: event.timeStamp});
  }
  worker.onmessage = ({data}) => { glyphs.textContent = data; };
  const resize = new ResizeObserver(sizeWater);
  resize.observe(hero);
  resize.observe(figures);
  sizeWater();
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    visibility();
  }).observe(water);
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', visibility);
  hero.addEventListener('pointermove', stir, {passive: true});
  hero.addEventListener('pointerdown', stir, {passive: true});
  hero.addEventListener('pointerleave', leave);
  hero.addEventListener('pointercancel', leave);
  window.addEventListener('pagehide', event => {
    if (event.persisted) worker.postMessage({type: 'visibility', visible: false, still: motion.matches});
    else worker.terminate();
  });
  window.addEventListener('pageshow', event => { if (event.persisted) visibility(); });
})();
