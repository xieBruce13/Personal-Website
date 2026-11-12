// A single ink plate follows a deforming grid. Both renderers sample the same
// coverage map, including the transparent paper cuts inside each scale and fin.
const koiInk = [179, 38, 22];

function createKoiRenderer(canvas, mesh, mask) {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true
  });
  if (!gl) return softwareRenderer(canvas, mesh, mask);
  const powerOfTwo = n => 2 ** Math.ceil(Math.log2(n));
  const tw = powerOfTwo(mask.width), th = powerOfTwo(mask.height);

  function configure() {
    const program = gl.createProgram();
    function attach(type, code) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    attach(gl.VERTEX_SHADER,
      'attribute vec2 pos, uv; uniform vec2 viewport, crop; varying vec2 st;' +
      'void main(){st=uv*crop;gl_Position=vec4(pos/viewport*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);}');
    attach(gl.FRAGMENT_SHADER,
      'precision mediump float; varying vec2 st; uniform sampler2D print; uniform vec3 ink;' +
      'void main(){float a=texture2D(print,st).r;gl_FragColor=vec4(ink*a,a);}');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const viewport = gl.getUniformLocation(program,'viewport');
    gl.uniform2f(gl.getUniformLocation(program,'crop'),mask.width/tw,mask.height/th);
    gl.uniform3fv(gl.getUniformLocation(program,'ink'),koiInk.map(channel => channel/255));
    function attribute(name, data, usage) {
      const loc = gl.getAttribLocation(program,name);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,usage);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      return buffer;
    }
    attribute('uv',mesh.uv,gl.STATIC_DRAW);
    const positions = attribute('pos',mesh.uv.byteLength,gl.DYNAMIC_DRAW);
    const triangles = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangles);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,tw,th,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,null);
    gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,mask);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    return (w,h) => {
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(viewport,w,h);
      gl.bindBuffer(gl.ARRAY_BUFFER,positions);
      gl.bufferSubData(gl.ARRAY_BUFFER,0,mesh.xy);
      gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
    };
  }
  let render = configure();
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); render = null; });
  canvas.addEventListener('webglcontextrestored', () => { render = configure(); canvas.dispatchEvent(new Event('koi-redraw')); });
  return {pixelLimit: 2.5, draw:(w,h) => { if (render) render(w,h); }};
}

