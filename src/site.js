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
function markEndings(element, pattern) {
  for(const mark of element.querySelectorAll('.headline-ending')) {
   const parent=mark.parentNode;
   mark.replaceWith(...mark.childNodes);
   parent.normalize();
  }
  if(document.documentElement.classList.contains('copy-editing')) return;

  // The editor may split a word across several colored text nodes.
  const runs=[];
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
  let offset=0;
  while(walker.nextNode()) {
   const node=walker.currentNode;
   runs.push({node,start:offset,end:offset+node.length});
   offset+=node.length;
  }
  // Work backwards so splitting a text node preserves all earlier offsets.
  const endings=[...element.textContent.matchAll(pattern)];
  for(const ending of endings.reverse()) {
   const end=ending.index+ending[0].length;
   for(const run of runs) {
    const startInNode=Math.max(ending.index,run.start)-run.start;
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
if(document.querySelector('.home-page')) {
 const headline=document.querySelector('html[lang="en"] .hero h1 .hero-line-muted');
 const inscriptionLines=document.querySelectorAll('.calling-inscription > span');
 function markHomepageEndings() {
  if(headline) markEndings(headline,/(?<=\b(?:ide|cre|innov))ate\b/gi);
  for(const line of inscriptionLines) markEndings(line,/(?<=\bwe)bsite\b|(?<=\bbruce)xie\b|(?<=\bport)folio\b/gi);
 }
 document.addEventListener('portfolio-copy-preview',markHomepageEndings);
 if(!headline?.querySelector('.headline-ending')) markHomepageEndings();
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
const wrist=document.querySelector('.calling-wrist');
function createPointingFinger(host) {
 const image=host.querySelector('img');
 // A small transparent margin lets the fingertip extend beyond the original plate.
 const leftMargin=20, topMargin=90;
 const canvas=document.createElement('canvas');
 canvas.width=890+leftMargin; canvas.height=375+topMargin;
 const ctx=canvas.getContext('2d');
 const base=document.createElement('canvas');
 base.width=canvas.width; base.height=canvas.height;
 const fixed=base.getContext('2d');
 const patch=document.createElement('canvas');
 const knuckleX=240, knuckleY=103, bendLength=145;
 patch.width=knuckleX+leftMargin; patch.height=topMargin+280;
 const paint=patch.getContext('2d');
 if(!ctx || !paint || !fixed) return;
 // Trace the transparent cleft between index and middle fingers. The palm,
 // sleeve and three curled fingers stay on the stationary base layer.
 const outline=new Path2D('M0 0 H240 V129 L185 131 L150 145 L130 154 L110 178 L88 206 L0 212 Z');
 const output=paint.createImageData(patch.width,patch.height);
 const restDirection=Math.atan2(.60,-.80);
 // At full extension the index still slopes six degrees down from horizontal.
 const maxExtension=Math.PI-restDirection-6*Math.PI/180;
 const maxCurl=-.47;
 let pixels,active=false,pointerX=0,pointerY=0,lastAngle=NaN;

 // Bend the first 145 source pixels into an arc of the same length. Beyond it,
 // the fingertip follows the arc's tangent as one piece, preserving its shape.
 function pose(angle) {
  const radius=bendLength/angle;
  return {radius,cos:Math.cos(angle),sin:Math.sin(angle),
   endX:-radius*Math.sin(angle),endY:-2*radius*Math.sin(angle/2)**2};
 }
 function draw(angle) {
  const {radius,cos,sin,endX,endY}=pose(angle);
  const sign=Math.sign(radius), data=output.data;
  data.fill(0);
  for(let y=0;y<patch.height;y++) {
   const dy=y-topMargin-knuckleY;
   for(let x=0;x<patch.width;x++) {
    const dx=x-leftMargin-knuckleX;
    const along=(dx-endX)*cos+(dy-endY)*sin;
    let sx,sy;
    if(along<=0) {
     sx=knuckleX-bendLength+along;
     sy=knuckleY-(dx-endX)*sin+(dy-endY)*cos;
    } else {
     sx=knuckleX-radius*Math.atan2(-dx/radius,1+dy/radius);
     sy=knuckleY+sign*(Math.sqrt(dx*dx+(radius+dy)**2)-Math.abs(radius));
    }
    if(sx<0 || sx>=knuckleX || sy<0 || sy>=211) continue;
    const ix=Math.floor(sx), iy=Math.floor(sy), fx=sx-ix, fy=sy-iy;
    const p=(iy*(knuckleX+1)+ix)*4, q=p+(knuckleX+1)*4;
    const a=(1-fx)*(1-fy), b=fx*(1-fy), c=(1-fx)*fy, d=fx*fy;
    const dest=(y*patch.width+x)*4;
    for(let k=0;k<4;k++) data[dest+k]=a*pixels[p+k]+b*pixels[p+4+k]+c*pixels[q+k]+d*pixels[q+4+k];
   }
  }
  paint.putImageData(output,0,0);
  ctx.clearRect(0,0,patch.width,patch.height);
  ctx.drawImage(base,0,0,patch.width,patch.height,0,0,patch.width,patch.height);
  ctx.drawImage(patch,0,0);
  canvas.hidden=false;
  host.classList.add('is-pointing');
 }
 function reset() {
  active=false;
  lastAngle=NaN;
  host.classList.remove('is-pointing');
  canvas.hidden=true;
 }
 // Height of the fingertip's sightline at the dot. Inside the hand's reach,
 // aim by fingertip height so moving across the joint cannot flip the finger.
 function sightlineY(angle,x) {
  const tipX=22-knuckleX, tipY=181-knuckleY;
  let xAtTip=tipX, yAtTip=tipY;
  if(angle!==0) {
   const p=pose(angle), distal=tipX+bendLength;
   xAtTip=p.endX+distal*p.cos-tipY*p.sin;
   yAtTip=p.endY+distal*p.sin+tipY*p.cos;
  }
  return yAtTip-Math.max(0,xAtTip-x)*Math.tan(restDirection+angle);
 }
 function reachableAngle(x,y) {
  if(y<=sightlineY(maxExtension,x)) return maxExtension;
  if(y>=sightlineY(maxCurl,x)) return maxCurl;
  let low=maxCurl, high=maxExtension;
  while(high-low>.0005) {
   const mid=(low+high)/2;
   if(y<sightlineY(mid,x)) low=mid;
   else high=mid;
  }
  return (low+high)/2;
 }
 function aim(x,y) {
  if(host.classList.contains('is-holding')) return;
  active=true; pointerX=x; pointerY=y;
  if(!pixels) return;
  const rect=image.getBoundingClientRect();
  if(!rect.width || rect.bottom<0) return;
  const dx=(x-rect.left)*890/rect.width-knuckleX, dy=(y-rect.top)*375/rect.height-knuckleY;
  const angle=reachableAngle(dx,dy);
  if(Math.abs(lastAngle-angle)<.001) return;
  if(Math.abs(angle)<.001) {reset();return;}
  lastAngle=angle;
  draw(angle);
 }
 function prepare() {
  fixed.translate(leftMargin,topMargin);
  fixed.drawImage(image,0,0);
  fixed.clip(outline); fixed.clearRect(0,0,knuckleX,212);
  ctx.drawImage(base,0,0);
  paint.save();
  paint.clip(outline); paint.drawImage(image,0,0);
  pixels=paint.getImageData(0,0,knuckleX+1,212).data;
  paint.restore();
  host.append(canvas);
  if(active) aim(pointerX,pointerY);
 }
 reset();
 if(image.complete && image.naturalWidth) prepare();
 else image.addEventListener('load',prepare,{once:true});
 return {aim,reset};
}
const pointingFinger=wrist && createPointingFinger(wrist);
const fruitButton=document.querySelector('.calling-fruit');
if(wrist && fruitButton) enableFruitOffering(fruitButton,wrist,pointingFinger);

function enableFruitOffering(button,hand,finger) {
 const source=button.querySelector('img');
 const pocket=hand.querySelector('.calling-grip');
 const fruit=source.cloneNode();
 fruit.className='held-fruit';
 fruit.hidden=true;
 pocket.append(fruit);
 button.hidden=false;
 let drag=null;

 function measureFruit() {
  const box=source.getBoundingClientRect();
  fruit.style.setProperty('--fruit-size',box.width+'px');
  return box;
 }
 function offsetFromGrip(x,y,grip) {
  return `translate(${x-grip.left-grip.width/2}px,${y-grip.top-grip.height/2}px)`;
 }
 function positionDrag() {
  if(drag) fruit.style.transform=offsetFromGrip(drag.x,drag.y,pocket.getBoundingClientRect());
 }
 function releaseCapture() {
  const id=drag?.id;
  drag=null;
  if(id!=null && button.hasPointerCapture(id)) button.releasePointerCapture(id);
 }
 function cancelDrag() {
  if(!drag) return;
  releaseCapture();
  fruit.hidden=true;
  fruit.style.transform='';
  button.classList.remove('is-dragging');
  hand.classList.remove('is-receiving');
 }
 function offer(x,y,grip) {
  releaseCapture();
  finger?.reset();
  fruit.hidden=false;
  fruit.style.transform='';
  hand.classList.remove('is-receiving');
  hand.classList.add('is-holding');
  button.classList.remove('is-dragging');
  button.disabled=true;
  if(reducedMotion.matches) {
   hand.animate([{opacity:1},{opacity:0}],{delay:650,duration:150,fill:'forwards'});
  } else {
   fruit.animate([{transform:offsetFromGrip(x,y,grip)},{transform:'none'}],
    {duration:350,easing:'cubic-bezier(.2,.7,.2,1)'});
   hand.animate([{transform:'translateX(0)'},{transform:'translateX(110%)'}],
    {delay:650,duration:2400,easing:'cubic-bezier(.45,0,.35,1)',fill:'forwards'});
  }
 }
 button.addEventListener('pointerdown',event=>{
  if(event.button!==0 || !event.isPrimary || drag || button.disabled ||
   document.documentElement.classList.contains('copy-editing')) return;
  measureFruit();
  drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,moved:false};
  button.setPointerCapture(event.pointerId);
  positionDrag();
  fruit.hidden=false;
  button.classList.add('is-dragging');
  hand.classList.add('is-receiving');
  moveLens(event);
 });
 button.addEventListener('pointermove',event=>{
  if(drag?.id!==event.pointerId) return;
  drag.x=event.clientX; drag.y=event.clientY;
  if(Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>=4) drag.moved=true;
  positionDrag();
 });
 button.addEventListener('pointerup',event=>{
  if(drag?.id!==event.pointerId) return;
  const grip=pocket.getBoundingClientRect(), cx=event.clientX, cy=event.clientY;
  // Accept a drop across the fingers or palm, then settle it into the grip.
  const palm=hand.getBoundingClientRect();
  const pad=Math.max(12,grip.width*.22);
  if(!drag.moved || (cx>=grip.left-pad && cx<=palm.left+palm.width*.65+pad &&
   cy>=palm.top+palm.height*.12-pad && cy<=grip.bottom+pad)) offer(cx,cy,grip);
  else cancelDrag();
 });
 button.addEventListener('click',event=>{
  if(event.detail!==0 || button.disabled || document.documentElement.classList.contains('copy-editing')) return;
  const box=measureFruit();
  offer(box.left+box.width/2,box.top+box.height/2,pocket.getBoundingClientRect());
 });
 button.addEventListener('lostpointercapture',cancelDrag);
 button.addEventListener('pointercancel',cancelDrag);
 button.addEventListener('keydown',event=>{if(event.key==='Escape') cancelDrag()});
 window.addEventListener('blur',cancelDrag);
 window.addEventListener('pagehide',cancelDrag);
 window.addEventListener('scroll',positionDrag,{passive:true,capture:true});
 window.addEventListener('resize',positionDrag);
}
if(wrist) window.addEventListener('resize',()=>{
 if(lens.classList.contains('is-visible')) pointingFinger?.aim(lensX,lensY);
 else if(reducedMotion.matches && wrist.classList.contains('is-pointing')) pointingFinger?.aim(targetX,targetY);
});
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
 pointingFinger?.reset();
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
 pointingFinger?.aim(lensX,lensY);
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
 if(event.pointerType!=='mouse' || !finePointer.matches ||
    document.documentElement.classList.contains('copy-editing')) {
  hideLens(); return;
 }
 targetX=event.clientX; targetY=event.clientY;
 if(reducedMotion.matches) {
  // The reduced-motion dot is a native cursor with no trailing animation.
  pointingFinger?.aim(targetX,targetY);
  return;
 }
 if(!updateLensTarget(event.target)) return;
 if(!lens.classList.contains('is-visible') || fruitButton?.classList.contains('is-dragging')) {
  cancelAnimationFrame(lensFrame);
  lensFrame=0;
  checkScrolledTarget=false;
  lensX=leadX=targetX; lensY=leadY=targetY;
  lens.style.transform=`translate3d(${lensX}px,${lensY}px,0)`;
  pointingFinger?.aim(lensX,lensY);
  lens.classList.add('is-visible');
  document.documentElement.classList.add('has-dot-cursor');
  return;
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
 if(fruitButton?.classList.contains('is-dragging')) return;
 if(reducedMotion.matches && wrist?.classList.contains('is-pointing')) pointingFinger?.aim(targetX,targetY);
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
