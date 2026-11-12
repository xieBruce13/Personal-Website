(() => {
  'use strict';

  let canvas = document.querySelector('.landing-koi');
  if (!canvas) return;
  const page = canvas.closest('main');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_CURVATURE = 2.7;
  const SIZE_INCREASE = 1.3;
  // Preserve the previous on-screen cruise speed at the bottom of a glide.
  const GLIDE_SPEED = .172 / SIZE_INCREASE;
  const DOT_GETAWAY_MS = 25000;
  const BURST_MS = 3200;
  const FIRST_VISIT_SECONDS = 60;
  const SEGMENTS = 104;
  const DS = 1 / SEGMENTS;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  const mix = (a, b, f) => a + (b - a) * f;
  const signedAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
  function smooth(lo, hi, x) {
    const t = clamp((x - lo) / (hi - lo), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function decode(encoded, Type) {
    if (Uint8Array.fromBase64) return new Type(Uint8Array.fromBase64(encoded).buffer);
    const binary = atob(encoded), bytes = new Uint8Array(binary.length);
    for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Type(bytes.buffer);
  }

  function readMesh() {
    const packed = decode(koiPrint.vertices, Int16Array);
    const count = packed.length / 5;
    const local = new Float32Array(count * 4);
    const fin = new Float32Array(count * 4);
    const uv = new Float32Array(count * 2);
    for (let i=0; i<count; i++) {
      const k = i*5;
      const s = packed[k]/16000, along = packed[k+1]/16000, l = packed[k+2]/16000;
      let station = s;
      // Each paired fin is bound at its anatomical station on the ink plate.
      // Keep the first few fin rays fixed to the flank and articulate the tips.
      const u = packed[k+3]/16000, v = packed[k+4]/16000;
      if (u > .48 && u < .88) {
        const pectoral = smooth(.55,.66,u);
        const reach = Math.max(0, Math.abs(v - .50) - mix(.098,.107,pectoral)) * .67;
        const extension = clamp(reach / mix(.078,.17,pectoral), 0, 1);
        const edge = smooth(.48,.53,u) * (1 - smooth(.83,.88,u));
        // Blend from a continuous body attachment to the fin hinge. A sudden
        // change of attachment between adjacent rays can crease the print.
        const bodyStation = (.939 - u) * 1.026;
        const hinge = mix(.344,.161,pectoral);
        station = mix(s, mix(bodyStation, hinge, .20 * smooth(0,.065,reach)), edge);
        if (reach > 0) fin.set([1, reach * edge, extension, pectoral], i * 4);
      } else if (u > .93) {
        // The two barbel tips curl back toward the face. Distance from the
        // mouth along the vertical axis increases even past that curl.
        const upper = v < .49;
        const extension = clamp((upper ? .449 - v : v - .529) / .072, 0, 1);
        const tip = extension * extension * smooth(.93,.951,u);
        if (tip > 0) fin.set([3, tip, extension, upper ? 1 : -1], i * 4);
      } else if (s > .52) {
        const reach = smooth(.52,.68,s);
        const rim = smooth(.015,.22,Math.abs(l));
        fin.set([2, reach, rim, 0], i * 4);
      }
      const at = clamp(station,0,1-1e-7) * SEGMENTS;
      local.set([Math.floor(at), at % 1, l, along + s - station], i * 4);
      uv[i*2] = packed[k+3]/16000;
      uv[i*2+1] = packed[k+4]/16000;
    }
    return {local,fin,uv,xy:new Float32Array(uv.length),indices:decode(koiPrint.triangles,Uint16Array)};
  }

  const mesh = readMesh();
  let renderer, paintPending = false;
  const bones = Array.from({length: SEGMENTS + 1}, () => ({x:0, y:0, tx:0, ty:0}));
  const head = {x:0, y:0, angle:0, curvature:0, speed:.17, distance:0};
  const history = [];
  let strokeTravel = 0, turnAcceleration = 0, effort = .55, finBeat = 0;
  let strokeTime = 0, strokePeriod = 5.4, strokeStrength = .95;
  const wander = {first:0, second:0, switchAt:0, end:0, side:1, lastAngle:null};
  let turnRate = 0, glance = 0, departure = null;
  let contactArmed = true;
  let width = 0, height = 0, viewHeight = 0, scale = 1;
  let bufferWidth = 0, bufferHeight = 0;
  let guide = null, elapsed = 0, beat = 0, lastTime = 0, frame = 0;
  const edges = [
    {x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}
  ];
  let edge = edges[0], phase = 'entering', exitEligibleAt = 0, returnAt = 0, returnTimer = 0;
  let minimumVisit = FIRST_VISIT_SECONDS, inwardAim = null, bankSide = 0;
  let scrollY = window.scrollY;
  let pointer = null;
  const leaves = Array.from(page.querySelectorAll('.lotus-pad'), element => ({element, active:true}));

  function measureLeaves() {
    for (const leaf of leaves) {
      const rect = leaf.element.getBoundingClientRect();
      leaf.left = rect.left;
      leaf.right = rect.right;
      leaf.top = rect.top + scrollY;
      leaf.bottom = rect.bottom + scrollY;
    }
    // A foreground leaf also frosts the rim of any leaf underneath it.
    leaves.forEach((leaf, i) => {
      leaf.overlapsLeaf = leaves.some((other, j) => j < i && other.left < leaf.right &&
        other.right > leaf.left && other.top < leaf.bottom && other.bottom > leaf.top);
    });
  }

  function updateGlass(left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity) {
    // Pad the ink bounds so the blur is ready before a fin reaches a rim.
    const margin = 32;
    for (const leaf of leaves) {
      const touchesInk = leaf.left < right + margin && leaf.right > left - margin &&
        leaf.top < bottom + margin && leaf.bottom > top - margin;
      const active = leaf.bottom >= scrollY && leaf.top <= scrollY + viewHeight &&
        (leaf.overlapsLeaf || touchesInk);
      if (active !== leaf.active) {
        leaf.element.classList.toggle('clear-water', !active);
        leaf.active = active;
      }
    }
  }

  function enter(first = false) {
    const w = width / scale, h = height / scale;
    minimumVisit = first ? FIRST_VISIT_SECONDS : 90 + 60 * Math.random();
    inwardAim = null;
    bankSide = 0;
    // The reader may have scrolled away from a top or bottom exit during the pause.
    if ((edge.y > 0 && window.scrollY > 1) ||
        (edge.y < 0 && window.scrollY + viewHeight < height - 1)) {
      edge = edges[Math.random() < .5 ? 0 : 1];
    }
    const opening = page.querySelector('.hero-water').getBoundingClientRect();
    const startY = first ? clamp(opening.top + opening.height * .53,viewHeight*.16,viewHeight*.84)
      : viewHeight * (.22 + .55 * Math.random());
    head.x = edge.x ? (edge.x > 0 ? -.045 : w + .045) : w * (.23 + .54 * Math.random());
    head.y = edge.y ? (edge.y > 0 ? -.045 : h + .045) : clamp((window.scrollY + startY) / scale, .13, h - .13);
    head.angle = Math.atan2(edge.y, edge.x) + .09;
    if (reduced.matches) {
      head.angle = w < 1.30 ? -.86 : -.16;
      head.x = w * .5 + .46 * Math.cos(head.angle);
      head.y = (window.scrollY + opening.top + opening.height * .52) / scale
        + .46 * Math.sin(head.angle);
    }
    phase = 'entering';
    strokeTravel = turnRate = turnAcceleration = glance = 0;
    head.curvature = 0;
    head.speed = .28;
    history.length = 0;
    wander.end = 0;
    canvas.style.visibility = '';
    // The engraving supplies the resting curve of the fan. Steering history
    // supplies the additional bend that travels from the shoulders to the tail.
    for (let i = SEGMENTS + 3; i >= 0; i--) {
      const s = i * DS;
      history.push({d:-s, angle:head.angle});
    }
  }

  function distanceFromEdge(normal, w, h) {
    if (normal.x) return normal.x > 0 ? head.x : w - head.x;
    return normal.y > 0 ? head.y : h - head.y;
  }

  function updatePassage(w, h) {
    if (phase === 'entering') {
      if (distanceFromEdge(edge,w,h) >= Math.min(.92, (edge.x ? w : h) * .46)) {
        phase = 'swimming';
        exitEligibleAt = elapsed + minimumVisit;
      }
      return;
    }
    if (phase !== 'swimming' || elapsed < exitEligibleAt) return;
    const scheduled = elapsed >= exitEligibleAt + 25 && (!guide || departure);
    const hx = Math.cos(head.angle), hy = Math.sin(head.angle);
    // Finish a pointer approach right at the margin before the getaway.
    const nearDot = guide && !departure && Math.hypot(guide.x-head.x,guide.y-head.y) < .18;
    let best = Infinity;
    for (const normal of edges) {
      const gap = distanceFromEdge(normal,w,h);
      const inward = hx * normal.x + hy * normal.y;
      if (!scheduled && (gap > .045 || inward > -.24 || nearDot)) continue;
      const score = gap + inward * .65;
      if (score < best) {best = score; edge = normal;}
    }
    if (best < Infinity) phase = 'leaving';
  }

  function waitOffscreen() {
    phase = 'away';
    canvas.style.visibility = 'hidden';
    updateGlass();
    returnAt = performance.now() + 4500 + Math.random() * 1000;
    scheduleReturn();
  }

  function scheduleReturn() {
    clearTimeout(returnTimer);
    if (document.hidden || reduced.matches) return;
    returnTimer = setTimeout(() => {
      enter();
      lastTime = 0;
      wake();
    }, Math.max(0, returnAt - performance.now()));
  }

  // Plan two connected strokes at once. A sweep can lead into a glide or an
  // opposite bend, rather than locking into the same turn along the perimeter.
  function chooseSwim(w, h, top) {
    const goalX = .38 + Math.random() * (w - .76);
    const goalY = .38 + Math.random() * (h - .76);
    if (wander.lastAngle !== null && Math.abs(head.angle - wander.lastAngle) > .45) {
      wander.side = -Math.sign(head.angle - wander.lastAngle);
    }
    wander.lastAngle = head.angle;
    const preferredSide = wander.side;
    const sweep = preferredSide * mix(.42,.94,Math.random()) * Math.PI;
    let best = Infinity;
    for (let trial = 0; trial < 120; trial++) {
      const a = (trial % 2 ? 1 : -1) * mix(.50, MAX_CURVATURE, Math.floor(trial % 12 / 2) / 5);
      const b = (Math.random() < .5 ? -1 : 1) * mix(.50, MAX_CURVATURE, Math.random());
      const first = .42 + Math.random() * .70;
      const second = .50 + Math.random() * .75;
      let x = head.x, y = head.y - top, angle = head.angle, bend = head.curvature;
      let tightest = Infinity;
      for (let s = 0; s < first + second; s += .055) {
        bend = mix(bend, s < first ? a : b, .63);
        angle += bend * .0275;
        x += .055 * Math.cos(angle);
        y += .055 * Math.sin(angle);
        angle += bend * .0275;
        tightest = Math.min(tightest, x, w-x, y, h-y);
      }
      const fx = Math.cos(angle), fy = Math.sin(angle);
      const radius = 1 / MAX_CURVATURE + .045;
      const nx = -fy * radius, ny = fx * radius;
      const escape = Math.max(Math.min(x+nx,w-x-nx,y+ny,h-y-ny),
        Math.min(x-nx,w-x+nx,y-ny,h-y+ny)) - radius;
      const unsafe = Math.max(0, .48 - Math.min(escape, tightest));
      // Prefer a change of hand and unexplored water whenever the next turn fits.
      const sweepError = Math.abs(a * first + b * second - sweep);
      const score = 1100 * unsafe * unsafe + .72 * Math.hypot(x-goalX,y-goalY) +
        .82 * sweepError + .15 * Math.abs(a+b) + Math.random() * .42;
      if (score < best) {
        best = score;
        wander.first = a;
        wander.second = b;
        wander.switchAt = head.distance + first;
        wander.end = wander.switchAt + second;
      }
    }
    wander.side = -preferredSide;
  }

  function leaveDot(now, w, top, bottom) {
    const reach = 1.25;
    const margin = .26;
    const offset = (Math.random() - .5) * .7;
    const side = Math.abs(turnRate) > .16 ? Math.sign(turnRate) : (Math.random() < .5 ? -1 : 1);
    const exitBearing = head.angle + side * mix(.52,.84,Math.random()) * Math.PI;
    let best = -Infinity;
    // Aim across the current course so contact can lead into a sweeping U-turn.
    // Score the actual bearing after clipping each candidate to open water.
    for (let i = 0; i < 24; i++) {
      const angle = head.angle + offset + i * Math.PI / 12;
      const x = clamp(head.x + reach*Math.cos(angle), margin, w-margin);
      const y = clamp(head.y + reach*Math.sin(angle), top+margin, bottom-margin);
      const dx = x-head.x, dy = y-head.y;
      const distance = Math.hypot(dx,dy);
      const alignment = Math.cos(Math.atan2(dy,dx) - exitBearing);
      const clearance = Math.min(x, w-x, y-top, bottom-y);
      const score = distance + 1.1 * alignment + .40 * Math.min(.75,clearance);
      if (score > best) {
        best = score;
        departure = {x, y, burstUntil:now + BURST_MS, until:now + DOT_GETAWAY_MS};
      }
    }
    contactArmed = false;
    wander.end = 0;
  }

  function swim(dt, now) {
    elapsed += dt;
    strokeTime += dt;
    if (strokeTime >= strokePeriod) {
      strokeTime -= strokePeriod;
      strokePeriod = 3.8 + 3.2 * Math.random();
      strokeStrength = .72 + .40 * Math.random();
    }
    const progress = strokeTime / strokePeriod;
    const drive = strokeStrength * smooth(.06,.36,progress) * (1 - smooth(.48,.86,progress));
    const w = width / scale, h = height / scale;
    const visibleHeight = viewHeight / scale;
    const top = clamp(scrollY / scale, 0, h - visibleHeight);
    const bottom = top + visibleHeight;
    const contact = Math.max(4/scale, .013);
    if (departure && now >= departure.until) departure = null;
    if (guide && phase === 'swimming') {
      const gap = Math.hypot(guide.x-head.x, guide.y-head.y);
      if (gap > 2 * contact) contactArmed = true;
      if (!departure && contactArmed && gap <= contact) {
        leaveDot(now, w, top, bottom);
      }
    }
    updatePassage(w,h);

    // Only the first strokes aim for the exit. Then swim freely for the rest
    // of the break, even if the user moves the dot across the fish.
    const burst = departure ? smooth(0, 1, (departure.burstUntil - now) / BURST_MS) : 0;
    let target = departure ? (burst > 0 ? departure : null) : guide;
    // Look ahead before a free stroke runs out of visible water. Finish the
    // bank before resuming the wandering path, including after a page scroll.
    if (phase === 'swimming' && (!guide || departure)) {
      const dx = Math.cos(head.angle), dy = Math.sin(head.angle);
      const reach = .17 + head.speed * .70;
      const lookX = head.x + reach * dx, lookY = head.y + reach * dy;
      const room = Math.min(lookX, w-lookX, lookY-top, bottom-lookY);
      if (inwardAim && (room > .14 || inwardAim.y < top || inwardAim.y > bottom)) inwardAim = null;
      if (!inwardAim && room < 0) {
        // Aim along the edge on a shallow approach. On a head-on approach,
        // leave enough lateral room for the shoulders and tail to follow.
        const sideX = lookX < 0 || lookX > w, sideY = lookY < top || lookY > bottom;
        const tangentX = Math.abs(dx) > .35 ? dx : (head.x < w/2 ? .65 : -.65);
        const tangentY = Math.abs(dy) > .35 ? dy : (head.y < (top+bottom)/2 ? .65 : -.65);
        inwardAim = {
          x:sideX ? mix(clamp(head.x,0,w),w/2,.78) : clamp(head.x+.75*tangentX,.18,w-.18),
          y:sideY ? mix(clamp(head.y,top,bottom),(top+bottom)/2,.78) : clamp(head.y+.75*tangentY,top+.18,bottom-.18)
        };
      }
      if (inwardAim) target = inwardAim;
    } else inwardAim = null;
    const cruise = GLIDE_SPEED * (1 + 1.05 * drive);
    let speed = cruise + .33 * burst, yaw, look = 0;
    if (phase === 'entering' || phase === 'leaving') {
      const direction = phase === 'entering' ? 1 : -1;
      const bearing = Math.atan2(direction * edge.y, direction * edge.x);
      yaw = clamp(2 * signedAngle(bearing + .18 * Math.sin(elapsed * 1.14) - head.angle), -1, 1);
      speed = cruise + .075 + .13 * burst;
    } else if (target) {
      // Slow the forward stroke while turning. A nearby dot can be reached
      // even when it starts inside the fish's normal turning circle.
      const dx = target.x-head.x, dy = target.y-head.y;
      const distance = Math.hypot(dx,dy);
      let error = distance > .0001 ? signedAngle(Math.atan2(dy,dx)-head.angle) : 0;
      // Commit to one bank while the target crosses the stern. The separate
      // release angle prevents jitter when the dot hovers near the centreline.
      if (Math.abs(error) < 2.18) bankSide = 0;
      else if (!bankSide && Math.abs(error) > 2.75) {
        bankSide = Math.abs(turnRate) > .12 ? Math.sign(turnRate) : Math.sign(error);
      }
      if (bankSide && bankSide * error < 0) error += bankSide * 2 * Math.PI;
      // Follow a moving bearing to trace an S through the water. Narrow the
      // last arc continuously until the actual lip can touch the dot.
      const arc = .54 * Math.sin(1.02 * elapsed + .46 * Math.sin(.47 * elapsed))
        + .13 * Math.sin(1.72 * elapsed + .8);
      const alignment = smooth(-.65,.88,Math.cos(error));
      const steering = error + arc * smooth(0,.64,distance) * alignment;
      speed *= .38 + .62 * alignment;
      speed = Math.min(speed, .27 * distance / Math.max(.1,Math.abs(Math.sin(error))));
      const bearingRate = head.speed * Math.sin(error) / Math.max(distance,contact);
      const maxYaw = .68 + .52 * smooth(.7,2.8,Math.abs(error)) + .65 * burst;
      yaw = clamp((1.9 + 2 * burst) * steering + bearingRate, -maxYaw, maxYaw);
      look = .05 * clamp(steering,-1,1);
      wander.end = 0;
    } else {
      bankSide = 0;
      if (head.distance >= wander.end) chooseSwim(w,visibleHeight,top);
      const bend = head.distance < wander.switchAt ? wander.first : wander.second;
      yaw = (bend + .24 * Math.sin(.93 * elapsed)) * head.speed;
    }
    head.speed = mix(head.speed, speed, 1 - Math.exp(-dt * (3.8 + 6 * burst)));
    // Ease into a bank and unwind it before the opposite bank takes over.
    const turnResponse = 5.7 + 1.8 * burst;
    // Exact critically damped response for the elapsed step, at any refresh rate.
    const errorRate = turnRate - yaw, decay = Math.exp(-turnResponse * dt);
    const slope = turnAcceleration + turnResponse * errorRate;
    const previousRate = turnRate;
    turnRate = yaw + (errorRate + slope * dt) * decay;
    turnAcceleration = (turnAcceleration - turnResponse * slope * dt) * decay;
    glance = mix(glance, look, 1 - Math.exp(-dt * 4.5));
    const turn = (previousRate + turnRate) * .5 * dt;
    const course = head.angle + turn/2;
    const forwardX = Math.cos(course), forwardY = Math.sin(course);
    let step = head.speed * dt;
    if (phase === 'swimming') {
      // Ease off the forward stroke as the nose banks at a margin or a corner.
      // An inward stroke is free to carry it back into view after a scroll.
      const roomX = forwardX < 0 ? head.x : w - head.x;
      const roomY = forwardY < 0 ? head.y - top : bottom - head.y;
      const roomAhead = Math.min(roomX / Math.max(.00001, Math.abs(forwardX)),
        roomY / Math.max(.00001, Math.abs(forwardY)));
      step = Math.min(step, Math.max(0, roomAhead) * (1 - Math.exp(-4 * dt)));
    }
    const x = head.x + step*forwardX;
    const y = head.y + step*forwardY;
    head.distance += Math.hypot(x-head.x,y-head.y);
    head.x = x;
    head.y = y;
    head.angle += turn;
    head.curvature = clamp(turnRate / Math.max(.025,head.speed), -MAX_CURVATURE, MAX_CURVATURE);
    const bank = Math.min(1, Math.abs(turnRate) / .68);
    effort = mix(effort, Math.min(1, .30 + .53 * drive + .21 * bank + .5 * burst),
      1 - Math.exp(-dt * (3 + 4 * burst)));
    beat += dt * (2.15 + 2.55 * effort + 1.7 * burst);
    finBeat += dt * (2.1 + 1.28 * effort + .23 * Math.sin(.53 * elapsed));
    // A turn travels down the spine even when the nose slows over the dot.
    strokeTravel += dt * (.245 + head.speed * .38 + .024 * effort + .36 * burst);
    if (strokeTravel - history[history.length - 1].d >= DS * .45) {
      history.push({d:strokeTravel, angle:head.angle});
      while (history.length > 2 && history[1].d < strokeTravel - 1.04) history.shift();
    }
  }

  function pose() {
    let x = head.x, y = head.y, angle = head.angle + Math.PI + glance;
    let j = history.length - 1;
    for (let i = 0; i <= SEGMENTS; i++) {
      const s = i * DS, d = strokeTravel - s * (.77 + .23 * s);
      while (j > 0 && history[j].d > d) j--;
      const a = history[j], b = history[j+1];
      const span = (b ? b.d : strokeTravel) - a.d;
      const t = span > 0 ? clamp((d - a.d) / span, 0, 1) : 0;
      const pastAngle = mix(a.angle, b ? b.angle : head.angle, t);
      // The narrow stalk supplies the thrust. Most of the rear fan follows
      // the same sweep, with only a slight phase delay across the blade.
      const tailLag = 3.5 * s - 2.45 * Math.max(0, s - .58) ** 2;
      const wave = reduced.matches ? 0 : (.015 * s + (.48 + .48 * effort) *
        smooth(.16,.69,s)) * Math.sin(beat - tailLag);
      const wanted = pastAngle + Math.PI + .77 * plateBend[i] + wave
        + glance * (1 - smooth(0, .25, s));
      // Ease into the tightest bend so the fan doesn't snap as a turn reverses.
      const bend = wanted - angle;
      const excess = Math.abs(bend) - 1.9 * DS;
      const softened = .75 * DS;
      angle += excess <= 0 ? bend : Math.sign(bend) *
        (1.9 * DS + softened * (1 - Math.exp(-excess / softened)));
      const tx = Math.cos(angle), ty = Math.sin(angle);
      const bone = bones[i];
      bone.x = x; bone.y = y; bone.tx = tx; bone.ty = ty;
      x += DS * tx;
      y += DS * ty;
    }
  }

  function paint() {
    if (!renderer || !width || phase === 'away') return;
    const scroll = scrollY / scale;
    // Even the fully extended engraving fits inside this radius of the nose.
    // Continue steering in document space while the reader scrolls past it.
    if (phase !== 'leaving' && (head.y < scroll-1.4 || head.y > scroll+viewHeight/scale+1.4)) {
      if (canvas.style.visibility !== 'hidden') canvas.style.visibility = 'hidden';
      updateGlass();
      return;
    }
    // The worker owns this buffer until it finishes drawing. Keep steering,
    // but skip building a pose that cannot be displayed.
    if (!mesh.xy.byteLength) {paintPending = true; return;}
    paintPending = false;
    pose();
    const bank = clamp(turnRate / .68, -1, 1);
    const animateFins = !reduced.matches;
    const {local,fin,xy} = mesh;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let k=0, p=0; k<local.length; k+=4, p+=2) {
      const i=local[k], f=local[k+1], l=local[k+2];
      let along = local[k+3], across = l;
      const kind = fin[k], reach = fin[k+1], rim = fin[k+2];
      const side = Math.sign(l);
      if (animateFins && kind === 1) {
        const pectoral = fin[k+3];
        // Row toward the tail and recover toward the head from a fixed hinge.
        const phase = finBeat + side * .82 - (1 - pectoral) - .72 * rim;
        along += reach * ((.26 + .09 * pectoral + .05 * effort) * Math.sin(phase) + side * bank * .05);
        across += side * reach * (.042 * Math.cos(phase) - .045);
      } else if (animateFins && kind === 2) {
        // The outer rays billow after the narrow tail stalk has reversed.
        const phase = beat - 3.9 * (i + f) * DS - .85 * rim;
        const billow = Math.sin(phase + side * .62);
        across += l * reach * (.028 * billow + .018 * side * Math.cos(phase));
        along += reach * rim * .005 * Math.sin(phase - .65 + side * 1.08);
      } else if (animateFins && kind === 3) {
        const whiskerSide = fin[k+3];
        const sway = .67 * beat - .85 * rim + .9 * whiskerSide;
        along += reach * (.005 + .002 * effort) * Math.sin(sway);
        across += reach * (.0038 * Math.cos(sway) + .002 * bank);
      }
      const a=bones[i], b=bones[i+1];
      const tx=mix(a.tx,b.tx,f), ty=mix(a.ty,b.ty,f);
      xy[p]=mix(a.x,b.x,f)+tx*along-ty*across;
      const y = mix(a.y,b.y,f)+ty*along+tx*across;
      xy[p+1]=y-scroll;
      minX=Math.min(minX,xy[p]); maxX=Math.max(maxX,xy[p]);
      minY=Math.min(minY,y); maxY=Math.max(maxY,y);
    }
    if (phase === 'leaving' && (maxX < 0 || minX > width/scale || maxY < 0 || minY > height/scale)) {
      waitOffscreen();
      return;
    }
    // Simulate in document coordinates, rasterize only the visible viewport.
    const visible = maxY >= scroll && minY <= scroll + viewHeight/scale;
    const visibility = visible ? '' : 'hidden';
    if (canvas.style.visibility !== visibility) canvas.style.visibility = visibility;
    if (visible) {
      updateGlass(minX * scale, minY * scale, maxX * scale, maxY * scale);
      renderer.draw(width/scale,viewHeight/scale,minX,minY-scroll,maxX,maxY-scroll);
    } else updateGlass();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    scrollY = window.scrollY;
    measureLeaves();
    const pageHeight = Math.max(rect.height,document.documentElement.scrollHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, renderer.pixelLimit);
    const pixelsX = Math.round(rect.width * pixelRatio), pixelsY = Math.round(rect.height * pixelRatio);
    if (width===rect.width && viewHeight===rect.height && height===pageHeight &&
        bufferWidth===pixelsX && bufferHeight===pixelsY) {
      if (reduced.matches) paint();
      return;
    }
    const oldW = width / scale, oldH = height / scale;
    width = rect.width;
    viewHeight = rect.height;
    height = pageHeight;
    scale = SIZE_INCREASE * 1.75 * Math.min(width * .46, viewHeight * .415, 630);
    if (bufferWidth!==pixelsX || bufferHeight!==pixelsY) {
      bufferWidth = pixelsX; bufferHeight = pixelsY;
      if (renderer.resize) renderer.resize(pixelsX,pixelsY);
      else {
        if (canvas.width!==pixelsX) canvas.width = pixelsX;
        if (canvas.height!==pixelsY) canvas.height = pixelsY;
      }
    }
    if (history.length) {
      head.x *= (width / scale) / oldW;
      head.y *= (height / scale) / oldH;
      if (departure) {
        departure.x *= (width/scale) / oldW;
        departure.y *= (height/scale) / oldH;
      }
      wander.end = 0;
      inwardAim = null;
      updateGuide();
    } else enter(true);
    paint();
  }

  function tick(now) {
    frame = 0;
    let remaining = lastTime ? Math.min(.075, (now - lastTime) / 1000) : 0;
    lastTime = now;
    while (remaining > .000001) {
      const dt = Math.min(remaining, 1/90);
      swim(dt, now);
      remaining -= dt;
    }
    paint();
    wake();
  }
  function wake() {
    if (renderer && width && phase !== 'away' && !reduced.matches && !frame && !document.hidden) {
      frame = requestAnimationFrame(tick);
    }
  }
  function updateGuide() {
    if (!pointer) return;
    guide ??= {x:0, y:0};
    guide.x = pointer.x / scale;
    guide.y = (pointer.y + scrollY) / scale;
  }
  function clearGuide() {
    pointer = guide = null;
    contactArmed = true;
  }
  function point(event) {
    if (!event.isPrimary || reduced.matches || document.documentElement.classList.contains('copy-editing')) return;
    pointer ??= {x:0, y:0};
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    updateGuide();
  }
  // The canvas is decorative. Native links, scrolling, touch and the site's
  // existing dot keep their normal hit targets above it.
  document.addEventListener('pointermove',point,{passive:true});
  document.addEventListener('pointerdown',point,{passive:true});
  document.documentElement.addEventListener('pointerleave',clearGuide);
  document.addEventListener('pointercancel',clearGuide);
  document.addEventListener('portfolio-copy-preview',clearGuide);
  window.addEventListener('blur',clearGuide);
  window.addEventListener('scroll',() => {
    scrollY = window.scrollY;
    updateGuide();
    if (phase === 'away') updateGlass();
    else if (reduced.matches) paint();
  },{passive:true});
  function syncPlayback() {
    cancelAnimationFrame(frame);
    clearTimeout(returnTimer);
    frame = lastTime = 0;
    if (document.hidden) {clearGuide(); return;}
    if (!renderer) return;
    if (phase === 'away') scheduleReturn();
    else {paint(); wake();}
  }
  reduced.addEventListener('change',() => {
    if (renderer) {
      edge = edges[0];
      departure = null;
      clearGuide();
      enter(true);
    }
    syncPlayback();
  });
  document.addEventListener('visibilitychange',syncPlayback);
  async function startRenderer(mask) {
    const original = canvas;
    const localRenderer = () => {
      original.addEventListener('koi-redraw',paint);
      return createKoiRenderer(original,mesh,mask);
    };
    if (!canvas.transferControlToOffscreen || !window.Worker || !window.createImageBitmap) {
      return localRenderer();
    }
    let worker;
    try {
      // Keep the original canvas available if this browser cannot start a
      // worker renderer (including offline previews with restricted workers).
      const display = original.cloneNode(false);
      const surface = display.transferControlToOffscreen();
      const bitmap = await createImageBitmap(mask);
      worker = new Worker(original.dataset.workerSrc);
      const pixelLimit = await new Promise((resolve,reject) => {
        worker.onerror = reject;
        worker.onmessage = ({data}) => {
          if (data.type === 'ready') resolve(data.pixelLimit);
          else if (data.type === 'redraw') paint();
          else if (data.type === 'drawn') {
            mesh.xy = data.positions;
            // Animated pages paint the latest simulation state on the next
            // frame. A stationary page may have resized while waiting.
            if (paintPending && reduced.matches && !document.hidden) paint();
          }
        };
        worker.postMessage({type:'init',surface,mask:bitmap,uv:mesh.uv,indices:mesh.indices},[surface,bitmap]);
      });
      original.replaceWith(display);
      canvas = display;
      worker.onerror = () => {
        worker.terminate();
        display.replaceWith(original);
        canvas = original;
        if (!mesh.xy.byteLength) mesh.xy = new Float32Array(mesh.uv.length);
        renderer = localRenderer();
        bufferWidth = 0;
        resize();
        canvas.classList.add('ready');
      };
      return {
        pixelLimit,
        resize:(width,height) => worker.postMessage({type:'size',width,height}),
        draw(...bounds) {
          worker.postMessage({type:'draw',bounds,positions:mesh.xy},[mesh.xy.buffer]);
        }
      };
    } catch {
      worker?.terminate();
      return localRenderer();
    }
  }
  const mask = new Image();
  mask.addEventListener('load', async () => {
    renderer = await startRenderer(mask);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(page);
    observer.observe(page.querySelector('.hero-water'));
    observer.observe(page.querySelector('.work-gallery'));
    window.addEventListener('resize',resize,{passive:true});
    canvas.classList.add('ready');
    wake();
  }, {once:true});
  mask.decoding = 'async';
  mask.src = canvas.dataset.inkSrc;
})();