function softwareRenderer(canvas, mesh, mask) {
  const ctx = canvas.getContext('2d');
  const {width,height} = mask;
  const plate = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(width,height) : document.createElement('canvas');
  plate.width = width;
  plate.height = height;
  const source = plate.getContext('2d', {willReadFrequently:true});
  source.drawImage(mask, 0, 0);
  const rgba = source.getImageData(0,0,width,height).data;
  const coverage = new Uint8Array(width*height);
  for (let i=0; i<coverage.length; i++) coverage[i] = rgba[i*4];
  const levels = [{pixels:coverage,w:width,h:height}];
  // Prefilter the engraving before reducing it to a phone-sized fish.
  while (levels.at(-1).w > 192) {
    const parent = levels.at(-1);
    const w = Math.floor(parent.w/2), h = Math.floor(parent.h/2);
    const pixels = new Uint8Array(w*h);
    for (let y=0; y<h; y++) for (let x=0; x<w; x++) {
      const p=2*y*parent.w+2*x, a=parent.pixels;
      pixels[y*w+x]=(a[p]+a[p+1]+a[p+parent.w]+a[p+parent.w+1]+2)>>2;
    }
    levels.push({pixels,w,h});
  }
  const {indices,uv} = mesh;
  // Store the ink and each possible opacity as a single native pixel.
  const palette = new Uint32Array(256), colors = new Uint8Array(palette.buffer);
  for (let alpha=0; alpha<256; alpha++) colors.set([...koiInk,alpha],alpha*4);
  let frame, ink, previous = null;
  return {pixelLimit:1.5, draw(w,h,minX,minY,maxX,maxY) {
    const xy = mesh.xy;
    if (previous) ctx.clearRect(previous.x,previous.y,previous.width,previous.height);
    previous = null;
    const sx=canvas.width/w, sy=canvas.height/h;
    const left=Math.max(0,Math.floor(minX*sx)), top=Math.max(0,Math.floor(minY*sy));
    const right=Math.min(canvas.width,Math.ceil(maxX*sx)), bottom=Math.min(canvas.height,Math.ceil(maxY*sy));
    const widthPx=right-left, heightPx=bottom-top;
    if (widthPx<=0 || heightPx<=0) return;
    // Reuse a tile that grows in blocks as the fish turns. Leave the rest of
    // the viewport alone, including the area behind the project cards.
    if (!frame || frame.width<widthPx || frame.height<heightPx) {
      frame=ctx.createImageData(Math.max(frame?.width||0,Math.ceil(widthPx/64)*64),
        Math.max(frame?.height||0,Math.ceil(heightPx/64)*64));
      ink=new Uint32Array(frame.data.buffer);
    }
    ink.fill(0,0,frame.width*heightPx);
    const level=levels[Math.max(0,Math.min(levels.length-1,Math.floor(Math.log2(width/sx))))];
    const tex=level.pixels, tw=level.w, th=level.h;
    for(let i=0;i<indices.length;i+=3) {
      let a=2*indices[i],b=2*indices[i+1],c=2*indices[i+2];
      if (xy[a+1]>xy[b+1]) [a,b]=[b,a];
      if (xy[b+1]>xy[c+1]) [b,c]=[c,b];
      if (xy[a+1]>xy[b+1]) [a,b]=[b,a];
      const ax=xy[a]*sx,ay=xy[a+1]*sy,bx=xy[b]*sx,by=xy[b+1]*sy,cx=xy[c]*sx,cy=xy[c+1]*sy;
      const abX=bx-ax, abY=by-ay, acX=cx-ax, acY=cy-ay;
      const det=abX*acY-abY*acX;
      if(Math.abs(det)<.0001) continue;
      // Walk each covered scanline once. Texture coordinates advance by a
      // constant amount per pixel throughout an affine triangle.
      const abU=(uv[b]-uv[a])*tw, acU=(uv[c]-uv[a])*tw;
      const abV=(uv[b+1]-uv[a+1])*th, acV=(uv[c+1]-uv[a+1])*th;
      const du=(abU*acY-acU*abY)/det, dv=(abV*acY-acV*abY)/det;
      const uY=(abX*acU-acX*abU)/det, vY=(abX*acV-acX*abV)/det;
      const y0=Math.max(top,Math.ceil(ay-.5)), y1=Math.min(bottom,Math.ceil(cy-.5));
      for(let y=y0;y<y1;y++) {
        const dy=y+.5-ay;
        const first=ax+acX*dy/acY;
        const second=y+.5<by ? ax+abX*dy/abY : bx+(cx-bx)*(y+.5-by)/(cy-by);
        const x0=Math.max(left,Math.ceil(Math.min(first,second)-.5));
        const x1=Math.min(right,Math.ceil(Math.max(first,second)-.5));
        let u=uv[a]*tw-.5 + du*(x0+.5-ax) + uY*dy;
        let v=uv[a+1]*th-.5 + dv*(x0+.5-ax) + vY*dy;
        let dest=(y-top)*frame.width+x0-left;
        for(let x=x0;x<x1;x++,u+=du,v+=dv) {
          const tx=Math.min(tw-1.001,Math.max(0,u)), ty=Math.min(th-1.001,Math.max(0,v));
          const ix=tx|0, iy=ty|0, fx=tx-ix, fy=ty-iy, p=iy*tw+ix;
          const upper=tex[p]+(tex[p+1]-tex[p])*fx;
          const lower=tex[p+tw]+(tex[p+tw+1]-tex[p+tw])*fx;
          ink[dest++]=palette[(upper+(lower-upper)*fy+.5)|0];
        }
      }
    }
    ctx.putImageData(frame,left,top,0,0,widthPx,heightPx);
    previous={x:left,y:top,width:widthPx,height:heightPx};
  }};
}
