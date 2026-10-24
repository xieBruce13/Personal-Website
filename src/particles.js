// A single particle number: stable dot positions, a title-relative position,
// and a compact local gathering when the active project changes. No inactive number is painted.
const canvas=document.getElementById('particles');
if(canvas){
 const ctx=canvas.getContext('2d',{alpha:true});
 const hero=document.querySelector('.hero');
 const cards=[...document.querySelectorAll('.project-card')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(pointer: fine)');
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=v=>{const p=clamp(v);return p*p*(3-2*p);};
 const LOCAL_FORM_SECONDS=.48;
 const clusters=[[.16,.32,.085,.12],[.46,.62,.105,.11],[.79,.43,.09,.13],[.91,.78,.075,.09]];
 let width=0,height=0,heroHeight=0,points=[],glyphs=[],active=0;
 let shape=[],formationTime=LOCAL_FORM_SECONDS;
 let targetGather=0,gather=0,time=0,last=0,raf=0,dirty=true,scroll=0,anchorX=0,anchorY=0,outro=0;
 let ending=false,ended=false,endArmed=true,endTime=0,endStart=0,endX=0,endY=0;
 let seed=3491;
 const pointer={x:-9999,y:-9999};
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(random(),.0001)))*Math.cos(Math.PI*2*random());
 function makeGlyphs(){
  const element=cards[0].querySelector('.project-number');
  const size=parseFloat(getComputedStyle(element).fontSize);
  const mask=document.createElement('canvas');
  mask.width=Math.ceil(size*1.18);mask.height=Math.ceil(size);
  const pen=mask.getContext('2d',{willReadFrequently:true});
  if(!pen)return [];
  const spacing=width<=680?2.3:3.1;
  // Every numeral uses the exact same regular grid. Mask alpha selects dots,
  // so settled shapes have even spacing and the leading zero never shuffles.
  return cards.map(card=>{
   pen.clearRect(0,0,mask.width,mask.height);
   pen.font=`600 ${size}px Arial,Helvetica,sans-serif`;
   pen.fillStyle='#fff';pen.textBaseline='alphabetic';
   [...card.dataset.number].forEach((digit,i)=>pen.fillText(digit,i*size*.59,size*.8));
   const pixels=pen.getImageData(0,0,mask.width,mask.height).data;
   const dots=[];
   for(let y=1;y<mask.height;y+=spacing)for(let x=1;x<mask.width;x+=spacing){
    const alpha=pixels[(Math.floor(y)*mask.width+Math.floor(x))*4+3]>190?1:0;
    dots.push({x,y,alpha});
   }
   return dots;
  });
 }
 function measure(){
  dirty=false;scroll=window.scrollY;
  const rects=cards.map(card=>card.getBoundingClientRect());
  let next=0;
  for(let i=1;i<cards.length;i++)if(rects[i].top<height*.42)next=i;
  // Nothing forms in the opening preview. Gathering starts only after scrolling.
  // A threshold starts a complete animation, never a half-formed scroll pose.
  // Separate enter/leave thresholds prevent flicker at the boundary.
  if(scroll<40||rects[0].top>height*.78)targetGather=0;
  else if(rects[0].top<height*.62)targetGather=1;
  const finalRect=rects[rects.length-1];
  if(finalRect.top>=32&&!ending){endArmed=true;ended=false;outro=0;}
  if(ended&&finalRect.bottom>0&&!ending){outro=0;ended=false;}
  if(next!==active){active=next;shape=glyphs[next];formationTime=reduced.matches?LOCAL_FORM_SECONDS:0;}
  const card=cards[active];
  const title=card.querySelector('.card-copy h3').getBoundingClientRect();
  const size=parseFloat(getComputedStyle(card.querySelector('.project-number')).fontSize);
  anchorX=card.querySelector('.number-rail').getBoundingClientRect().left+2;
  // Follow the title's document position exactly: no sticky viewport anchor
  // and no easing of scroll displacement after the numeral has formed.
  anchorY=title.top+title.height/2-size*.44;
  // Start only after the final card leaves its pinned reading position.
  if(endArmed&&!ending&&!ended&&finalRect.top < -24){
   ending=true;endArmed=false;endTime=0;endStart=scroll;endX=anchorX;endY=anchorY;
   document.documentElement.classList.add('ending-scroll');
  }
 }
 function resize(){
  width=innerWidth;height=innerHeight;heroHeight=hero.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  seed=3491;points=[];glyphs=makeGlyphs();
  if(!glyphs.length){canvas.hidden=true;document.body.classList.remove('particles-ready');return;}
  const count=Math.max(glyphs[0].length,Math.min(4200,Math.ceil(width*heroHeight/(width<=680?310:230))));
  for(let i=0;i<count;i++){
   const c=random()<.68?clusters[Math.floor(random()*clusters.length)]:null;
   points.push({x:c?(c[0]+gaussian()*c[2])*width:random()*width,y:c?(c[1]+gaussian()*c[3])*heroHeight:random()*heroHeight,phase:random()*Math.PI*2,radius:.65+random()*.65,alpha:.25+random()*.35,hue:random()*26,ox:0,oy:0,vx:0,vy:0});
  }
  active=0;shape=glyphs[0];formationTime=LOCAL_FORM_SECONDS;
  dirty=true;measure();gather=targetGather;draw(0);start();
 }
 function draw(dt){
  if(dirty)measure();
  if(ending){
   endTime+=dt;
   outro=reduced.matches?1:smooth(endTime/.7);
   const bottom=document.documentElement.scrollHeight-height;
   window.scrollTo({top:endStart+(bottom-endStart)*outro,behavior:'instant'});
   anchorX=endX;anchorY=endY;
   if(outro===1){ending=false;ended=true;document.documentElement.classList.remove('ending-scroll');}
  }
  const move=reduced.matches?1:1-Math.exp(-dt/.2);
  gather+=(targetGather-gather)*move;
  if(Math.abs(gather-targetGather)<.0005)gather=targetGather;
  formationTime=Math.min(LOCAL_FORM_SECONDS,formationTime+dt);
  const formation=reduced.matches?1:smooth(formationTime/LOCAL_FORM_SECONDS);
  canvas.dataset.number=gather>.995&&formation===1&&outro<.01?cards[active].dataset.number:'';
  ctx.clearRect(0,0,width,height);
  const numberAlpha=smooth((gather-.18)/.82);
  for(let i=0;i<points.length;i++){
   const p=points[i],dot=shape[i];
   const fieldX=p.x+Math.sin(time*.16+p.phase)*5;
   const fieldY=p.y-scroll+Math.cos(time*.13+p.phase)*5;
   // Each successor forms from a small cloud surrounding its own glyph.
   // Deterministic offsets keep the dot grid perfectly clean once formed.
   const angle=i*2.399963229728653;
   const spread=(width<=680?30:53)*(.35+((i*37%97)/97)*.65)*(1-formation);
   const localX=dot?anchorX+dot.x+Math.cos(angle)*spread:0;
   const localY=dot?anchorY+dot.y+Math.sin(angle)*spread:0;
   const dispersedX=p.x+Math.sin(time*.16+p.phase)*5;
   const dispersedY=p.y/heroHeight*height+Math.cos(time*.13+p.phase)*5;
   const numberX=dot?fieldX+(localX-fieldX)*gather:fieldX;
   const numberY=dot?fieldY+(localY-fieldY)*gather:fieldY;
   const x=numberX+(dispersedX-numberX)*outro;
   const y=numberY+(dispersedY-numberY)*outro;
   if(dt&&!reduced.matches){
    const dx=x+p.ox-pointer.x,dy=y+p.oy-pointer.y,d=Math.hypot(dx,dy);
    if(d<115&&d>.1){const force=(1-d/115)*2.9*(1-gather+outro)**2;p.vx+=dx/d*force;p.vy+=dy/d*force;}
    p.vx=(p.vx-p.ox*.025)*.89;p.vy=(p.vy-p.oy*.025)*.89;p.ox+=p.vx;p.oy+=p.vy;
   }
   // Cursor displacement fades to zero as the numeral resolves.
   const px=x+p.ox*Math.min(1,1-gather+outro),py=y+p.oy*Math.min(1,1-gather+outro);
   const edge=smooth(Math.min(fieldX/22,(width-fieldX)/22,p.y/22,(heroHeight-p.y)/90));
   const fieldEdge=smooth(Math.min(dispersedX/22,(width-dispersedX)/22,dispersedY/22,(height-dispersedY)/22));
   const alpha=p.alpha*edge*(1-gather)*(1-outro)+p.alpha*fieldEdge*outro+(dot ? dot.alpha*.88*numberAlpha*(.16+.84*formation)*(1-outro) : 0);
   if(alpha<.01||px<0||px>width||py<0||py>height)continue;
   const hue=(145+time*5+p.hue*Math.min(1,1-gather+outro))%360;
   ctx.fillStyle=`hsla(${hue},${58-gather*36}%,${73+gather*8}%,${alpha})`;
   ctx.beginPath();ctx.arc(px,py,p.radius*(1-gather)+(width<=680?.85:1)*gather,0,Math.PI*2);ctx.fill();
  }
 }
 function tick(now){
  raf=0;if(document.hidden)return;
  if(now-last>=16){const dt=Math.max(0,(now-last)/1000);last=now;if(!reduced.matches)time+=Math.min(dt,.1);draw(dt);}
  if(!reduced.matches)raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf&&!document.hidden&&!reduced.matches){last=performance.now();raf=requestAnimationFrame(tick);}}
 function leave(){pointer.x=pointer.y=-9999;}
 if(ctx&&cards.length){
  document.body.classList.add('particles-ready');
  window.addEventListener('pointermove',e=>{if(fine.matches&&!reduced.matches&&e.pointerType!=='touch'){pointer.x=e.clientX;pointer.y=e.clientY;}},{passive:true});
  document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
  window.addEventListener('scroll',()=>{dirty=true;leave();if(reduced.matches)draw(0);},{passive:true});
  const cancelEnding=()=>{if(ending){ending=false;ended=true;outro=1;document.documentElement.classList.remove('ending-scroll');}};
  window.addEventListener('touchstart',cancelEnding,{passive:true});
  window.addEventListener('wheel',e=>{if(e.deltaY<0)cancelEnding();},{passive:true});
  window.addEventListener('keydown',e=>{if(['ArrowUp','PageUp','Home','Escape'].includes(e.key))cancelEnding();});
  window.addEventListener('resize',()=>{cancelEnding();resize();},{passive:true});
  new ResizeObserver(()=>{dirty=true;}).observe(document.querySelector('main'));
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;dirty=true;draw(0);start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  resize();
 }else canvas.hidden=true;
}
