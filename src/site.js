// The new portfolio uses native scrolling and accessible disclosure controls.
// Motion is decorative and disabled by the visitor's reduced-motion preference.
document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{
 if(detail.open)detail.parentElement.querySelectorAll('details').forEach(other=>{if(other!==detail)other.open=false});
}));

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const mobileNavigation=matchMedia('(max-width: 809px)');
const menuButton=document.querySelector('.menu-toggle');
const menu=document.getElementById('primary-navigation');
if(menuButton&&menu){
 const chinese=document.documentElement.lang==='zh-CN';
 function setMenu(open,restoreFocus=false){
  document.body.classList.toggle('menu-open',open);
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.querySelector('span').textContent=chinese?(open?'关闭':'菜单'):(open?'Close':'Menu');
  document.querySelectorAll('main,body>.contact-band,body>footer').forEach(e=>{e.inert=open});
  if(restoreFocus)menuButton.focus();
 }
 menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
 menu.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false)});
 mobileNavigation.addEventListener('change',()=>setMenu(false));
 document.addEventListener('keydown',event=>{
  if(menuButton.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){setMenu(false,true);return;}
  if(event.key==='Tab'){
   const focusable=[document.querySelector('.identity'),menuButton,...menu.querySelectorAll('a')];
   const first=focusable[0],last=focusable.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
 });
}
const headline=document.querySelector('html[lang="en"] .hero h1 .hero-line-muted');
if(headline) {
 function markHeadlineEndings() {
  for(const mark of headline.querySelectorAll('.headline-ending')) {
   const parent=mark.parentNode;
   mark.replaceWith(...mark.childNodes);
   parent.normalize();
  }
  if(document.documentElement.classList.contains('copy-editing')) return;

  // The editor may split a word across several colored text nodes.
  const runs=[];
  const walker=document.createTreeWalker(headline,NodeFilter.SHOW_TEXT);
  let offset=0;
  while(walker.nextNode()) {
   const node=walker.currentNode;
   runs.push({node,start:offset,end:offset+node.length});
   offset+=node.length;
  }
  // Work backwards so splitting a text node preserves all earlier offsets.
  const words=[...headline.textContent.matchAll(/\b(?:ide|cre|innov)ate\b/gi)];
  for(const word of words.reverse()) {
   const end=word.index+word[0].length;
   for(const run of runs) {
    const startInNode=Math.max(end-3,run.start)-run.start;
    const endInNode=Math.min(end,run.end)-run.start;
    if(startInNode>=endInNode) continue;
    const range=document.createRange();
    range.setStart(run.node,startInNode);
    range.setEnd(run.node,endInNode);
    const mark=document.createElement('span');
    mark.className='headline-ending';
    range.surroundContents(mark);
   }
  }
 }
 document.addEventListener('portfolio-copy-preview',markHeadlineEndings);
 markHeadlineEndings();
}

// Frame the opening on the first cover. Keep the full pond available above it.
const firstCover=document.querySelector('.home-page .work-gallery .project-image');
const navigationType=performance.getEntriesByType('navigation')[0]?.type;
if(firstCover && !location.hash && navigationType!=='back_forward') {
 // On refresh, the browser can restore the old position after scripts run.
 // Resume normal history restoration once this entry has finished loading.
 if(navigationType==='reload' && history.scrollRestoration==='auto') {
  history.scrollRestoration='manual';
  window.addEventListener('pageshow',()=>setTimeout(()=>{history.scrollRestoration='auto'},0),{once:true});
 }
 const coverTop=firstCover.getBoundingClientRect().top;
 const headlineTop=document.querySelector('.hero h1').getBoundingClientRect().top;
 const headerBottom=document.querySelector('.header').getBoundingClientRect().bottom;
 const offset=Math.min(coverTop-window.innerHeight*.735,headlineTop-headerBottom);
 window.scrollTo({top:Math.max(0,window.scrollY+offset),behavior:'instant'});
}

