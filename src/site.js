// The entire card comes into focus, then softens again as it leaves.
const cards = [...document.querySelectorAll('.project-card')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const MAX_BLUR = 14;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => {const p=clamp(value);return p*p*(3-2*p);};
let revealFrame = 0;
function revealProjects() {
  revealFrame = 0;
  const height = window.innerHeight;
  let active=0;
  for(let i=1;i<cards.length;i++)if(cards[i].getBoundingClientRect().top<height*.42)active=i;
  for (const [index,card] of cards.entries()) {
    const rect = card.getBoundingClientRect();
    const entry = smooth((height * 0.92 - rect.top) / (height * 0.46));
    const exit = 1-smooth((-rect.top-16)/Math.min(rect.height*.55,height*.35));
    const focus = index===active ? Math.min(entry,exit) : 0;
    card.style.setProperty('--reveal-blur', `${((1-focus)*MAX_BLUR).toFixed(2)}px`);
    card.style.setProperty('--reveal-opacity', (0.4+focus*0.6).toFixed(3));
    card.style.setProperty('--reveal-shift', `${((1-focus)*14).toFixed(2)}px`);
  }
}
function scheduleReveal() { if (!revealFrame) revealFrame=requestAnimationFrame(revealProjects); }
function fitPinnedCards() {
  // Measure natural content first, then share one height at this breakpoint.
  for (const card of cards) card.style.minHeight='0px';
  const copyHeight=Math.ceil(Math.max(...cards.map(card=>card.querySelector('.card-copy').offsetHeight)));
  document.documentElement.style.setProperty('--copy-height',`${copyHeight}px`);
  const cardHeight=Math.ceil(Math.max(...cards.map(card=>card.offsetHeight)));
  for (const card of cards) {
    card.style.minHeight=`${cardHeight}px`;
    card.parentElement.classList.toggle('can-pin',cardHeight < innerHeight-64);
  }
  scheduleReveal();
}
if (cards.length) {
  document.documentElement.classList.add('portfolio-scroll');
  fitPinnedCards();
  window.addEventListener('resize',fitPinnedCards,{passive:true});
  document.fonts.ready.then(fitPinnedCards);
  window.addEventListener('scroll',scheduleReveal,{passive:true});
  window.addEventListener('resize',scheduleReveal,{passive:true});
  reducedMotion.addEventListener('change',scheduleReveal);
  revealProjects();
}
