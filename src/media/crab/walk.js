(async () => {
  'use strict';
  const canvas = document.querySelector('.walking-crab');
  if (!canvas) return;
  const study = document.getElementById('crab-study');
  let painting = null;
  if (study) {
    try {
      const legStudy = document.getElementById('crab-legs');
      await Promise.all([study.decode(), legStudy.decode()]);
      painting = createPaintedCrab(study, legStudy);
    } catch (error) {
      console.warn('The painted crab could not load.', error);
      return;
    }
  }
  const ctx = canvas.getContext('2d');
  const surface = document.createElement('canvas');
  const ink = surface.getContext('2d', {willReadFrequently:true});
  if (!ctx || !ink) return;

  // Pigments run from the deepest joints through shell red to the light on the ridges.
  const palette = ['#312c29','#68423b','#914538','#B54935','#ba5945','#c47360','#d29a86'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heading = canvas.parentElement.querySelector('.hero h1');
  const protectedCopy = painting ? [...canvas.parentElement.querySelectorAll('.hero-name,.hero h1,.hero>p')] : [];
  let textBox=null;
  let crabExtent={left:0,right:0,top:0,bottom:0};
  const textClearance=24;
  const holdName = 1.25, gatherTime = 7;
  // Back navigation restores the portfolio where the visitor left it.
  const playOpening = !painting && !reduced.matches && !location.hash &&
    performance.getEntriesByType('navigation')[0]?.type !== 'back_forward';
  let opening = playOpening ? {time:0, layer:document.createElement('canvas'), seed:Math.random()*2**32>>>0} : null;
  const sizeMultiplier = 1.08 * (painting ? 1.15 * 1.5 : 1);
  const maxShellTilt = (painting ? 20 : 40) * Math.PI / 180;
  const trail = canvas.parentElement.querySelector('.crab-footprints');
  let trailLeft=0, trailTop=0;
  trail?.addEventListener('animationend',event=>{
    if(event.animationName==='crab-footprint-fade')event.target.remove();
  });
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const between = (min,max) => min + Math.random() * (max - min);
  const point = (x,y) => ({x,y});
  let width = 0, height = 0, viewHeight = 0, scale = 1, pitch = 6, hitMask = null;
  let pixelRatio = 1, cellPixels = 6, blockPixels = 5;
  let body = point(0,0), angle = -.1, vx = 0, vy = 0, stride = 0;
  let turnSpeed = 0;
  let goal, mode = 'walk', remaining = 0, clock = 0, guard = 0;
  let headlineWalkStart = 0;
  let pointer = null, threat = null, followAfter = 0, frame = 0, last = 0;
  const dotBreak = painting ? 20 : 25;
  let motionSample=null, followTarget=null, followElapsed=0, blockedElapsed=0;
  const claws = [-1,1].map(side => ({side, wrist:0, gape:0}));
  let probeSide=1, probeAt=0, nextProbe=3;

  function resetClaws() {
    for(const claw of claws){claw.wrist=0;claw.gape=0;}
    probeAt=-2;nextProbe=clock+between(2,4);
  }

  function updateClaws(dt,dot) {
    const exploring=mode==='walk'||mode==='pause'||(painting && mode==='follow');
    if(exploring && clock>=nextProbe){
      probeSide=-probeSide;probeAt=clock;nextProbe=clock+between(3.4,6.5);
    }
    // One claw opens slowly to investigate, then pinches shut and releases.
    const t=clock-probeAt;
    const probe=clamp(t/.42,0,1)*clamp((.9-t)/.15,0,1);
    const pinch=clamp((t-.76)/.15,0,1)*clamp((1.24-t)/.26,0,1);
    const target=mode==='follow' && dot ? local(dot) : null;
    for(const claw of claws){
      let wrist=0, gape=.04;
      if(mode==='freeze'){
        wrist=.22;gape=.56;
      }else if(mode==='escape'){
        wrist=-.20;gape=-.13;
      }else if(target){
        const near=clamp((125-Math.hypot(target.x,target.y))/90,0,1);
        const reach=near*clamp(.5+claw.side*target.x/32,0,1);
        wrist=.24*reach;gape+=.38*reach;
        if(painting && claw.side===probeSide){
          wrist+=.12*probe;
          gape+=.42*probe-.32*pinch;
        }
      }else if(exploring && claw.side===probeSide){
        wrist=.17*probe;gape+=.52*probe-(painting ? .32 : .20)*pinch;
      }
      const blend=1-Math.exp(-dt*(gape<claw.gape?17:9));
      claw.wrist+=(wrist-claw.wrist)*blend;
      claw.gape+=(gape-claw.gape)*blend;
    }
  }

  function world(x,y) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return point(body.x + scale*(c*x-s*y), body.y + scale*(s*x+c*y));
  }
  function local(p) {
    const x=(p.x-body.x)/scale, y=(p.y-body.y)/scale, c=Math.cos(angle), s=Math.sin(angle);
    return point(x*c+y*s,-x*s+y*c);
  }

  // The shorter rear pair folds behind the shell, with the toes pointing inward.
  const joints = [
    {hip:[18,-6], tip:[46,-10], bend:-1, upper:18, lower:16},
    {hip:[20,0],  tip:[48,7],   bend:-1, upper:18, lower:16},
    {hip:[18,6],  tip:[42,21],  bend:-1, upper:17, lower:16},
    {hip:[13,10], tip:[16,36],  bend:-1, upper:18, lower:18}
  ];
  const legs = [];
  for (const side of [-1,1]) {
    joints.forEach((joint,index) => legs.push({side,index,joint,
      offset:((index + Number(side > 0)) % 2)*.5 + [0,.022,-.012,.015][index],
      foot:null, swing:null, lift:0, landedAt:0}));
  }
  function restFoot(leg) {
    if (painting) {
      const toe = painting.toes[(leg.side < 0 ? 0 : 4) + leg.index];
      return world(toe.x, toe.y);
    }
    return world(leg.joint.tip[0]*leg.side,leg.joint.tip[1]);
  }

  function leaveFootprint(foot) {
    if(foot.x<0 || foot.x>=width || foot.y<0 || foot.y>=height)return;
    const mark=document.createElement('span');
    mark.style.left=(Math.floor(foot.x/pitch)*pitch-trailLeft)+'px';
    mark.style.top=(Math.floor(foot.y/pitch)*pitch-trailTop)+'px';
    trail.append(mark);
  }

  function limit(p) {
    const mx=Math.min(54*scale,width*.38), my=Math.min(49*scale,viewHeight*.32);
    const top=painting ? 64 : window.scrollY;
    const bottom=painting ? height : top+viewHeight;
    if(painting){
      return outsideCopy(point(clamp(p.x,0,width),clamp(p.y,0,height)),copyObstacle());
    }
    return point(clamp(p.x,mx,width-mx),clamp(p.y,top+my,bottom-my));
  }
  function measureProtectedCopy() {
    const previous=textBox;
    const bounds=protectedCopy.map(element=>{
      const range=document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect();
    });
    textBox={
      left:Math.min(...bounds.map(b=>b.left)),
      right:Math.max(...bounds.map(b=>b.right)),
      top:Math.min(...bounds.map(b=>b.top))+window.scrollY,
      bottom:Math.max(...bounds.map(b=>b.bottom))+window.scrollY
    };
    return !previous || Object.keys(textBox).some(key=>previous[key]!==textBox[key]);
  }
  function copyObstacle(extra=0) {
    if(!textBox)return null;
    const gap=textClearance+extra;
    return {left:textBox.left-crabExtent.right-gap,right:textBox.right+crabExtent.left+gap,
      top:textBox.top-crabExtent.bottom-gap,bottom:textBox.bottom+crabExtent.top+gap};
  }
  function outsideCopy(p,box) {
    if(!box || p.x<=box.left || p.x>=box.right || p.y<=box.top || p.y>=box.bottom)return p;
    const exits=[point(box.left-1,p.y),point(box.right+1,p.y),
      point(p.x,box.top-1),point(p.x,box.bottom+1)];
    return exits.reduce((best,next)=>Math.hypot(next.x-p.x,next.y-p.y)<
      Math.hypot(best.x-p.x,best.y-p.y)?next:best);
  }
  function crossesCopy(a,b,box) {
    let enter=0, leave=1;
    for(const [axis,low,high] of [['x','left','right'],['y','top','bottom']]){
      const delta=b[axis]-a[axis];
      if(Math.abs(delta)<.0001){
        if(a[axis]<=box[low] || a[axis]>=box[high])return false;
        continue;
      }
      const first=(box[low]-a[axis])/delta, last=(box[high]-a[axis])/delta;
      enter=Math.max(enter,Math.min(first,last));
      leave=Math.min(leave,Math.max(first,last));
      if(enter>=leave)return false;
    }
    return leave>0 && enter<1;
  }
  function routeAroundCopy(destination) {
    const box=copyObstacle(16);
    const target=outsideCopy(destination,box);
    if(!box || !crossesCopy(body,target,box))return target;
    // A single rectangle needs only its four corners to find a clear route.
    // Corners can extend beyond an edge when the crab needs room to pass.
    const nodes=[body,target,point(box.left-1,box.top-1),point(box.right+1,box.top-1),
      point(box.right+1,box.bottom+1),point(box.left-1,box.bottom+1)];
    const cost=[0,...Array(5).fill(Infinity)], previous=Array(6).fill(-1), visited=new Set();
    for(let pass=0;pass<nodes.length;pass++){
      let current=-1;
      for(let i=0;i<nodes.length;i++){
        if(!visited.has(i) && (current<0 || cost[i]<cost[current]))current=i;
      }
      if(current<0 || !Number.isFinite(cost[current]))break;
      if(current===1){
        let next=1;
        while(previous[next]>0)next=previous[next];
        return nodes[next];
      }
      visited.add(current);
      for(let next=0;next<nodes.length;next++){
        if(visited.has(next) || crossesCopy(nodes[current],nodes[next],box))continue;
        const distance=cost[current]+Math.hypot(nodes[next].x-nodes[current].x,nodes[next].y-nodes[current].y);
        if(distance<cost[next]){cost[next]=distance;previous[next]=current;}
      }
    }
    return outsideCopy(body,box);
  }
  function keepOutsideCopy() {
    const clear=outsideCopy(body,copyObstacle());
    const dx=clear.x-body.x,dy=clear.y-body.y;
    if(!dx && !dy)return;
    // Move the complete rig so a clearance correction preserves its current pose.
    body=clear;
    if(dx*vx<0)vx=0;
    if(dy*vy<0)vy=0;
    for(const leg of legs){
      leg.foot=point(leg.foot.x+dx,leg.foot.y+dy);
      if(leg.swing){
        leg.swing.from=point(leg.swing.from.x+dx,leg.swing.from.y+dy);
        leg.swing.to=point(leg.swing.to.x+dx,leg.swing.to.y+dy);
      }
    }
  }
  function wander() {
    if(painting){
      const box=copyObstacle(24), origin=outsideCopy(body,box);
      const start=between(0,2*Math.PI);
      const candidates=[];
      for(let i=0;i<8;i++){
        const direction=start+i*Math.PI/4, reach=between(28,48)*scale;
        candidates.push(point(clamp(origin.x+Math.cos(direction)*reach,24,width-24),
          clamp(origin.y+Math.sin(direction)*reach,40,height-24)));
      }
      let best=null, bestScore=-Infinity;
      for(const candidate of candidates){
        const distance=Math.hypot(candidate.x-body.x,candidate.y-body.y);
        if(distance<12*scale || (box && crossesCopy(origin,candidate,box)))continue;
        const visible=candidate.x>=24 && candidate.x<=width-24 &&
          candidate.y>=window.scrollY+64 && candidate.y<=window.scrollY+viewHeight-24;
        const score=distance*(visible?1.4:1)+between(0,8*scale);
        if(score>bestScore){best=candidate;bestScore=score;}
      }
      if(!best && box){
        const corners=[point(box.left-20,box.top-20),point(box.right+20,box.top-20),
          point(box.right+20,box.bottom+20),point(box.left-20,box.bottom+20)];
        for(const corner of corners){
          const distance=Math.hypot(corner.x-body.x,corner.y-body.y);
          if(distance<12*scale || crossesCopy(origin,corner,box))continue;
          if(!best || distance<bestScore){best=corner;bestScore=distance;}
        }
      }
      goal=best || outsideCopy(point(origin.x,origin.y-32*scale),box);
      mode='walk';motionSample=null;
      return;
    }
    const sign = body.x < width*.35 ? 1 : body.x > width*.65 ? -1 : (Math.random()<.5 ? -1 : 1);
    goal=limit(point(body.x+sign*between(.23,.54)*width,body.y+between(-.22,.22)*viewHeight));
    mode='walk';
  }
  function leaveUnreachableTarget() {
    followAfter=Math.max(followAfter,clock+between(5,8));
    followTarget=null;followElapsed=blockedElapsed=0;
    wander();
    nextProbe=clock;
  }
  function checkMovement(dt,dot) {
    if(mode!=='walk' && mode!=='follow'){
      motionSample=null;followTarget=null;followElapsed=blockedElapsed=0;
      return;
    }
    if(mode==='follow' && dot){
      if(!followTarget || Math.hypot(dot.x-followTarget.x,dot.y-followTarget.y)>24){
        followTarget=point(dot.x,dot.y);followElapsed=blockedElapsed=0;
      }
      followElapsed+=dt;
      const possible=outsideCopy(dot,copyObstacle());
      blockedElapsed=Math.hypot(possible.x-dot.x,possible.y-dot.y)>2 ? blockedElapsed+dt : 0;
      if(blockedElapsed>=1.2 || followElapsed>=30){
        leaveUnreachableTarget();
        return;
      }
    }else{
      followTarget=null;followElapsed=blockedElapsed=0;
    }
    if(!motionSample)motionSample={x:body.x,y:body.y,time:clock};
    if(clock-motionSample.time<1.6)return;
    const progress=Math.hypot(body.x-motionSample.x,body.y-motionSample.y);
    motionSample={x:body.x,y:body.y,time:clock};
    if(progress<1.5*scale)leaveUnreachableTarget();
  }
  function startHeadlineWalk(progress=0) {
    // The last letter can wrap onto another line or span several styled elements.
    const words=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
    let lastWord;
    while(words.nextNode()){
      if(words.currentNode.textContent.trim())lastWord=words.currentNode;
    }
    if(!lastWord){wander();return;}
    const end=lastWord.textContent.trimEnd().length;
    const letter=document.createRange();
    letter.setStart(lastWord,end-1);letter.setEnd(lastWord,end);
    const right=letter.getBoundingClientRect().right;
    headlineWalkStart=body.x;
    goal=point(clamp(right,headlineWalkStart,width-54*scale),body.y);
    body.x+=progress*(goal.x-headlineWalkStart);
    plantFeet();
    mode='crossing';
  }
  function plantFeet() {
    for(const leg of legs){leg.foot=restFoot(leg);leg.swing=null;leg.lift=0;leg.landedAt=clock;}
  }
  function resetPose() {
    const opening=canvas.parentElement.querySelector('.hero-water').getBoundingClientRect();
    const y=window.scrollY+clamp(opening.top+opening.height*.52,viewHeight*.2,viewHeight*.8);
    body=limit(point(width*(reduced.matches ? .56 : .74),y));
    angle=-.08;vx=vy=stride=0;guard=0;turnSpeed=0;
    resetClaws();plantFeet();wander();
  }
  function startle(at, hold) {
    threat=at;
    mode='freeze';
    remaining=hold;
  }
  function escape() {
    let dx=body.x-threat.x, dy=body.y-threat.y;
    if(Math.hypot(dx,dy)<scale){dx=body.x>width/2?-1:1;dy=0;}
    const d=Math.hypot(dx,dy)||1, reach=between(50,76)*scale;
    goal=limit(point(body.x+reach*dx/d,body.y+reach*dy/d));
    if (Math.hypot(goal.x-body.x,goal.y-body.y)<15*scale) {
      // At a wall, take the longer available path along the bank.
      const a=limit(point(body.x-reach*dy/d,body.y+reach*dx/d));
      const b=limit(point(body.x+reach*dy/d,body.y-reach*dx/d));
      goal=Math.hypot(a.x-body.x,a.y-body.y)>Math.hypot(b.x-body.x,b.y-body.y)?a:b;
    }
    mode='escape';
    remaining=1.35;
    followAfter=clock+dotBreak;
  }
  function update(dt) {
    clock+=dt;
    if(mode==='crossing' && goal.x-body.x<=1)wander();
    const guided=mode!=='crossing' && pointer && clock>=followAfter;
    const dot=guided ? point(pointer.x,pointer.y+window.scrollY) : null;
    const distance=dot?Math.hypot(dot.x-body.x,dot.y-body.y)/scale:Infinity;
    const alert=mode==='freeze'?1:.28*clamp((39-distance)/26,0,1);
    guard+=(alert-guard)*(1-Math.exp(-dt*(mode==='freeze'?8:4)));
    remaining-=dt;
    if(mode==='freeze' && remaining<=0)escape();
    if(mode==='walk'||mode==='pause'||mode==='follow'){
      if(dot){
        goal=painting ? limit(dot) : dot;mode='follow';
        if(distance<=10)startle(dot,.24);
      }else if(mode==='follow'||(mode==='pause' && remaining<=0))wander();
    }
    if(painting)checkMovement(dt,dot);
    const steering=painting ? routeAroundCopy(goal) : goal;
    const dx=steering.x-body.x,dy=steering.y-body.y;
    const range=Math.hypot(dx,dy);
    const goalRange=painting ? Math.hypot(goal.x-body.x,goal.y-body.y) : range;
    if ((mode==='walk' && goalRange<2.5*scale) || (mode==='escape' && (goalRange<3*scale || remaining<=0))) {
      mode='pause'; remaining=between(.65,1.9);
      nextProbe=clock;
    }
    updateClaws(dt,dot);
    const moving=mode!=='freeze' && mode!=='pause';
    const travelSpeed=mode==='escape'?49:mode==='follow'||mode==='crossing'?23:16+2*Math.sin(clock*.87);
    const speed=moving?Math.min(range*3,travelSpeed*scale/sizeMultiplier):0;
    const smooth=1-Math.exp(-dt*(mode==='freeze'?24:8));
    vx+=((range?dx/range*speed:0)-vx)*smooth;
    vy+=((range?dy/range*speed:0)-vy)*smooth;
    const pace=Math.hypot(vx,vy)/scale;
    if (moving && pace>1) {
      // Opposite travel directions share a pose. Lean on diagonals and
      // ease back to level when crossing a horizontal or vertical bearing.
      const bearing=Math.atan2(vy,vx);
      const targetTilt=maxShellTilt*Math.sin(2*bearing);
      if(painting){
        const targetSpeed=clamp((targetTilt-angle)*2.5,-.32,.32);
        turnSpeed+=(targetSpeed-turnSpeed)*(1-Math.exp(-dt*5));
        angle=clamp(angle+turnSpeed*dt,-maxShellTilt,maxShellTilt);
      }else angle+=clamp(targetTilt-angle,-dt*.95,dt*.95);
    }
    body=point(body.x+vx*dt,painting ? body.y+vy*dt : clamp(body.y+vy*dt,0,height));
    const hz=pace/(painting ? 14 : 12);
    const previous=stride;
    stride+=hz*dt;
    let lifted=legs.filter(leg=>leg.swing).length;
    for (const [index,leg] of legs.entries()) {
      const leading=(vx*Math.cos(angle)+vy*Math.sin(angle))*leg.side>0;
      const stance=painting ? (leading ? .59 : .68) : (leading ? .61 : .65);
      const phase=(stride+leg.offset+1)%1;
      const before=(previous+leg.offset+1)%1;
      const scheduled=phase>=stance && (before<stance || before>phase);
      const recovering=painting && lifted<3 && clock-leg.landedAt>.10 && painting.needsStep(index,local(leg.foot));
      if (!leg.swing && moving && (!painting || lifted<4) && (scheduled || recovering)) {
        const cadence=Math.max(.8,hz);
        const duration=clamp((1-stance)/cadence,.085,painting ? .25 : .32);
        const leadTime=duration+stance/(2*cadence);
        const landing=restFoot(leg);
        landing.x+=vx*leadTime;
        landing.y+=vy*leadTime;
        if(painting){
          const bounded=painting.constrainFoot(index,local(landing));
          Object.assign(landing,world(bounded.x,bounded.y));
        }
        leg.swing={from:leg.foot,to:landing,time:0,duration};
        lifted++;
      }
      if (!leg.swing) continue; // A loaded toe remains at its ground coordinate.
      const step=leg.swing;
      step.time+=dt;
      const t=Math.min(1,step.time/step.duration), blend=t*t*(3-2*t);
      leg.lift=Math.sin(Math.PI*t);
      leg.foot=point(step.from.x+(step.to.x-step.from.x)*blend,step.from.y+(step.to.y-step.from.y)*blend);
      if (t===1) {
        leg.swing=null;leg.lift=0;leg.landedAt=clock;
        if(trail)leaveFootprint(leg.foot);
      }
    }
  }

  // Articulated limbs are drawn first. A separate low-resolution surface
  // samples their silhouettes on the same upright grid as the shell.
  function ellipse(x,y,rx,ry,rotation,color) {
    ink.beginPath();ink.ellipse(x,y,rx,ry,rotation,0,2*Math.PI);
    ink.fillStyle=palette[color];ink.fill();
  }
  function segment(a,b,root,tip,color) {
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
    ink.beginPath();ink.moveTo(a.x+nx*root,a.y+ny*root);
    ink.lineTo(b.x+nx*tip,b.y+ny*tip);ink.lineTo(b.x-nx*tip,b.y-ny*tip);
    ink.lineTo(a.x-nx*root,a.y-ny*root);ink.closePath();
    ink.fillStyle=palette[color];ink.fill();
  }
  function drawLeg(leg) {
    const {joint,side,lift}=leg, foot=local(leg.foot), hip=point(joint.hip[0]*side,joint.hip[1]);
    // Foreshortening pulls the lifted distal leg slightly toward the shell.
    foot.x-=side*1.4*lift;foot.y-=1.3*lift;
    const dx=foot.x-hip.x,dy=foot.y-hip.y,d=Math.max(.1,Math.hypot(dx,dy));
    const along=clamp((joint.upper**2-joint.lower**2+d*d)/(2*d),0,joint.upper);
    const bend=side*joint.bend*Math.sqrt(Math.max(0,joint.upper**2-along**2));
    const knee=point(hip.x+(dx*along-dy*bend)/d,hip.y+(dy*along+dx*bend)/d);
    const ankle=point(knee.x+(foot.x-knee.x)*.62+side*1.6,knee.y+(foot.y-knee.y)*.62-.6);
    segment(hip,knee,2.2,1.7,2);segment(knee,ankle,1.7,1.15,4);
    segment(ankle,foot,leg.index===3?1.9:1.35,.35,1);
  }
  const shell = new Path2D('M-21 -7 L-24 -10 L-20 -10 L-21 -13 L-17 -12 L-17 -15 L-13 -13 L-12 -16 L-8 -14 Q-4 -16 0 -15 Q4 -16 8 -14 L12 -16 L13 -13 L17 -15 L17 -12 L21 -13 L20 -10 L24 -10 L21 -7 Q22 0 17 7 Q12 14 0 15 Q-13 14 -18 7 Q-22 2 -21 -7Z');
  // Each claw arches toward its opposite number. Rotate the movable jaw at its hinge.
  const palm = new Path2D('M2 4 C8 3 6 -5 1 -10 C-2 -14 -8 -17 -12 -14 C-15 -11 -12 -5 -8 -2 C-4 2 -2 5 2 4Z');
  const fixedFinger = new Path2D('M-7 -11 C-11 -18 -20 -20 -25 -16 C-18 -17 -14 -12 -10 -8Z');
  const movingFinger = new Path2D('M0 0 C-4 -2 -9 -3 -15 -2 C-10 -6 -3 -7 1 -4Z');
  // Paint rounded surfaces at sampling resolution. Project a single page light
  // into each part's local axes, including the mirrored, independently moving pincers.
  function shadeShell(outline,x,y,rx,ry,shadowStart=.70) {
    ink.save();ink.clip(outline);ink.translate(x,y);ink.scale(rx,ry);
    const m=ink.getTransform();
    const lx=(-.6*m.a-.8*m.b)/Math.hypot(m.a,m.b);
    const ly=(-.6*m.c-.8*m.d)/Math.hypot(m.c,m.d);
    // Hold the brick-red midtone across most of the dome, with a small lit ridge.
    const tone=ink.createRadialGradient(.52*lx,.52*ly,0,0,0,1.21);
    tone.addColorStop(0,palette[6]);
    tone.addColorStop(.16,palette[5]);
    tone.addColorStop(.33,palette[3]);
    tone.addColorStop(shadowStart,palette[3]);
    tone.addColorStop(shadowStart+.20,palette[2]);
    tone.addColorStop(1,palette[1]);
    ink.fillStyle=tone;ink.fillRect(-2,-2,4,4);
    ink.restore();
  }
  function drawClaw({side,wrist,gape}) {
    const step=Math.sin(2*Math.PI*stride+side*Math.PI/2);
    const effort=clamp(Math.hypot(vx,vy)/(22*scale/sizeMultiplier),0,1);
    const beat=step*effort*(1-guard);
    const idle=Math.sin(clock*1.25+side*.6)*(1-guard);
    const red=palette[3];
    ink.save();ink.scale(side,1);
    ink.translate(18,-7);
    ink.rotate(.05+.10*beat+.035*idle-.12*guard);
    segment(point(0,0),point(13,-7),3.4,2.7,2);
    ink.translate(13,-7);
    ink.rotate(.07-.16*beat+.055*idle+.43*guard);
    segment(point(0,0),point(-4,-7),3.2,2.8,4);
    ellipse(0,0,2.9,2.6,0,5);
    ink.translate(-4,-7);
    // Only the palm and jaws grow. The pivot stays on the end of the forearm.
    ink.rotate(.29+.055*beat-.09*guard+wrist);
    ink.scale(1.18,1.34);
    ink.fillStyle=red;ink.fill(fixedFinger);
    shadeShell(palm,-4.5,-6.5,9.5,12,.56);
    ink.translate(-10,-9);
    ink.rotate(.045*idle+.065*beat-gape);
    const jawTone=ink.createLinearGradient(-11,-4,0,-2);
    jawTone.addColorStop(0,red);jawTone.addColorStop(1,palette[2]);
    ink.fillStyle=jawTone;ink.fill(movingFinger);
    ink.restore();
  }
  function paintAnimal() {
    // The rear legs pass under the shell and the more forward legs.
    for(let i=legs.length-1;i>=0;i--)drawLeg(legs[i]);
    for(const claw of claws)drawClaw(claw);
    shadeShell(shell,0,-1,28,21);
    const underside=ink.createLinearGradient(0,3,0,15);
    underside.addColorStop(0,'#68423b00');
    underside.addColorStop(.5,'#68423b35');
    underside.addColorStop(1,'#68423b99');
    ink.fillStyle=underside;ink.fill(shell);
    for(const side of [-1,1]){
      // Shallow grooves flank the gastric region and break the broad shell reflection.
      ink.beginPath();ink.moveTo(side*8,-10);
      ink.quadraticCurveTo(side*3,-5,side*5,0);
      ink.quadraticCurveTo(side*8,3,side*10,2);
      ink.lineWidth=1.1;ink.strokeStyle='rgba(77,51,44,.40)';ink.stroke();
      ellipse(side*15,-4,1.1,.8,0,5);ellipse(side*12,-10,1.35,.85,0,5);
      const eye=point(side*11,-16.5);
      segment(point(side*9,-12),eye,1.7,1.25,2);
      ellipse(eye.x,eye.y,2,1.7,0,0);
    }
  }
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (painting) {
      const half = canvas.width / 2;
      ctx.save();
      ctx.translate(half, half);
      ctx.scale(scale * pixelRatio, scale * pixelRatio);
      ctx.rotate(angle);
      const bounds=painting.draw(ctx, {legs, claws, guard, stride, clock, local,
        effort:clamp(Math.hypot(vx,vy)/(22*scale), 0, 1)});
      ctx.restore();
      crabExtent={left:(half-bounds.left)/pixelRatio,right:(bounds.right-half)/pixelRatio,
        top:(half-bounds.top)/pixelRatio,bottom:(bounds.bottom-half)/pixelRatio};
      keepOutsideCopy();
      const left = body.x - half / pixelRatio;
      const top = body.y - window.scrollY - half / pixelRatio;
      canvas.style.transform = 'translate('+left+'px,'+top+'px)';
      return;
    }
    ink.setTransform(1,0,0,1,0,0);
    ink.clearRect(0,0,surface.width,surface.height);
    const unit=scale/pitch;
    // Sample only the moving animal's tile. The tile origin is an integer
    // grid cell, so moving it never moves the page's pixel lattice.
    const col=Math.floor(body.x/pitch)-Math.floor(surface.width/2);
    const row=Math.floor(body.y/pitch)-Math.floor(surface.height/2);
    ink.translate(body.x/pitch-col,body.y/pitch-row);ink.scale(unit,unit);ink.rotate(angle);
    paintAnimal();
    const data=ink.getImageData(0,0,surface.width,surface.height).data;
    hitMask={data,col,row};
    const left=col*cellPixels/pixelRatio;
    const top=(row*cellPixels-Math.round(window.scrollY*pixelRatio))/pixelRatio;
    canvas.style.transform='translate('+left+'px,'+top+'px)';
    for(let y=0;y<surface.height;y++)for(let x=0;x<surface.width;x++){
      const i=4*(y*surface.width+x);
      if(data[i+3]<92)continue;
      ctx.fillStyle='rgb('+data[i]+' '+data[i+1]+' '+data[i+2]+')';
      ctx.fillRect(x*cellPixels,y*cellPixels,blockPixels,blockPixels);
    }
  }

  function nameCells(maxColumns) {
    const label='BRUCE XIE';
    const mask=document.createElement('canvas');
    const brush=mask.getContext('2d');
    const style=getComputedStyle(heading);
    const font=size=>style.fontWeight+' '+size+'px '+style.fontFamily;
    brush.font=font(100);
    // Work in crab-grid units so each lit part of a letter is a whole square.
    const size=Math.min(24, (maxColumns-2)*100/brush.measureText(label).width);
    mask.width=maxColumns;
    mask.height=Math.ceil(size*1.4);
    brush.font=font(size);
    brush.fillText(label,0,Math.ceil(size));
    const pixels=brush.getImageData(0,0,mask.width,mask.height).data;
    const cells=[];
    for(let x=0;x<mask.width;x++)for(let y=0;y<mask.height;y++){
      if(pixels[(y*mask.width+x)*4+3]>=85)cells.push(point(x,y));
    }
    return cells;
  }

  function prepareOpening() {
    const title=heading.getBoundingClientRect();
    const letters=nameCells(Math.max(8,Math.floor(title.width/pitch)));
    if(!letters.length){finishOpening();return;}
    const startX=Math.round(title.left/pitch)-letters[0].x;
    const targets=[];
    let top=Infinity,bottom=-Infinity;
    // Measure the silhouette before mixing up the destination cells.
    for(let x=0;x<surface.width;x++)for(let y=0;y<surface.height;y++){
      const i=4*(y*surface.width+x), data=hitMask.data;
      if(data[i+3]<92)continue;
      const target={x:hitMask.col+x,y:hitMask.row+y,
        color:'rgb('+data[i]+' '+data[i+1]+' '+data[i+2]+')'};
      targets.push(target);
      top=Math.min(top,target.y);bottom=Math.max(bottom,target.y);
    }
    if(!targets.length){finishOpening();return;}
    // Align the first leg with the B. Leave four grid rows below the lowest toe.
    const nameTop=Math.min(...letters.map(p=>p.y));
    const nameBottom=Math.max(...letters.map(p=>p.y));
    const startY=Math.floor((title.top+window.scrollY)/pitch)-nameBottom-4;
    const shiftX=startX+letters[0].x-targets[0].x;
    const shiftY=startY+nameBottom-bottom;
    for(const tile of targets){tile.x+=shiftX;tile.y+=shiftY;}
    // Move the live rig by the same whole cells so its first step starts in the final pose.
    body.x+=shiftX*pitch;body.y+=shiftY*pitch;
    plantFeet();wander();draw();
    if(!opening)return;
    const count=Math.max(letters.length,targets.length);
    const tiles=[];
    const left=Math.min(startX+letters[0].x,targets[0].x);
    const right=Math.max(startX+letters[letters.length-1].x,targets[targets.length-1].x);
    top=Math.min(startY+nameTop,top+shiftY);
    bottom=Math.max(startY+nameBottom,bottom+shiftY);
    // A fresh pattern per visit, repeatable if a resize rebuilds this opening.
    let state=opening.seed;
    function random(){
      state=(Math.imul(1664525,state)+1013904223)>>>0;
      return state/2**32;
    }
    for(let i=targets.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [targets[i],targets[j]]=[targets[j],targets[i]];
    }
    for(let i=0;i<count;i++){
      // Some squares share a cell in the denser pose. Both endpoints are filled exactly.
      const from=letters[Math.floor(i*letters.length/count)];
      const to=targets[Math.floor(i*targets.length/count)];
      const x=startX+from.x, y=startY+from.y;
      const bend=Math.min(12,Math.hypot(to.x-x,to.y-y)*.35);
      const controlX=clamp((x+to.x)/2+(random()*2-1)*bend,left,right);
      const controlY=(y+to.y)/2-bend*(.3+1.4*random());
      top=Math.min(top,Math.floor(controlY));
      const start=random()*.34;
      const end=.67+random()*.33;
      tiles.push({x,y,to,controlX,controlY,start,duration:end-start});
    }
    const layer=opening.layer;
    layer.className='crab-opening';
    layer.setAttribute('aria-hidden','true');
    layer.width=(right-left+1)*cellPixels;
    layer.height=(bottom-top+1)*cellPixels;
    layer.style.width=layer.width/pixelRatio+'px';
    layer.style.height=layer.height/pixelRatio+'px';
    layer.style.left=left*pitch-trailLeft+'px';
    layer.style.top=top*pitch-trailTop+'px';
    if(!layer.isConnected)canvas.before(layer);
    Object.assign(opening,{tiles,left,top,ctx:layer.getContext('2d')});
    canvas.hidden=true;
    drawOpening();
  }

  function drawOpening() {
    const {ctx:brush,layer,tiles,left,top,time}=opening;
    brush.clearRect(0,0,layer.width,layer.height);
    const progress=clamp((time-holdName)/gatherTime,0,1);
    for(const tile of tiles){
      const t=clamp((progress-tile.start)/tile.duration,0,1);
      const blend=t*t*(3-2*t), rest=1-blend;
      const x=rest*rest*tile.x+2*rest*blend*tile.controlX+blend*blend*tile.to.x;
      const y=rest*rest*tile.y+2*rest*blend*tile.controlY+blend*blend*tile.to.y;
      brush.fillStyle=tile.to.color;
      brush.fillRect((Math.round(x)-left)*cellPixels,(Math.round(y)-top)*cellPixels,blockPixels,blockPixels);
    }
  }

  function finishOpening() {
    opening?.layer.remove();
    opening=null;
    canvas.hidden=false;
  }

  function placePaintedCrab(enter = false) {
    const space = canvas.parentElement.querySelector('.hero-water').getBoundingClientRect();
    angle = 0;
    body = point(enter ? width + 50*scale : width/2,
      window.scrollY + space.top + space.height/2);
    vx=vy=turnSpeed=0;
    followAfter=0;
    plantFeet();
    goal=limit(point(width*.62,body.y));
    mode='walk';
  }

  function resize() {
    const viewportWidth=document.documentElement.clientWidth, viewportHeight=window.innerHeight;
    if(!viewportWidth||!viewportHeight)return;
    height=Math.max(viewportHeight,document.documentElement.scrollHeight);
    const copyMoved=painting && measureProtectedCopy();
    if (viewportWidth===width && viewportHeight===viewHeight && pixelRatio===window.devicePixelRatio){
      if(copyMoved)draw();
      return;
    }
    const crossingProgress=mode==='crossing'
      ? clamp((body.x-headlineWalkStart)/Math.max(1,goal.x-headlineWalkStart),0,1) : null;
    const oldWidth=width, oldView=viewHeight;
    width=viewportWidth;viewHeight=viewportHeight;
    const pondBounds=canvas.parentElement.querySelector('.hero-water').getBoundingClientRect();
    const baseScale=Math.min(pondBounds.width/155,pondBounds.height/138,4.2);
    scale=baseScale*sizeMultiplier;
    pixelRatio=window.devicePixelRatio||1;
    // Quantize the spacing once in physical pixels. Every block uses exactly
    // the same gap, even when browser zoom makes CSS pixels fractional.
    const restingLegSpan=96*scale;
    cellPixels=Math.max(2,Math.round(restingLegSpan*pixelRatio/50));
    blockPixels=cellPixels-Math.max(1,Math.round(cellPixels*.16));
    pitch=cellPixels/pixelRatio;
    if(trail){
      const ground=trail.getBoundingClientRect();
      trailLeft=ground.left;
      trailTop=ground.top+window.scrollY;
      trail.style.setProperty('--toe-size',(blockPixels/pixelRatio)+'px');
      trail.replaceChildren();
    }
    surface.width=surface.height=2*Math.ceil(60*scale/pitch)+2;
    canvas.width=canvas.height=surface.width*cellPixels;
    canvas.style.width=canvas.style.height=(canvas.width/pixelRatio)+'px';
    if(!oldWidth || reduced.matches || opening || crossingProgress!==null){
      resetPose();
    }else{
      body.x*=width/oldWidth;goal.x*=width/oldWidth;
      body.y=clamp(body.y*viewHeight/oldView,0,height);
      goal.y=clamp(goal.y*viewHeight/oldView,0,height);
      plantFeet();
    }
    if(painting){
      if(!oldWidth || reduced.matches)placePaintedCrab(!reduced.matches);
      draw();
      return;
    }
    draw();
    if(opening || reduced.matches || crossingProgress!==null)prepareOpening();
    if(crossingProgress!==null && !reduced.matches){startHeadlineWalk(crossingProgress);draw();}
  }
  function tick(now) {
    frame=0;
    const dt=last?Math.min(.05,(now-last)/1000):0;
    last=now;
    if(opening){
      opening.time+=dt;
      if(opening.time>=holdName+gatherTime){finishOpening();startHeadlineWalk();draw();}
      else if(opening.time>holdName)drawOpening();
    }else{
      update(dt);draw();
    }
    resume();
  }
  function resume(){
    if(!frame && width && !reduced.matches && !document.hidden)frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;last=0;
    if(document.hidden){pointer=null;return;}
    if(reduced.matches && width){
      trail?.replaceChildren();
      if(opening)finishOpening();
      else if(painting){resetPose();placePaintedCrab();draw();}
      else {resetPose();draw();prepareOpening();}
      return;
    }
    resume();
  }
  function track(event) {
    if(!event.isPrimary || reduced.matches || event.target.closest('[contenteditable="true"]')){pointer=null;return;}
    pointer=point(event.clientX,event.clientY);
  }
  function hitsCrab(at,slop) {
    if(painting){
      const half=canvas.width/2;
      const x=Math.floor((at.x-body.x)*pixelRatio+half);
      const y=Math.floor((at.y-body.y)*pixelRatio+half);
      const radius=Math.ceil(slop*pixelRatio);
      const left=Math.max(0,x-radius), top=Math.max(0,y-radius);
      const w=Math.min(canvas.width,x+radius+1)-left, h=Math.min(canvas.height,y+radius+1)-top;
      if(w<=0 || h<=0)return false;
      const pixels=ctx.getImageData(left,top,w,h).data;
      for(let i=3;i<pixels.length;i+=4)if(pixels[i]>=92)return true;
      return false;
    }
    if(!hitMask)return false;
    const col=Math.floor(at.x/pitch)-hitMask.col;
    const row=Math.floor(at.y/pitch)-hitMask.row;
    const radius=Math.ceil(slop/pitch);
    for(let y=Math.max(0,row-radius);y<=Math.min(surface.height-1,row+radius);y++){
      for(let x=Math.max(0,col-radius);x<=Math.min(surface.width-1,col+radius);x++){
        if(hitMask.data[4*(y*surface.width+x)+3]>=92)return true;
      }
    }
    return false;
  }
  document.addEventListener('pointermove',track,{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    track(event);
    if(opening || !pointer || mode==='crossing' || mode==='freeze' || mode==='escape' ||
      event.target.closest('a,button,input,textarea,select,[role="button"]'))return;
    const at=point(pointer.x,pointer.y+window.scrollY);
    if(hitsCrab(at,event.pointerType==='touch'?8:3))startle(at,.55);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',event=>{
    if(event.pointerType!=='touch')pointer=null;
  });
  document.addEventListener('pointercancel',()=>{pointer=null;});
  window.addEventListener('blur',()=>{pointer=null;});
  window.addEventListener('scroll',()=>{
    if(painting){
      pointer=null;
      if(mode==='follow'){
        mode='pause';remaining=.5;
        goal=point(body.x+vx*.2,body.y+vy*.2);
      }
    }
    if(reduced.matches)draw();
  },{passive:true});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  canvas.parentElement.classList.add('pond-ready');
  resize();
  if(painting)document.fonts.ready.then(resize);
  if(opening && document.fonts.status==='loading')document.fonts.ready.then(()=>{
    if(opening && opening.time<holdName)prepareOpening();
  });
  const observer=new ResizeObserver(resize);
  observer.observe(canvas.parentElement);
  window.addEventListener('resize',resize,{passive:true});
  resume();
})();
