// Generate an offline review file; this does not publish or commit anything.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
const font=(await readFile('dist/fonts/InterVariable.woff2')).toString('base64');
const css=(await readFile('dist/styles.css','utf8')).replaceAll('/fonts/InterVariable.woff2',`data:font/woff2;base64,${font}`);
const behavior=await readFile('dist/site.js','utf8');
const particles=await readFile('dist/particles.js','utf8');
const pages={};
const media={};
const mimeTypes={mp4:'video/mp4',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',pdf:'application/pdf',webp:'image/webp',svg:'image/svg+xml'};


const bridge=`<script>document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const href=link.getAttribute('href');if(href?.startsWith('#')){event.preventDefault();const target=document.getElementById(decodeURIComponent(href.slice(1)));target?.scrollIntoView();target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});return;}if(href?.startsWith('/')){event.preventDefault();parent.postMessage({type:'portfolio-route',path:href},'*');}});</script>`;
async function collect(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const file=dir+'/'+entry.name;if(entry.isDirectory())await collect(file);
 else if(entry.name==='index.html'){
  let html=await readFile(file,'utf8');
  html=html.replace('<link rel="stylesheet" href="/styles.css">','<style>__PORTFOLIO_STYLES__</style>')
   .replace('<script type="module" src="/site.js"></script>','')
   .replace('<script type="module" src="/particles.js"></script>','');
  const hasParticles=html.includes('id="particles"');
  html=html.replace('</body>',`<script>${behavior}</script>${hasParticles?`<script>${particles}</script>`:''}${bridge}</body>`);
  pages[file.slice(4,-10)]=html;
 }
}}
await collect('dist/en');await collect('dist/zh');
for(const project of ['pison','qwen','lora','eye-tracking'])for(const name of await readdir(`dist/media/${project}`)){const ext=name.split('.').pop(),path=`/media/${project}/${name}`;if(mimeTypes[ext]&&Object.values(pages).some(page=>page.includes(path)))media[path]={type:mimeTypes[ext],data:(await readFile(`dist/media/${project}/${name}`)).toString('base64')};}
const serialized=JSON.stringify(pages).replaceAll('<','\\u003c');
const preview=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bruce — Portfolio review</title><style>
*{box-sizing:border-box}html,body{height:100%;margin:0;background:#151613;color:#eee;font:13px Arial,sans-serif}header{height:55px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #34362e;gap:12px}header p{margin:0;color:#aeb3a5}header strong{font-weight:400;color:#eee}nav{display:flex;gap:6px}button{font:12px Arial;padding:8px 13px;border-radius:20px;border:1px solid #4d5246;color:#ddd;background:transparent;cursor:pointer;min-height:34px}button[aria-pressed=true]{background:#e2e3ec;color:#151613;border-color:#e2e3ec}button:focus-visible{outline:2px solid #bfc4eb;outline-offset:3px}main{height:calc(100% - 55px);display:flex;justify-content:center;overflow:hidden}iframe{height:100%;width:100%;border:0;background:#000}iframe.mobile{width:390px;max-width:100%;border-left:1px solid #34362e;border-right:1px solid #34362e}@media(max-width:600px){header{padding:0 10px}header p span{display:none}button{padding:8px 9px}}
</style></head><body><header><p><strong>Portfolio review</strong><span> · Local preview</span></p><nav aria-label="Preview controls"><button id="restart" aria-pressed="true">Home</button><button id="pison" aria-pressed="false">Pison</button><button id="qwen" aria-pressed="false">Qwen</button><button id="desktop" aria-pressed="true">Desktop</button><button id="mobile" aria-pressed="false">Mobile</button></nav></header><main><iframe title="Portfolio preview" id="preview" allow="autoplay; fullscreen" allowfullscreen></iframe></main><script>
const media=${JSON.stringify(media)};const assetURLs=Object.fromEntries(Object.entries(media).map(([path,file])=>[path,URL.createObjectURL(new Blob([Uint8Array.from(atob(file.data),c=>c.charCodeAt(0))],{type:file.type}))]));
const styles=${JSON.stringify(css).replaceAll('<','\\u003c')};const pages=${serialized};const frame=document.getElementById('preview');let current='/en/';let fragment='';
function show(path,record=true){const parts=path.split('#');current=parts[0]||current;fragment=parts[1]||'';if(!pages[current])current='/en/';frame.srcdoc=pages[current].replace('__PORTFOLIO_STYLES__',styles).replace(/(?:src|poster|href)="(\\/media\\/[^"]+)"/g,(match,path)=>match.replace(path,assetURLs[path]||path));if(record)history.pushState({route:path},'', '#'+path);}
window.addEventListener('popstate',()=>show(location.hash.slice(1)||'/en/',false));
frame.addEventListener('load',()=>{if(fragment)frame.contentDocument.getElementById(fragment)?.scrollIntoView();const active=current.includes('/work/pison/')?'pison':current.includes('/work/qwen-create/')?'qwen':'restart';for(const id of ['restart','pison','qwen'])document.getElementById(id)?.setAttribute('aria-pressed',String(id===active));});
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='portfolio-route')show(event.data.path);});
for(const mode of ['desktop','mobile'])document.getElementById(mode).addEventListener('click',()=>{frame.className=mode==='mobile'?'mobile':'';document.getElementById('desktop').setAttribute('aria-pressed',String(mode==='desktop'));document.getElementById('mobile').setAttribute('aria-pressed',String(mode==='mobile'));});
document.getElementById('pison').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/work/pison/':'/en/work/pison/'));
document.getElementById('qwen').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/work/qwen-create/':'/en/work/qwen-create/'));
document.getElementById('restart').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/':'/en/'));show(location.hash.slice(1)||'/en/',false);
</script></body></html>`;
await mkdir('previews',{recursive:true});
await writeFile('previews/review.html',preview);
await writeFile('previews/pison-review.html',preview.replace("show(location.hash.slice(1)||'/en/',false);\n</script>","show(location.hash.slice(1)||'/en/work/pison/',false);\n</script>"));
const qwenPages=Object.fromEntries(Object.entries(pages).filter(([route])=>route.endsWith('/work/qwen-create/')));
const qwenMedia=Object.fromEntries(Object.entries(media).filter(([path])=>path.startsWith('/media/qwen/')));
const qwenPreview=preview
 .replace(/const media=.*?;const assetURLs=/s,`const media=${JSON.stringify(qwenMedia)};const assetURLs=`)
 .replace(/const pages=.*?;const frame=/s,`const pages=${JSON.stringify(qwenPages).replaceAll('<','\\u003c')};const frame=`)
 .replace('<button id="restart" aria-pressed="true">Home</button><button id="pison" aria-pressed="false">Pison</button><button id="qwen" aria-pressed="false">Qwen</button>','<button id="qwen" aria-pressed="false">中文</button><button id="restart" aria-pressed="true">EN</button>')
 .replace("document.getElementById('pison').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/work/pison/':'/en/work/pison/'));",'')
 .replace("document.getElementById('qwen').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/work/qwen-create/':'/en/work/qwen-create/'));","document.getElementById('qwen').addEventListener('click',()=>show('/zh/work/qwen-create/'));")
 .replace("document.getElementById('restart').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/':'/en/'));","document.getElementById('restart').addEventListener('click',()=>show('/en/work/qwen-create/'));")
 .replace("if(!pages[current])current='/en/';","if(!pages[current])current='/en/work/qwen-create/';")
 .replace("show(location.hash.slice(1)||'/en/',false);\n</script>","show(location.hash.slice(1)||'/en/work/qwen-create/',false);\n</script>");
await writeFile('previews/qwen-review.html',qwenPreview);
// A much smaller standalone review for the edited homepage and Qwen case study.
// It omits Pison's long-form videos, which made the full review too heavy to open reliably.
const focusedRoutes=['/en/','/zh/','/en/work/qwen-create/','/zh/work/qwen-create/'];
const focusedPages=Object.fromEntries(Object.entries(pages).filter(([route])=>focusedRoutes.includes(route)));
const focusedMedia=Object.fromEntries(Object.entries(media).filter(([path])=>Object.values(focusedPages).some(page=>page.includes(path))));
const focusedPreview=preview
 .replace(/const media=.*?;const assetURLs=/s,`const media=${JSON.stringify(focusedMedia)};const assetURLs=`)
 .replace(/const pages=.*?;const frame=/s,`const pages=${JSON.stringify(focusedPages).replaceAll('<','\\u003c')};const frame=`)
 .replace('<button id="pison" aria-pressed="false">Pison</button>','')
 .replace("document.getElementById('pison').addEventListener('click',()=>show(current.startsWith('/zh/')?'/zh/work/pison/':'/en/work/pison/'));",'');
await writeFile('previews/home-qwen-review.html',focusedPreview);

// Open this case directly from disk. Other portfolio links continue in the full review.
const eyeReviewFile = language => language === 'en' ? 'eye-tracking-review.html' : 'eye-tracking-zh-review.html';
for (const language of ['en', 'zh']) {
  const route = '/' + language + '/work/eye-tracking-thingz/';
  const page = (await readFile('dist' + route + 'index.html', 'utf8'))
    .replace('<link rel="stylesheet" href="/styles.css">', () => '<style>' + css + '</style>')
    .replace('<script type="module" src="/site.js"></script>', () => '<script type="module">' + behavior + '</script>')
    .replace(/(src|poster)="(\/media\/[^"]+)"/g, (_, attr, path) => {
      const {type, data} = media[path];
      return attr + '="data:' + type + ';base64,' + data + '"';
    })
    .replace(/href="(\/(en|zh)\/[^"]*)"/g, (_, path, lang) =>
      'href="' + (path === '/' + lang + '/work/eye-tracking-thingz/' ? eyeReviewFile(lang) : 'review.html#' + path) + '"');
  await writeFile('previews/' + eyeReviewFile(language), page);
}
console.log('Created standalone previews/review.html with bilingual routes and responsive review controls.');
