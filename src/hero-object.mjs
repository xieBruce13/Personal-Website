// Original, layered letter sculptures. No reference-site images or licensed fonts.
// Rounded vector silhouettes remain sharp at any viewport size, including offline.
const outlines = {
 dot:'M116 120 A20 20 0 1 1 76 120 A20 20 0 1 1 116 120 Z',
 X:[[9,15],[53,15],[96,91],[139,15],[183,15],[122,119],[186,225],[141,225],[96,148],[51,225],[6,225],[70,119]],
 Y:[[5,15],[50,15],[96,100],[142,15],[187,15],[118,139],[118,225],[74,225],[74,139]],
 Z:[[14,15],[179,15],[179,50],[66,186],[181,186],[181,225],[11,225],[11,190],[123,54],[14,54]],
 B:'M24 15 H102 Q170 15 170 70 Q170 102 145 116 Q181 130 181 168 Q181 225 108 225 H24 Q20 225 20 221 V19 Q20 15 24 15 Z M64 53 V100 H98 Q126 100 126 77 Q126 53 98 53 Z M64 138 V187 H104 Q136 187 136 163 Q136 138 104 138 Z'
};
function rounded(points,r=4){
 const corners=points.map((p,i)=>{
  const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
  const point=q=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);return p.map((v,k)=>v+(q[k]-v)*Math.min(r,d/3)/d)};
  return {p,a:point(prev),b:point(next)};
 });
 return `M${corners[0].a.join(',')} `+corners.map(({p,a,b},i)=>`${i?'L'+a.join(','):''} Q${p.join(',')} ${b.join(',')}`).join(' ')+' Z';
}
export function heroObject(l){
 const letters=Object.fromEntries(Object.entries(outlines).map(([letter,points],index)=>{
  const path=typeof points==='string'?points:rounded(points);
  const layers=Array.from({length:11},(_,i)=>{
   const id=`glass-${letter}-${i}`,edge=i===0||i===10;
   return `<svg class="glass-slice" viewBox="0 0 192 240" style="--slice:${i};--depth:${(i-5)*5.2}px;--slice-scale:${1-Math.abs(i-5)*.008}" aria-hidden="true"><defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2=".15" y2="1"><stop offset="0" stop-color="#c7e6ef" stop-opacity=".20"/><stop offset=".32" stop-color="#98cde1" stop-opacity=".22"/><stop offset=".50" stop-color="#bad5cd" stop-opacity=".16"/><stop offset=".57" stop-color="#eed769" stop-opacity=".32"/><stop offset=".64" stop-color="#f59a49" stop-opacity=".45"/><stop offset=".77" stop-color="#ed3b20" stop-opacity=".45"/><stop offset=".9" stop-color="#dd7952" stop-opacity=".29"/><stop offset="1" stop-color="#ede9cf" stop-opacity=".36"/></linearGradient>
    <radialGradient id="${id}-warm" cx="${45+index*8}%" cy="59%" r="52%"><stop offset="0" stop-color="#ffc39b" stop-opacity=".52"/><stop offset=".45" stop-color="#ffac80" stop-opacity=".35"/><stop offset=".69" stop-color="#c9e1a8" stop-opacity=".12"/><stop offset="1" stop-color="#9bbfd1" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-edge" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#fff" stop-opacity=".75"/><stop offset=".3" stop-color="#a4bbc5" stop-opacity=".18"/><stop offset=".58" stop-color="#e9f4ed" stop-opacity=".55"/><stop offset="1" stop-color="#b3956c" stop-opacity=".35"/></linearGradient>
    <linearGradient id="${id}-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".42"/><stop offset=".32" stop-color="#fff" stop-opacity="0"/><stop offset=".65" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
   </defs><path d="${path}" fill-rule="evenodd" fill="url(#${id}-body)"/><path d="${path}" fill-rule="evenodd" fill="url(#${id}-warm)"/><path d="${path}" fill-rule="evenodd" fill="${edge?`url(#${id}-light)`:'none'}" stroke="url(#${id}-edge)" stroke-width="${edge?1.2:.6}"/></svg>`;
  }).join('');
  return [letter,`<div class="letter-position letter-${letter.toLowerCase()}" aria-hidden="true"><div class="letter-interaction"><div class="glass-letter">${layers}</div></div></div>`];
 }));
 const lettersMarkup=['B','dot','X','Y','Z'].map(letter=>letters[letter]).join('');
 return `<div class="hero-object"><div class="xyz-stage" role="img" aria-label="B·XYZ"><div class="xyz-tilt" aria-hidden="true">${lettersMarkup}</div></div></div>`;
}
