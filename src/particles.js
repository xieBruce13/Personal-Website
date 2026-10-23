const canvas=document.getElementById('particles');
if(canvas){
 const ctx=canvas.getContext('2d',{alpha:true});
 if(ctx){
  const stage=canvas.parentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
  const toggle=document.getElementById('motion-toggle');
  let w=0,h=0,dpr=1,points=[],projected=[],pointer={x:-9999,y:-9999},paused=reduce.matches,visible=true,frame=0,time=0,last=0,raf=0;
  let seed=3491;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  function init(){
   const rect=stage.getBoundingClientRect();w=rect.width;h=rect.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);seed=3491;points=[];
   const count=w<680?8500:16000;
   for(let i=0;i<count;i++){
    const u=random()*Math.PI*2,v=random()*Math.PI*2;
    const tube=.34+random()*.18;
    const ring=1+.12*Math.cos(u*3);
    const x=(ring+tube*Math.cos(v))*Math.cos(u),y=(ring+tube*Math.cos(v))*Math.sin(u),z=tube*Math.sin(v)+.18*Math.sin(u*2);
    points.push({x,y,z,s:.8+random()*.85,a:.65+random()*.35,ox:0,oy:0,vx:0,vy:0});
   }
   projected=new Array(points.length);draw();
  }
  function draw(){
   ctx.clearRect(0,0,w,h);
   const scale=Math.min(w*.275,h*.38),cx=w*(w<680?.51:.57),cy=h*.45;
   const angle=-.42+Math.sin(time*.14)*.08,rot=time*.065;const ca=Math.cos(angle),sa=Math.sin(angle),cr=Math.cos(rot),sr=Math.sin(rot);
   const tilt=1.04,ct=Math.cos(tilt),st=Math.sin(tilt);
   for(let i=0;i<points.length;i++){
    const p=points[i];const x=p.x*cr-p.z*sr,z=p.x*sr+p.z*cr;
    const yy=p.y*ct-z*st,zz=p.y*st+z*ct;
    const xx=x*ca-yy*sa,yyy=x*sa+yy*ca;
    const perspective=3.7/(3.7-zz*.3);let sx=cx+xx*scale*perspective,sy=cy+yyy*scale*perspective;
    if(!paused){
     const dx=sx+p.ox-pointer.x,dy=sy+p.oy-pointer.y,dist=Math.sqrt(dx*dx+dy*dy),radius=w<680?75:115;
     if(dist<radius&&dist>.1){const force=(1-dist/radius)*2.9;p.vx+=dx/dist*force;p.vy+=dy/dist*force;}
     p.vx=(p.vx-p.ox*.025)*.89;p.vy=(p.vy-p.oy*.025)*.89;p.ox+=p.vx;p.oy+=p.vy;
    }
    const light=Math.max(.15,Math.min(1,(zz+1.65)/3.1));
    projected[i]={x:sx+p.ox,y:sy+p.oy,z:zz,s:p.s*perspective,a:(.45+light*.5)*p.a,light};
   }
   // The field uses original, procedurally generated geometry, not reference-site assets.
   for(let i=0;i<projected.length;i++){
    const p=projected[i];const warmth=Math.max(0,1-Math.abs(p.x-cx+70)/(scale*1.4));
    const r=Math.round(164+p.light*75),g=Math.round(176+p.light*64),b=Math.round(144+p.light*48-warmth*12);
    ctx.fillStyle=`rgba(${r},${g},${b},${p.a})`;ctx.fillRect(p.x,p.y,p.s,p.s);
   }
  }
  function tick(now){raf=0;if(paused||!visible||document.hidden)return;if(now-last>=30){time+=Math.min((now-last)/1000,.05);last=now;draw();}raf=requestAnimationFrame(tick)}
  function start(){if(!raf&&!paused&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick)}}
  function stop(){cancelAnimationFrame(raf);raf=0}
  function sync(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?toggle.dataset.play:toggle.dataset.pause);toggle.firstElementChild.textContent=paused?'▷':'Ⅱ';if(paused)stop();else start()}
  stage.addEventListener('pointermove',e=>{if(paused||!fine.matches)return;const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top});
  stage.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-9999});
  toggle.addEventListener('click',()=>{paused=!paused;sync()});
  reduce.addEventListener('change',()=>{paused=reduce.matches;sync()});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop()},{threshold:0}).observe(stage);
  new ResizeObserver(()=>init()).observe(stage);init();sync();
 }else{canvas.hidden=true;document.querySelector('.particle-controls').hidden=true;}
}
