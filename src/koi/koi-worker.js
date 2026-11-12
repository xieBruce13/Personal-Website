// Bundled after koi-render.js. The page owns input and the swimming simulation.
let surface, mesh, renderer;
self.onmessage = ({data}) => {
  if (data.type === 'init') {
    surface = data.surface;
    mesh = {indices:data.indices, uv:data.uv, xy:new Float32Array(data.uv.length)};
    renderer = createKoiRenderer(surface,mesh,data.mask);
    surface.addEventListener('koi-redraw',() => self.postMessage({type:'redraw'}));
    self.postMessage({type:'ready',pixelLimit:renderer.pixelLimit});
  } else if (data.type === 'size') {
    if (surface.width !== data.width) surface.width = data.width;
    if (surface.height !== data.height) surface.height = data.height;
  } else if (data.type === 'draw') {
    mesh.xy = data.positions;
    renderer.draw(...data.bounds);
    self.postMessage({type:'drawn',positions:mesh.xy},[mesh.xy.buffer]);
  }
};