if(document.documentElement.hasAttribute('data-project-page') && !('onpagereveal' in window)) {
 document.body.classList.add('project-slide-fallback');
}
// Back navigation or a motion-preference change can cancel a slide before its
// snapshots are ready. The browser already displays the destination in that case.
function handleSlide(event) {
 event.viewTransition?.ready.catch(error=>{
  if(error.name!=='AbortError' && error.name!=='InvalidStateError') throw error;
 });
}
window.addEventListener('pageswap',handleSlide);
window.addEventListener('pagereveal',handleSlide);

// A trailing dot changes into the project label. Hit testing uses the real pointer.
const lens=document.createElement('div');
lens.className='pointer-lens';
lens.setAttribute('aria-hidden','true');
const lensLabel=document.createElement('span');
lensLabel.textContent=document.documentElement.lang.startsWith('zh')?'查看更多':'see more';
lens.append(lensLabel);
document.body.append(lens);
let lensFrame=0,lastFrame=0,lensX=0,lensY=0,targetX=0,targetY=0,pointedProject=null;
let leadX=0,leadY=0;
let lastLensElement=null,checkScrolledTarget=false;
function setPointedProject(link) {
 if(pointedProject===link) return;
 pointedProject?.classList.remove('has-project-cursor');
 pointedProject=link;
 link?.classList.add('has-project-cursor');
 lens.classList.toggle('over-project',Boolean(link));
}
function hideLens() {
 cancelAnimationFrame(lensFrame);
 lensFrame=0;
 lastLensElement=null;
 checkScrolledTarget=false;
 lens.classList.remove('is-visible');
 document.documentElement.classList.remove('has-dot-cursor');
 setPointedProject(null);
}
function followPointer(now) {
 if(checkScrolledTarget) {
  checkScrolledTarget=false;
  if(!updateLensTarget(document.elementFromPoint(targetX,targetY))) return;
 }
 // Two damped stages reproduce the short initial lag and longer settling tail.
 // Integrating them over elapsed time also keeps the response stable at 120 Hz.
 const dt=Math.max(0,now-lastFrame)/1000;
 const fast=Math.exp(-50*dt), slow=Math.exp(-10*dt);
 const coupling=(slow-fast)/4;
 lastFrame=now;
 lensX=targetX+(lensX-targetX)*slow+(leadX-targetX)*coupling;
 lensY=targetY+(lensY-targetY)*slow+(leadY-targetY)*coupling;
 leadX=targetX+(leadX-targetX)*fast;
 leadY=targetY+(leadY-targetY)*fast;
 const moving=Math.max(Math.hypot(targetX-lensX,targetY-lensY),Math.hypot(targetX-leadX,targetY-leadY))>.25;
 if(!moving) {lensX=leadX=targetX; lensY=leadY=targetY;}
 lens.style.transform=`translate3d(${lensX}px,${lensY}px,0)`;
 lensFrame=moving?requestAnimationFrame(followPointer):0;
}
function updateLensTarget(element) {
 if(element && element===lastLensElement) return true;
 if(!element || element.closest('input,textarea,video:not(.gallery-preview-video),[contenteditable]:not([contenteditable="false"]),aside[aria-label="Portfolio editor"]')) {
  hideLens(); return false;
 }
 setPointedProject(element.closest('.work-gallery a.project-image'));
 lastLensElement=element;
 return true;
}
function moveLens(event) {
 if(event.pointerType!=='mouse' || !finePointer.matches || reducedMotion.matches ||
    document.documentElement.classList.contains('copy-editing')) {
  hideLens(); return;
 }
 if(!updateLensTarget(event.target)) return;
 targetX=event.clientX; targetY=event.clientY;
 if(!lens.classList.contains('is-visible')) {
  lensX=leadX=targetX; lensY=leadY=targetY;
  lens.style.transform=`translate3d(${lensX}px,${lensY}px,0)`;
  lens.classList.add('is-visible');
  document.documentElement.classList.add('has-dot-cursor');
 }
 if(!lensFrame) {lastFrame=performance.now();lensFrame=requestAnimationFrame(followPointer);}
}
document.addEventListener('pointermove',moveLens,{passive:true});
document.addEventListener('pointerover',moveLens,{passive:true});
document.documentElement.addEventListener('pointerleave',hideLens);
document.addEventListener('pointercancel',hideLens);
document.addEventListener('keydown',hideLens);
document.addEventListener('portfolio-copy-preview',hideLens);
window.addEventListener('scroll',()=>{
 if(!lens.classList.contains('is-visible')) return;
 checkScrolledTarget=true;
 if(!lensFrame) {lastFrame=performance.now();lensFrame=requestAnimationFrame(followPointer);}
},{passive:true,capture:true});
window.addEventListener('blur',hideLens);
window.addEventListener('pagehide',hideLens);
document.addEventListener('visibilitychange',()=>{if(document.hidden)hideLens()});
reducedMotion.addEventListener('change',hideLens);
finePointer.addEventListener('change',hideLens);
document.querySelectorAll('.project-image:not(.work-gallery .project-image)').forEach(link=>{
 link.addEventListener('pointermove',event=>{
  if(!finePointer.matches||reducedMotion.matches)return;
  const rect=link.getBoundingClientRect();link.classList.add('is-pointer');
  link.style.setProperty('--cursor-x',`${Math.max(38,Math.min(rect.width-38,event.clientX-rect.left))}px`);
  link.style.setProperty('--cursor-y',`${Math.max(38,Math.min(rect.height-38,event.clientY-rect.top))}px`);
 },{passive:true});
 link.addEventListener('pointerleave',()=>link.classList.remove('is-pointer'));
 link.addEventListener('blur',()=>link.classList.remove('is-pointer'));
});

