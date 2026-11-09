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
const hero=document.querySelector('.hero-object');
if(hero){
 // Pointer repulsion moves each glyph; damping settles it without pulling it home.
 const pointer={x:0,y:0,active:false};
 const glyphs=[...hero.querySelectorAll('.letter-position')].map(el=>({el,x:0,y:0,vx:0,vy:0,bounds:null}));
 let frame=0,lastTime=0;
 const measure=()=>glyphs.forEach(g=>{g.bounds=g.el.getBoundingClientRect()});
 function render(g){
  g.el.style.setProperty('--letter-x',`${g.x.toFixed(2)}px`);
  g.el.style.setProperty('--letter-y',`${g.y.toFixed(2)}px`);
  g.el.style.setProperty('--letter-ry',`${(g.x*.12).toFixed(2)}deg`);
  g.el.style.setProperty('--letter-rx',`${(-g.y*.1).toFixed(2)}deg`);
 }
 function tick(time){
  frame=0;
  const dt=Math.min((time-lastTime)/1000||1/60,1/30);lastTime=time;
  const area=hero.getBoundingClientRect();let moving=false;
  for(const g of glyphs){
   const r=g.bounds;if(!r)continue;
   const cx=r.left+r.width/2,cy=r.top+r.height*.5;
   let ax=-g.vx*9,ay=-g.vy*9;
   if(pointer.active){
    let dx=cx+g.x-pointer.x,dy=cy+g.y-pointer.y;
    let distance=Math.hypot(dx,dy);
    if(distance<1){dx=1;dy=-.7;distance=Math.hypot(dx,dy)}
    const radius=Math.max(120,r.width*.6+90);
    const force=2900*Math.pow(Math.max(0,1-distance/radius),1.5);
    ax+=dx/distance*force;ay+=dy/distance*force;
   }
   g.vx+=ax*dt;g.vy+=ay*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;
   // Keep the moving glass inside the hero, away from navigation and headline.
   const half=r.width*(g.el.classList.contains('letter-dot')?.1:.38);
   const loX=Math.max(-155,area.left+half+12-cx),hiX=Math.min(155,area.right-half-12-cx);
   const loY=Math.max(-125,area.top+r.height*.38+16-cy),hiY=Math.min(125,area.bottom-r.height*.38-22-cy);
   const nx=Math.max(loX,Math.min(hiX,g.x)),ny=Math.max(loY,Math.min(hiY,g.y));
   if(nx!==g.x)g.vx=0;if(ny!==g.y)g.vy=0;g.x=nx;g.y=ny;
   if(Math.abs(g.vx)+Math.abs(g.vy)<.05){g.vx=g.vy=0}
   render(g);moving ||= Math.abs(g.vx)+Math.abs(g.vy)>.01;
  }
  if((pointer.active||moving)&&!document.hidden&&!reducedMotion.matches)frame=requestAnimationFrame(tick);
 }
 const wake=()=>{if(!frame&&!reducedMotion.matches){lastTime=performance.now();frame=requestAnimationFrame(tick)}};
 hero.addEventListener('pointermove',event=>{
  if(reducedMotion.matches||!finePointer.matches)return;
  pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;wake();
 },{passive:true});
 // Stop at the current position on exit, scroll or tab changes.
 const stop=()=>{pointer.active=false;cancelAnimationFrame(frame);frame=0;glyphs.forEach(g=>{g.vx=g.vy=0})};
 hero.addEventListener('pointerleave',stop);
 reducedMotion.addEventListener('change',stop);
 finePointer.addEventListener('change',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 window.addEventListener('scroll',()=>{stop();measure()},{passive:true});
 new ResizeObserver(()=>{stop();measure();wake()}).observe(hero);
 measure();
 new IntersectionObserver(entries=>{hero.classList.toggle('is-offscreen',!entries[0].isIntersecting)},{threshold:0}).observe(hero);
 document.addEventListener('visibilitychange',()=>hero.classList.toggle('is-offscreen',document.hidden||hero.getBoundingClientRect().bottom<0));
}

// Decorative pointer feedback never replaces the native cursor or the link label.
const glow=document.createElement('div');glow.className='cursor-glow';glow.setAttribute('aria-hidden','true');document.body.append(glow);
document.addEventListener('pointermove',event=>{
 if(!finePointer.matches||reducedMotion.matches){glow.style.opacity='0';return;}
 glow.style.transform=`translate(${event.clientX}px,${event.clientY}px)`;glow.style.opacity='1';
},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{glow.style.opacity='0'});
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

// Keep the gallery frame still; only the artwork responds to a fine pointer.
const galleryTiles=[...document.querySelectorAll('[data-gallery-tile]')];
galleryTiles.forEach(tile=>{
 let frame=0,point=null;
 const reset=()=>{
  cancelAnimationFrame(frame);frame=0;point=null;tile.classList.remove('is-interacting');
  ['--tile-x','--tile-y'].forEach(key=>tile.style.removeProperty(key));
 };
 tile.addEventListener('pointermove',event=>{
  if(!finePointer.matches||reducedMotion.matches)return;
  point={x:event.clientX,y:event.clientY};
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;if(!point)return;
   const r=tile.getBoundingClientRect();
   const x=Math.max(-1,Math.min(1,(point.x-r.left)/r.width*2-1));
   const y=Math.max(-1,Math.min(1,(point.y-r.top)/r.height*2-1));
   tile.classList.add('is-interacting');
   tile.style.setProperty('--tile-x',`${(x*4).toFixed(2)}px`);
   tile.style.setProperty('--tile-y',`${(y*4).toFixed(2)}px`);
  });
 },{passive:true});
 tile.addEventListener('pointerleave',reset);
 tile.addEventListener('pointercancel',reset);
 tile.addEventListener('focusout',reset);
 reducedMotion.addEventListener('change',reset);
 finePointer.addEventListener('change',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
});

// Homepage films loop only while visible; posters cover reduced motion.
const galleryPreviewVideos=[...document.querySelectorAll('.gallery-preview-video')];
const visibleGalleryPreviewVideos=new WeakSet();
function syncGalleryPreviewVideos(){galleryPreviewVideos.forEach(v=>{
 if(visibleGalleryPreviewVideos.has(v)&&!document.hidden&&!reducedMotion.matches)v.play().catch(()=>{});
 else v.pause();
})}
if(galleryPreviewVideos.length){
 const previewObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.intersectionRatio>=.3)visibleGalleryPreviewVideos.add(e.target);else visibleGalleryPreviewVideos.delete(e.target)});syncGalleryPreviewVideos()},{threshold:[0,.3]});
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
