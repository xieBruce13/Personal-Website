// Articulated cutouts in the coordinates of Bruce's supplied 1494 × 1052 study.
// Keep the painted highlights inside each silhouette as its joints move.
function createPaintedCrab(image, legImage) {
  const center = {x: 747, y: 548};
  const texelsPerUnit = 14;
  const legShapes = [
    {hip:[443,529], toe:[235,132], edge:'M443 529 Q420 567 367 527 Q296 507 234 467 Q217 460 209 435 Q169 401 140 332 Q112 288 116 252 Q120 191 182 155 Q211 138 235 132 Q204 171 183 212 L162 249 Q164 271 196 307 L241 385 Q278 421 322 443 L456 489Z'},
    {hip:[491,619], toe:[114,337], edge:'M494 643 Q453 649 409 632 L259 605 Q224 604 213 581 Q161 566 114 522 Q80 499 73 469 Q64 424 85 384 Q97 354 114 336 Q111 385 115 443 Q119 453 140 461 Q184 487 233 531 L245 541 Q251 528 261 532 Q319 550 380 559 Q438 563 474 589 L505 607Z'},
    {hip:[547,684], toe:[127,877], edge:'M564 711 Q531 723 470 726 L311 720 Q295 720 283 708 Q239 739 213 747 Q195 765 170 775 Q148 803 133 875 Q119 878 112 855 Q104 825 119 782 Q127 750 154 732 Q188 705 216 685 Q251 663 285 652 Q328 642 368 649 Q430 643 486 663 Q516 663 553 679Z'},
    {hip:[615,741], toe:[393,1005], edge:'M633 759 Q615 784 550 797 Q485 812 435 812 L411 805 Q398 845 373 865 Q375 885 356 901 Q350 940 367 974 L393 1005 Q360 1004 340 984 Q298 949 301 911 Q302 873 326 830 Q356 769 403 745 Q449 723 497 727 Q572 718 614 723Z'},
    {hip:[1044,543], toe:[1285,169], edge:'M1020 538 Q1091 503 1152 481 L1210 451 Q1222 418 1264 386 L1312 322 Q1331 298 1334 275 Q1330 250 1313 229 L1284 167 Q1329 184 1363 240 Q1395 285 1384 326 Q1379 357 1353 401 L1304 461 Q1293 491 1268 504 L1157 548 Q1097 583 1034 581Z'},
    {hip:[993,636], toe:[1426,663], edge:'M980 625 Q1057 595 1115 580 Q1181 559 1237 563 Q1309 563 1363 583 Q1411 598 1427 657 L1427 664 Q1399 637 1371 628 Q1316 618 1240 614 Q1224 630 1200 633 L1060 655 Q1025 664 974 662Z'},
    {hip:[945,700], toe:[1301,917], edge:'M919 687 Q981 669 1046 678 Q1117 677 1171 691 Q1201 699 1225 721 Q1280 752 1306 807 Q1332 864 1303 919 Q1291 869 1271 843 L1212 788 Q1192 778 1176 752 Q1155 765 1131 757 L1000 734 Q946 733 921 716Z'},
    {hip:[868,747], toe:[1005,1015], edge:'M851 734 Q896 729 957 741 Q1038 745 1072 779 Q1103 799 1110 850 L1119 918 Q1116 965 1080 990 Q1050 1011 1004 1017 Q1044 990 1057 958 Q1066 933 1060 908 L1046 872 Q1042 850 1048 828 L1011 822 Q929 809 875 788 Q847 777 842 759Z'}
  ];
  const clawShapes = [
    {hip:[431,497], elbow:[272,319], wrist:[355,217], hinge:[490,165], tip:[710,50],
      arm:'M418 531 Q384 515 356 486 Q310 454 277 403 Q249 367 242 332 Q232 289 257 252 Q285 213 316 194 L334 202 Q339 172 371 146 Q415 117 465 94 L526 61 Q548 52 578 47 Q634 28 683 39 L713 51 Q652 57 608 78 L568 96 Q544 115 531 126 L505 145 Q474 183 459 213 Q440 255 412 270 L387 278 Q374 308 350 326 Q330 339 299 323 Q297 337 316 342 Q367 339 404 390 L456 437 L479 487Z',
      jaw:'M448 205 Q473 158 496 140 Q528 124 554 133 Q580 129 604 118 L650 95 Q675 84 707 62 Q683 101 640 127 Q603 158 554 171 L507 190 L469 213Z'},
    {hip:[1045,494], elbow:[1210,326], wrist:[1139,219], hinge:[1007,168], tip:[788,81],
      arm:'M1031 527 Q1004 502 1013 457 Q1044 418 1083 374 Q1117 336 1152 332 L1185 321 Q1162 325 1135 312 Q1114 300 1102 278 Q1077 283 1046 259 Q1007 230 982 194 L951 152 Q938 137 917 120 Q890 97 857 94 L787 82 Q813 61 850 57 Q894 51 931 67 L972 76 Q1011 82 1064 114 Q1113 139 1140 173 Q1154 186 1159 209 L1173 201 Q1204 208 1230 258 Q1268 313 1245 343 Q1242 383 1215 418 Q1153 487 1088 523 L1058 541Z',
      jaw:'M1026 211 Q1006 164 983 147 Q948 139 918 135 Q875 129 840 110 L790 92 Q828 139 882 161 Q927 181 969 192 L1005 216Z'}
  ];
  const shellEdge='M400 481 Q411 452 449 439 Q468 430 491 426 L531 409 Q582 394 608 376 L622 358 Q626 342 640 341 L645 324 Q655 316 655 340 Q669 341 675 360 Q697 370 729 368 Q770 371 801 366 L821 360 Q829 341 845 343 L851 333 Q858 325 862 338 L861 346 Q878 353 879 373 Q897 388 928 399 L1010 435 Q1045 442 1061 454 Q1087 481 1071 518 Q1060 559 1033 581 Q1017 617 977 652 Q948 687 912 710 Q880 737 841 757 Q817 769 781 758 Q755 766 724 759 Q681 764 648 755 Q620 756 592 735 Q559 722 535 692 Q510 670 485 646 Q466 619 449 594 Q428 568 418 542 Q401 526 400 503Z';

  // Rasterize each path only once. Each sprite carries just its own tight bounds.
  function cut(edge, masks = [], texture = image) {
    const values = edge.match(/-?\d+/g).map(Number);
    const xs = values.filter((_, i) => i % 2 === 0);
    const ys = values.filter((_, i) => i % 2 === 1);
    const x = Math.min(...xs) - 1, y = Math.min(...ys) - 1;
    const sprite = document.createElement('canvas');
    sprite.width = Math.max(...xs) - x + 2;
    sprite.height = Math.max(...ys) - y + 2;
    const brush = sprite.getContext('2d');
    brush.translate(-x, -y);
    brush.clip(new Path2D(edge));
    for (const mask of masks) brush.clip(mask);
    const width = texture === image ? 1494 : 1536;
    const height = texture === image ? 1052 : 1024;
    brush.drawImage(texture, 0, 0, width, height);
    // Measure the opaque part once. Joint cutouts otherwise retain empty margins.
    const pixels = brush.getImageData(0,0,sprite.width,sprite.height).data;
    let left=sprite.width, top=sprite.height, right=0, bottom=0;
    for(let row=0;row<sprite.height;row++)for(let col=0;col<sprite.width;col++){
      if(pixels[4*(row*sprite.width+col)+3]===0)continue;
      left=Math.min(left,col);right=Math.max(right,col+1);
      top=Math.min(top,row);bottom=Math.max(bottom,row+1);
    }
    return {sprite, x, y, bounds:{left:x+left,top:y+top,right:x+right,bottom:y+bottom}};
  }
  const angleBetween = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const clamp = (n, low, high) => Math.min(high, Math.max(low, n));

  // Cut across each painted knuckle, leaving a little overlap inside the joint.
  // The seam is perpendicular to the bisector of the incoming and outgoing bones.
  function splitAtJoints(edge, points, texture = image) {
    const masks = points.slice(1, -1).map(([x, y], i) => {
      const a = angleBetween(points[i], points[i + 1]);
      const b = angleBetween(points[i + 1], points[i + 2]);
      const direction = Math.atan2(Math.sin(a) + Math.sin(b), Math.cos(a) + Math.cos(b));
      return [-1, 1].map(side => {
        const nx = side * Math.cos(direction), ny = side * Math.sin(direction);
        const mask = new Path2D();
        const offset = 16, extent = 2400;
        const startX = x - offset * nx, startY = y - offset * ny;
        mask.moveTo(startX - ny * extent, startY + nx * extent);
        mask.lineTo(startX + ny * extent, startY - nx * extent);
        mask.lineTo(startX + (ny + nx) * extent, startY + (ny - nx) * extent);
        mask.lineTo(startX + (nx - ny) * extent, startY + (ny + nx) * extent);
        mask.closePath();
        return mask;
      });
    });
    return points.slice(1).map((_, i) => cut(edge, [masks[i-1]?.[1], masks[i]?.[0]].filter(Boolean), texture));
  }
  const knees = [[245,429],[239,565],[301,684],[416,775],[1268,462],[1223,596],[1168,722],[1045,800]];
  const legs = legShapes.map(({hip:sourceHip, toe, edge}, i) => {
    const knee = knees[i];
    const hip = [sourceHip[0] + (i < 4 ? 32 : -32), sourceHip[1] - 10];
    const [upper, lower] = splitAtJoints(edge, [sourceHip, knee, toe]);
    const upperAngle = angleBetween(hip, knee), lowerAngle = angleBetween(knee, toe);
    return {hip, knee, toe, sourceHip, sourceKnee:knee, upper, lower, upperAngle:angleBetween(sourceHip,knee), lowerAngle,
      upperSourceLength:distance(sourceHip,knee), lowerSourceLength:distance(knee,toe),
      upperLength:distance(hip, knee), lowerLength:distance(knee, toe),
      bend:Math.sign(Math.sin(upperAngle - angleBetween(hip, toe)))};
  });
  // The four new upper legs reach out beside the shell, clear of the raised pincers.
  const newLegs = [
    {index:0, hip:[485,514], knee:[268,467], toe:[137,538],
      points:[[643,143],[250,175],[176,475]],
      edge:'M647 202 Q690 183 689 113 Q685 72 648 65 Q611 62 587 85 Q544 93 490 94 L399 99 Q349 83 310 98 Q260 101 220 142 Q178 186 158 238 Q112 307 111 353 Q98 409 138 455 L176 477 Q149 436 150 395 Q180 367 193 328 L230 265 Q273 231 282 209 Q326 202 378 205 L475 207 Q526 218 583 204Z'},
    {index:1, hip:[521,598], knee:[263,612], toe:[138,738],
      points:[[643,635],[250,666],[171,985]],
      edge:'M640 702 Q689 686 688 629 Q686 570 650 557 Q613 547 583 575 Q545 581 490 585 L395 581 Q340 578 308 588 Q259 586 220 628 Q177 675 150 732 Q114 789 109 839 Q98 905 136 954 L171 985 Q147 938 150 891 Q177 857 193 818 L227 759 Q269 724 283 705 Q329 702 383 703 L482 700 Q532 714 587 700Z'}
  ];
  for(const {index,hip,knee,toe,points,edge} of newLegs) {
    const [sourceHip,sourceKnee,sourceToe] = points;
    const [upper,lower] = splitAtJoints(edge,points,legImage);
    legs[index] = {hip,knee,toe,sourceHip,sourceKnee,upper,lower,
      upperAngle:angleBetween(sourceHip,sourceKnee),lowerAngle:angleBetween(sourceKnee,sourceToe),
      upperSourceLength:distance(sourceHip,sourceKnee),lowerSourceLength:distance(sourceKnee,sourceToe),
      upperLength:distance(hip,knee),lowerLength:distance(knee,toe),
      bend:Math.sign(Math.sin(angleBetween(hip,knee)-angleBetween(hip,toe)))};
  }
  // Share the same painted parts and reflect their complete pose across the shell.
  const mirror = ([x,y]) => [2*center.x-x,y];
  for(const index of [0,1,2]) {
    const left = legs[index];
    legs[index+4] = {...left, hip:mirror(left.hip), knee:mirror(left.knee),
      toe:mirror(left.toe), bend:-left.bend, mirroredFrom:left};
  }
  for(const [index,rig] of legs.entries()) {
    rig.axis=angleBetween(rig.hip,rig.toe);
    rig.restLength=distance(rig.hip,rig.toe);
    rig.minReach=Math.max(Math.abs(rig.upperLength-rig.lowerLength)+10,rig.restLength*.73);
    // The third pair keeps a pronounced knee instead of locking into a rod on turns.
    rig.minimumFlex=index%4===2?.85:.40;
    rig.maxReach=Math.sqrt(rig.upperLength**2+rig.lowerLength**2+
      2*rig.upperLength*rig.lowerLength*Math.cos(rig.minimumFlex));
  }
  function constrainFoot(index, foot) {
    const rig=legs[index];
    const dx=foot.x*texelsPerUnit+center.x-rig.hip[0];
    const dy=foot.y*texelsPerUnit+center.y-rig.hip[1];
    const difference=Math.atan2(Math.sin(Math.atan2(dy,dx)-rig.axis),Math.cos(Math.atan2(dy,dx)-rig.axis));
    const axis=rig.axis+clamp(difference,-.38,.38);
    const span=clamp(Math.hypot(dx,dy),rig.minReach,rig.maxReach);
    return {x:(rig.hip[0]+Math.cos(axis)*span-center.x)/texelsPerUnit,
      y:(rig.hip[1]+Math.sin(axis)*span-center.y)/texelsPerUnit};
  }
  function needsStep(index,foot) {
    const rig=legs[index];
    const x=foot.x*texelsPerUnit+center.x, y=foot.y*texelsPerUnit+center.y;
    const drift=Math.hypot(x-rig.toe[0],y-rig.toe[1]);
    const axis=Math.atan2(y-rig.hip[1],x-rig.hip[0]);
    const deviation=Math.abs(Math.atan2(Math.sin(axis-rig.axis),Math.cos(axis-rig.axis)));
    return drift>(index%4===2?62:85) ||
      Math.hypot(x-rig.hip[0],y-rig.hip[1])>rig.maxReach-12 || deviation>.28;
  }
  const claws = clawShapes.map(claw => {
    const [upper, forearm, palm] = splitAtJoints(claw.arm, [claw.hip, claw.elbow, claw.wrist, claw.tip]);
    return {...claw, upper, forearm, palm, jaw:cut(claw.jaw)};
  });
  const grips=[[650,100],[840,115]], mouth=[747,452];
  const difference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  function feedingPose(rig,index,carry) {
    const grip=grips[index];
    const sourceAngle=angleBetween(rig.wrist,grip);
    const palmAngle=sourceAngle+difference(index===0?1.05:Math.PI-1.05,sourceAngle)*carry;
    const target=grip.map((value,i)=>value+(mouth[i]-value)*carry);
    const palmLength=distance(rig.wrist,grip);
    const wrist=[target[0]-Math.cos(palmAngle)*palmLength,target[1]-Math.sin(palmAngle)*palmLength];
    const upperLength=distance(rig.hip,rig.elbow), lowerLength=distance(rig.elbow,rig.wrist);
    const axis=angleBetween(rig.hip,wrist);
    const reach=clamp(distance(rig.hip,wrist),Math.abs(upperLength-lowerLength)+4,upperLength+lowerLength-4);
    const cosine=(reach*reach+upperLength*upperLength-lowerLength*lowerLength)/(2*reach*upperLength);
    const upper=axis+(index===0?-1:1)*Math.acos(clamp(cosine,-1,1));
    const knee=[rig.hip[0]+Math.cos(upper)*upperLength,rig.hip[1]+Math.sin(upper)*upperLength];
    const lower=Math.atan2(rig.hip[1]+Math.sin(axis)*reach-knee[1],rig.hip[0]+Math.cos(axis)*reach-knee[0]);
    const shoulder=difference(upper,angleBetween(rig.hip,rig.elbow));
    const elbow=difference(lower,angleBetween(rig.elbow,rig.wrist))-shoulder;
    return [shoulder,elbow,difference(palmAngle,sourceAngle)-shoulder-elbow];
  }
  function transformed(ctx,[x,y]) {
    const m=ctx.getTransform();
    return {x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f};
  }
  const shell = cut(shellEdge);
  let footprint;
  function paint(ctx, part) {
    ctx.drawImage(part.sprite,part.x,part.y);
    const m=ctx.getTransform(), b=part.bounds;
    for(const x of [b.left,b.right])for(const y of [b.top,b.bottom]){
      const px=m.a*x+m.c*y+m.e, py=m.b*x+m.d*y+m.f;
      footprint.left=Math.min(footprint.left,px);
      footprint.right=Math.max(footprint.right,px);
      footprint.top=Math.min(footprint.top,py);
      footprint.bottom=Math.max(footprint.bottom,py);
    }
  }
  function pivot(ctx, [x, y], radians) {
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.translate(-x, -y);
  }
  function drawLeg(ctx, rig, step, foot) {
    ctx.save();
    let side = step.side;
    if(rig.mirroredFrom) {
      ctx.translate(2*center.x,0);
      ctx.scale(-1,1);
      rig = rig.mirroredFrom;
      side = -side;
      foot = {x:-foot.x,y:foot.y};
    }
    const {hip, upperLength, lowerLength} = rig;
    // On the return stroke the toe folds slightly underneath the crab.
    // On the support stroke its target is the same point on the page on every frame.
    const dx = foot.x * texelsPerUnit + center.x - hip[0] - side * 17 * step.lift;
    const dy = foot.y * texelsPerUnit + center.y - hip[1] - 17 * step.lift;
    const reach = Math.max(1, Math.hypot(dx, dy));
    const axis = Math.atan2(dy, dx);
    // Leave a little flex near full extension so the knee keeps its painted bend.
    const span = clamp(reach, Math.abs(upperLength - lowerLength) + 4, rig.maxReach);
    const cosine = (span * span + upperLength * upperLength - lowerLength * lowerLength) / (2 * span * upperLength);
    const upper = axis + rig.bend * Math.acos(clamp(cosine, -1, 1));
    const kneeX = upperLength * Math.cos(upper), kneeY = upperLength * Math.sin(upper);
    const lower = Math.atan2(span*Math.sin(axis)-kneeY,span*Math.cos(axis)-kneeX);

    ctx.save();
    ctx.translate(hip[0] + kneeX, hip[1] + kneeY);
    ctx.rotate(lower);
    ctx.scale(lowerLength/rig.lowerSourceLength,lowerLength/rig.lowerSourceLength);
    ctx.rotate(-rig.lowerAngle);
    ctx.translate(-rig.sourceKnee[0], -rig.sourceKnee[1]);
    paint(ctx, rig.lower);
    ctx.restore();
    ctx.save();
    ctx.translate(...hip);
    ctx.rotate(upper);
    ctx.scale(upperLength/rig.upperSourceLength,upperLength/rig.upperSourceLength);
    ctx.rotate(-rig.upperAngle);
    ctx.translate(-rig.sourceHip[0],-rig.sourceHip[1]);
    paint(ctx, rig.upper);
    ctx.restore();
    ctx.restore();
  }
  function drawClaw(ctx, rig, claw, state, index) {
    const {side, wrist, gape} = claw;
    const phase = state.stride * 2 * Math.PI + side * Math.PI / 2;
    const walking = state.effort * (1 - state.guard);
    const beat = Math.sin(phase) * walking;
    const rebound = Math.sin(phase - .65) * walking;
    const idle = Math.sin(state.clock * 1.25 + side * .6) * (1 - state.guard);
    const ordinary=[side*(.075+.10*beat+.016*idle+.24*state.guard),
      side*(-.04-.15*rebound-.45*wrist-.15*state.guard),
      side*(.025+.07*rebound+.035*idle+.70*wrist)];
    const feeding=feedingPose(rig,index,claw.carry||0);
    const rotations=ordinary.map((value,i)=>value+difference(feeding[i],value)*(claw.feed||0));
    ctx.save();
    pivot(ctx, rig.hip, rotations[0]);
    paint(ctx, rig.upper);
    pivot(ctx, rig.elbow, rotations[1]);
    paint(ctx, rig.forearm);
    pivot(ctx, rig.wrist, rotations[2]);
    footprint.grips[index]=transformed(ctx,grips[index]);
    ctx.save();
    pivot(ctx, rig.hinge, -side * clamp(.78 * gape + .04 * beat + .018 * idle, -.11, .40));
    paint(ctx, rig.jaw);
    ctx.restore();
    paint(ctx, rig.palm);
    ctx.restore();
  }
  function draw(ctx, state) {
    footprint={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity,grips:[]};
    ctx.save();
    ctx.scale(1 / texelsPerUnit, 1 / texelsPerUnit);
    ctx.translate(-center.x, -center.y);
    footprint.mouth=transformed(ctx,mouth);
    // The third pair covers the second, and the fourth pair covers the third.
    for (const i of [5,1,6,2,7,3,4,0]) {
      const step = state.legs[i];
      drawLeg(ctx, legs[i], step, constrainFoot(i,state.local(step.foot)));
    }
    for(let i=0;i<claws.length;i++)drawClaw(ctx,claws[i],state.claws[i],state,i);
    paint(ctx, shell);
    ctx.restore();
    return footprint;
  }
  return {draw, constrainFoot, needsStep, grips:grips.map(([x,y])=>({x:(x-center.x)/texelsPerUnit,y:(y-center.y)/texelsPerUnit})), toes: legs.map(({toe}) => ({
    x:(toe[0] - center.x) / texelsPerUnit, y:(toe[1] - center.y) / texelsPerUnit
  }))};
}