// Homepage films loop only while visible; posters cover reduced motion.
const galleryPreviewVideos=[...document.querySelectorAll('.gallery-preview-video')];
if(galleryPreviewVideos.length){
 const visible=new Set(),pending=new Set(),started=new Set();
 let nextStart=0,timer=0;
 function queueStart(){
  if(timer || !pending.size) return;
  timer=setTimeout(()=>{
   timer=0;
   const pointed=pointedProject?.querySelector('video');
   const video=pending.has(pointed)?pointed:pending.values().next().value;
   pending.delete(video);
   started.add(video);
   video.play().catch(()=>{});
   // Let the browser present one first frame before opening another decoder.
   nextStart=performance.now()+250;
   queueStart();
  },Math.max(0,nextStart-performance.now()));
 }
 function syncGalleryPreviewVideos(){
  for(const video of galleryPreviewVideos){
   if(visible.has(video) && !document.hidden && !reducedMotion.matches){
    if(!started.has(video)) pending.add(video);
   } else {
    pending.delete(video);
    started.delete(video);
    video.pause();
   }
  }
  if(!pending.size){clearTimeout(timer);timer=0;}
  queueStart();
 }
 const previewObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.intersectionRatio>=.3) visible.add(entry.target);
   else visible.delete(entry.target);
  }
  syncGalleryPreviewVideos();
 },{threshold:[0,.3]});
 galleryPreviewVideos.forEach(v=>{v.muted=true;v.playbackRate=Number(v.dataset.playbackRate)||1;previewObserver.observe(v)});
 document.addEventListener('visibilitychange',syncGalleryPreviewVideos);
 reducedMotion.addEventListener('change',syncGalleryPreviewVideos);
}

