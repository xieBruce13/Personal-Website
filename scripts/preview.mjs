// Generate an offline review file; this does not publish or commit anything.
import {readFile,writeFile,readdir} from 'node:fs/promises';
const css=await readFile('dist/styles.css','utf8');
const behavior=await readFile('dist/site.js','utf8');
const particles=await readFile('dist/particles.js','utf8');
const pages={};
const bridge=`<script>document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const href=link.getAttribute('href');if(href?.startsWith('/')){event.preventDefault();parent.postMessage({type:'portfolio-route',path:href},'*');}});</script>`;
async function collect(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const file=dir+'/'+entry.name;if(entry.isDirectory())await collect(file);
 else if(entry.name==='index.html'){
  let html=await readFile(file,'utf8');
  html=html.replace('<link rel="stylesheet" href="/styles.css">',`<style>${css}</style>`)
   .replace('<script type="module" src="/site.js"></script>','')
   .replace('<script type="module" src="/particles.js"></script>','');
  const hasParticles=html.includes('id="particles"');
  html=html.replace('</body>',`<script>${behavior}</script>${hasParticles?`<script>${particles}</script>`:''}${bridge}</body>`);
  pages[file.slice(4,-10)]=html;
 }
}}
await collect('dist/en');await collect('dist/zh');
const serialized=JSON.stringify(pages).replaceAll('<','\\u003c');
const preview=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bruce Xie — Selected Work review</title><style>
*{box-sizing:border-box}html,body{height:100%;margin:0;background:#151613;color:#eee;font:13px Arial,sans-serif}header{height:55px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #34362e;gap:12px}header p{margin:0;color:#aeb3a5}header strong{font-weight:400;color:#eee}nav{display:flex;gap:6px}button{font:12px Arial;padding:8px 13px;border-radius:20px;border:1px solid #4d5246;color:#ddd;background:transparent;cursor:pointer;min-height:34px}button[aria-pressed=true]{background:#d3e2bc;color:#151613;border-color:#d3e2bc}button:focus-visible{outline:2px solid #e6ffc4;outline-offset:3px}main{height:calc(100% - 55px);display:flex;justify-content:center;overflow:hidden}iframe{height:100%;width:100%;border:0;background:#000}iframe.mobile{width:390px;max-width:100%;border-left:1px solid #34362e;border-right:1px solid #34362e}@media(max-width:600px){header{padding:0 10px}header p span{display:none}button{padding:8px 9px}}
</style></head><body><header><p><strong>Selected Work review</strong><span> · Uncommitted draft</span></p><nav aria-label="Preview controls"><button id="desktop" aria-pressed="true">Desktop</button><button id="mobile" aria-pressed="false">Mobile</button><button id="restart">Back to start</button></nav></header><main><iframe title="Portfolio preview" id="preview"></iframe></main><script>
const pages=${serialized};const frame=document.getElementById('preview');let current='/en/';let fragment='';
function show(path){const parts=path.split('#');current=parts[0]||current;fragment=parts[1]||'';if(!pages[current])current='/en/';frame.srcdoc=pages[current];}
frame.addEventListener('load',()=>{if(fragment)frame.contentDocument.getElementById(fragment)?.scrollIntoView();});
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='portfolio-route')show(event.data.path);});
for(const mode of ['desktop','mobile'])document.getElementById(mode).addEventListener('click',()=>{frame.className=mode==='mobile'?'mobile':'';document.getElementById('desktop').setAttribute('aria-pressed',String(mode==='desktop'));document.getElementById('mobile').setAttribute('aria-pressed',String(mode==='mobile'));});
document.getElementById('restart').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/':'/en/'));show('/en/');
</script></body></html>`;
await writeFile('dist/review.html',preview);
console.log('Created standalone dist/review.html with bilingual routes and responsive review controls.');