// Autoplay only in view. Respect explicit pauses and reduced-motion preferences.
const pisonVideos=[...document.querySelectorAll('.pison-case video, .experimental-case video')];
const videoState=new WeakMap();
function pauseVideo(v){const s=videoState.get(v);if(!v.paused){s.systemPause=true;v.pause()}}
function tryVideo(v){const s=videoState.get(v);if(s.visible&&!s.userPaused&&!document.hidden&&!reducedMotion.matches)v.play().catch(()=>{});}
pisonVideos.forEach(v=>{
 const s={visible:false,userPaused:false,systemPause:false};videoState.set(v,s);
 v.muted=true;v.autoplay=false;
 pauseVideo(v);
 v.addEventListener('pause',()=>{if(s.systemPause)s.systemPause=false;else if(s.visible)s.userPaused=true});
 v.addEventListener('play',()=>{s.userPaused=false;pisonVideos.forEach(other=>{if(other!==v)pauseVideo(other)})});
});
const demoObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{const s=videoState.get(e.target);s.visible=e.intersectionRatio>=.3;if(s.visible)tryVideo(e.target);else pauseVideo(e.target)})},{threshold:[0,.3]});
pisonVideos.forEach(v=>demoObserver.observe(v));
document.addEventListener('visibilitychange',()=>pisonVideos.forEach(v=>document.hidden?pauseVideo(v):tryVideo(v)));
reducedMotion.addEventListener('change',()=>pisonVideos.forEach(v=>reducedMotion.matches?pauseVideo(v):tryVideo(v)));
const landingPreview=document.querySelector('.eye-landing');
if(landingPreview){
 const toggle=landingPreview.querySelector('.eye-playback');
 const films=[...landingPreview.querySelectorAll('video')];
 const phone=matchMedia('(max-width:690px)');
 const current=()=>films[phone.matches?1:0];
 function updateToggle(){toggle.textContent=current().paused?toggle.dataset.play:toggle.dataset.pause}
 for(const film of films){
  film.addEventListener('play',updateToggle);
  film.addEventListener('pause',updateToggle);
 }
 toggle.addEventListener('click',()=>{
  const film=current(), paused=film.paused;
  for(const item of films)videoState.get(item).userPaused=!paused;
  if(paused)film.play().catch(updateToggle);else film.pause();
 });
 phone.addEventListener('change',updateToggle);
 updateToggle();
 toggle.hidden=false;
}
document.querySelectorAll('[data-video-target]').forEach(button=>button.addEventListener('click',async()=>{
 const v=document.getElementById(button.dataset.videoTarget);if(!v)return;
 videoState.get(v).userPaused=false;
 if(button.dataset.videoTime!==undefined){
  if(v.readyState<1){await new Promise(resolve=>{v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',resolve,{once:true});v.load()});}
  if(Number.isFinite(v.duration))v.currentTime=Math.min(Number(button.dataset.videoTime),v.duration);
 }
 v.scrollIntoView({block:'center',behavior:reducedMotion.matches?'instant':'smooth'});
 try{await v.play()}catch{const status=document.getElementById('pison-video-status');if(status)status.textContent=status.dataset.playError}
}));
// Decision reasoning expands in the document, without an overlay or navigation.
const decisionButtons=[...document.querySelectorAll('[data-expand-decision]')];
function closeDecisions(){
 decisionButtons.forEach(button=>{button.setAttribute('aria-expanded','false');document.getElementById(button.dataset.expandDecision).hidden=true});
}
decisionButtons.forEach(button=>button.addEventListener('click',()=>{
 const wasOpen=button.getAttribute('aria-expanded')==='true';
 closeDecisions();
 if(!wasOpen){
  button.setAttribute('aria-expanded','true');
  const panel=document.getElementById(button.dataset.expandDecision);panel.hidden=false;
  requestAnimationFrame(()=>{panel.scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'})});
 }
}));
document.querySelectorAll('[data-close-decision]').forEach(button=>button.addEventListener('click',()=>{
 const trigger=document.getElementById(button.dataset.closeDecision);closeDecisions();trigger.focus({preventScroll:true});
 if(trigger.getBoundingClientRect().top<120)trigger.scrollIntoView({block:'center',behavior:reducedMotion.matches?'instant':'smooth'});
}));

// Scroll-scrubbed narratives, with explicit keyboard controls and a static motion fallback.
const pisonStories=[...document.querySelectorAll('[data-scroll-story]')];
const compactStory=matchMedia('(max-width:900px)');
function showStoryStep(story,step,staticMode=false){
 const count=Number(story.dataset.stepCount);step=Math.max(0,Math.min(count-1,step));
 const changed=Number(story.dataset.activeStep)!==step||story.dataset.static!==String(staticMode);
 story.dataset.activeStep=String(step);story.dataset.static=String(staticMode);
 if(!changed)return;
 story.querySelectorAll('[data-stage-copy]').forEach(el=>{el.hidden=Number(el.dataset.stageCopy)!==step});
 story.querySelectorAll('[data-scene-step]').forEach(button=>{if(Number(button.dataset.sceneStep)===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
 story.querySelectorAll('[data-reveal-at]').forEach(el=>{const show=staticMode||Number(el.dataset.revealAt)<=step;el.classList.toggle('is-revealed',show);el.setAttribute('aria-hidden',String(!show))});
 story.querySelectorAll('[data-tech-panel]').forEach(el=>{el.hidden=Number(el.dataset.techPanel)!==step});
 const thread=story.querySelector('.pison-chat-thread');
 if(thread){
  if(step===0||staticMode)thread.scrollTop=0;
  else {const last=[...thread.querySelectorAll('.is-revealed')].at(-1);if(last)thread.scrollTop=Math.max(0,thread.scrollTop+last.getBoundingClientRect().bottom-thread.getBoundingClientRect().top-thread.clientHeight+12)}
 }
}
let storyTick=false;
function updateStories(){
 storyTick=false;
 pisonStories.forEach(story=>{
  const staticMode=reducedMotion.matches||compactStory.matches;
  if(staticMode){showStoryStep(story,Number(story.dataset.activeStep)||0,true);return}
  const r=story.getBoundingClientRect(),scene=story.querySelector('.pison-sticky-scene');
  const top=parseFloat(getComputedStyle(scene).top)||122;
  const distance=Math.max(1,r.height-scene.offsetHeight);
  const progress=Math.max(0,Math.min(1,(top-r.top)/distance));
  const step=Math.min(Number(story.dataset.stepCount)-1,Math.floor(progress*Number(story.dataset.stepCount)));
  showStoryStep(story,step);
 });
}
function queueStories(){if(!storyTick){storyTick=true;requestAnimationFrame(updateStories)}}
pisonStories.forEach(story=>{
 showStoryStep(story,0,reducedMotion.matches||compactStory.matches);
 new IntersectionObserver(entries=>entries.forEach(e=>story.classList.toggle('is-in-view',e.isIntersecting))).observe(story);
 story.querySelectorAll('[data-scene-step]').forEach(button=>button.addEventListener('click',()=>{
  const step=Number(button.dataset.sceneStep);
  if(reducedMotion.matches||compactStory.matches){showStoryStep(story,step,true);return}
  const scene=story.querySelector('.pison-sticky-scene'),r=story.getBoundingClientRect();
  const top=parseFloat(getComputedStyle(scene).top)||122;
  const distance=Math.max(1,r.height-scene.offsetHeight);
  const target=window.scrollY+r.top-top+distance*((step+.1)/Number(story.dataset.stepCount));
  window.scrollTo({top:target,behavior:'smooth'});
 }));
});
if(pisonStories.length){window.addEventListener('scroll',queueStories,{passive:true});window.addEventListener('resize',()=>{pisonStories.forEach(story=>delete story.dataset.static);queueStories()});reducedMotion.addEventListener('change',queueStories);compactStory.addEventListener('change',queueStories);updateStories()}

// Keep chapter navigation accurate across the film and long conversation scene.
const pisonSections=[...document.querySelectorAll('.pison-case > section[id]')];
if(pisonSections.length){
 let chapterFrame=0;
 const chapterMap={'pison-concept':'pison-solution','pison-experience':'pison-solution'};
 function updateChapter(){
  chapterFrame=0;let active='pison-overview';
  for(const section of pisonSections)if(section.getBoundingClientRect().top<=190)active=chapterMap[section.id]||section.id;
  document.querySelectorAll('.pison-chapters a').forEach(link=>{if(link.hash==='#'+active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
 }
 function queueChapter(){if(!chapterFrame)chapterFrame=requestAnimationFrame(updateChapter)}
 window.addEventListener('scroll',queueChapter,{passive:true});window.addEventListener('resize',queueChapter);updateChapter();
}
