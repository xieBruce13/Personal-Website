import {pathToFileURL} from 'node:url';
import {pisonCover, studyCover, placeholderCovers} from './src/project-covers.mjs';
import {icon} from './src/icons.mjs';
import {readEdits,renderCopy} from './scripts/portfolio-copy.mjs';
import {pisonCase} from './src/case-studies/pison.mjs';
import {freudCase} from './src/case-studies/freud.mjs';
import {eyeCase} from './src/case-studies/experiments.mjs';
import {mkdir,writeFile,copyFile,readFile,rm,cp} from 'node:fs/promises';
const {projects:allProjects,copy,site}=JSON.parse(await readFile(new URL('./src/content.json',import.meta.url),'utf8'));
const pison=JSON.parse(await readFile(new URL('./src/case-studies/pison.json',import.meta.url),'utf8'));
const qwen=JSON.parse(await readFile(new URL('./src/case-studies/qwen.json',import.meta.url),'utf8'));
const aboutData=JSON.parse(await readFile(new URL('./src/case-studies/about.json',import.meta.url),'utf8'));
const projects=site.featuredProjects.map(slug=>allProjects.find(p=>p.slug===slug));
const featuredProjects=projects;
const nextProject=p=>{const sequence=featuredProjects.includes(p)?featuredProjects:projects;return sequence[(sequence.indexOf(p)+1)%sequence.length]};
const get=(p,k,l)=>typeof p[k]==='object'?p[k][l]:p[k]||'';
const displayName = l => l === 'zh' ? site.chineseName : site.name;
function languageSwitch(l, path='') {
  return `<a class="language" href="/${l==='en'?'zh':'en'}/${path}" lang="${l==='en'?'zh-CN':'en'}" aria-label="${copy[l].switchLanguage}"><span class="${l==='en'?'active':''}">EN</span><span class="language-divider">/</span><span class="${l==='zh'?'active':''}">中文</span></a>`;
}
function header(l,path=''){
 const c=copy[l];
 const nav=(route,label)=>`<a class="nav-link" href="/${l}/${route}/" ${path.startsWith(route+'/')?'aria-current="page"':''}>${label}</a>`;
 const homeGallery=['','crab/','painted-crab/'].includes(path);
 const work=`<div class="nav-work"><a class="nav-link" href="${homeGallery ? '' : '/'+l+'/'}#work">${c.index}</a></div>`;
 return `<a class="skip" href="#main">${c.skip}</a><header class="header"><a class="identity" href="/${l}/">${displayName(l)}</a><span class="header-role">${c.headerRole}</span><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span>${c.menu}</span><i aria-hidden="true"></i></button><nav id="primary-navigation" aria-label="${c.navigation}">${work}${nav('about',c.about)}${nav('contact',c.contact)}${languageSwitch(l,path)}</nav></header>`
}
function footer(){return ''}
// Decide before the gallery exists so a bookmarked preview cannot start an anchor scroll.
const homeOpening = `<script>(function () {
  if (location.protocol === 'about:') return;
  const type = performance.getEntriesByType('navigation')[0]?.type;
  const previous = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (type !== 'back_forward' && location.hash === '#work' && (type === 'reload' || !document.referrer.startsWith(location.origin + '/'))) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }
  function rememberPosition() {
    history.replaceState({...history.state, homeScrollY:window.scrollY}, '');
  }
  function restorePosition(state) {
    if (Number.isFinite(state?.homeScrollY)) window.scrollTo({top:state.homeScrollY, behavior:'instant'});
  }
  window.addEventListener('pagehide', rememberPosition);
  document.addEventListener('click', event => {
    if (event.target.closest?.('a[href^="#"]')) rememberPosition();
  });
  window.addEventListener('popstate', event => restorePosition(event.state));
  if (type === 'back_forward') {
    window.addEventListener('pageshow', () => restorePosition(history.state), {once:true});
  } else if (type === 'reload' && !location.hash && previous === 'auto') {
    // A tab opened before this behavior may still have an automatic position saved.
    window.addEventListener('pageshow', () => requestAnimationFrame(() => window.scrollTo({top:0, behavior:'instant'})), {once:true});
  }
})();</script>`;
function shell(l,path,title,body){const c=copy[l];return `<!doctype html><html${path.startsWith('work/')?' data-project-page':''} lang="${l==='zh'?'zh-CN':'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${c.meta}"><meta name="theme-color" content="#ffffff"><title>${title}</title><link rel="alternate" hreflang="en" href="/en/${path}"><link rel="alternate" hreflang="zh-CN" href="/zh/${path}">${path === '' ? homeOpening : ''}<link rel="stylesheet" href="/styles.css"><script type="module" src="/site.js"></script></head><body id="top">${header(l,path)}${body}${footer(l,path!=='contact/')}</body></html>`}
function artwork(p,l){if(p.slug==='pison')return pisonCover(l);if(p.slug==='lucian-freud-lora')return studyCover(p.slug,l);return `<div class="project-art art-${p.slug}" aria-hidden="true"><div class="art-shape"></div><span>${p.name}</span></div>`}
const galleryFilm=(className,src,poster,title,playbackRate=1)=>`<span class="gallery-film ${className}" aria-hidden="true"><video class="gallery-preview-video" data-playback-rate="${playbackRate}" muted loop playsinline preload="none" poster="${poster}"><source src="${src}" type="video/mp4"></video><span class="gallery-film-meta"><span class="gallery-film-title">${title}</span></span></span>`;
const pisonGalleryFilm=()=>galleryFilm('gallery-pison','/media/pison/card-three-shots-loop.mp4','/media/pison/card-13-30-poster.webp','Pison Agent');
const qwenGalleryFilm=()=>galleryFilm('gallery-qwen','/media/qwen/card-shampoo-moon-soft-loop.mp4','/media/qwen/card-shampoo-styles-slow-poster.webp','Qwen Create');
const eyeGalleryFilm=()=>galleryFilm('gallery-eye','/media/eye-tracking/attention-heatmap-loop.mp4','/media/eye-tracking/attention-heatmap-poster.webp','Eye Tracking');
const loraGalleryFilm=()=>galleryFilm('gallery-lora','/media/lora/gallery-blink.mp4','/media/lora/gallery-blink-poster.webp','Defying Freud');
function cards(l,subset=projects){const c=copy[l];return subset.map(p=>{const name=get(p,'galleryTitle',l)||p.name,category=get(p,'galleryCategory',l);const href=`/${l}/work/${p.slug}/`;const cover=p.slug==='pison'?pisonGalleryFilm():p.slug==='qwen-create'?qwenGalleryFilm():p.slug==='eye-tracking-thingz'?eyeGalleryFilm():p.slug==='lucian-freud-lora'?loraGalleryFilm():studyCover(p.slug,l);return `<article class="project-card" data-gallery-tile><a class="project-image" href="${href}" aria-label="${c.view} — ${name}: ${category}">${cover}<span class="project-open" aria-hidden="true">${icon('arrow')}</span></a><p class="gallery-card-category">${category}</p></article>`}).join('')}
function home(l, path = ''){
 const c=copy[l];
 const painted=path!=='crab/';
 const backdrop=painted
   ? '<img id="crab-study" hidden alt="" src="/media/crab/van-gogh-study.webp"><img id="crab-legs" hidden alt="" src="/media/crab/walking-legs.webp"><script defer src="/media/crab/painted.js"></script><script defer src="/media/crab/letters.js"></script>'
   : '<div class="crab-footprints" aria-hidden="true"></div>';
 const animal=backdrop+'<canvas class="walking-crab" aria-hidden="true"></canvas>';
 const name=painted ? '<span class="hero-name">BRUCE XIE</span>' : '';
 return shell(l,path,c.title,`<main id="main" class="home-page">${animal}<section class="hero"><div class="hero-water" aria-hidden="true"></div>${name}<h1 aria-labelledby="hero-phrase hero-emphasis"><span id="hero-phrase" class="hero-line-muted">${c.heroLineOne}</span><br class="mobile-break"> <span id="hero-emphasis" class="hero-line-emphasis">${c.heroLineTwo}</span></h1><p>${c.role}</p><div class="hero-bottom"><a href="#work">${c.scrollPrompt} ${icon('down')}</a></div></section><section id="work" class="work-gallery">${cards(l,featuredProjects)}</section></main><script defer src="/media/crab/walk.js"></script>`);
}
function qwenProject(l,p){
 const c=copy[l],q=qwen[l],path=`work/${p.slug}/`;
 return shell(l,path,`${p.name} — ${displayName(l)}`,`<main id="main" class="detail qwen-page">
  <a class="back" href="/${l}/#work">${icon('left')} ${c.home}</a>
  <section class="qwen-opening"><h1>${p.name}</h1><h2>${q.headline}</h2><p class="qwen-intro">${q.intro}</p><p class="qwen-role">${q.role}</p></section>
  <figure class="qwen-preview" id="project-media">
   <a class="qwen-preview-link" href="${qwen.url}" target="_blank" rel="noopener noreferrer" aria-label="${q.open}">
    <img src="/media/qwen/ad-video-creator-english.png" width="2048" height="1103" alt="${q.imageAlt}" loading="eager" decoding="async">
    <span class="qwen-preview-action" aria-hidden="true">${q.open} ${icon('arrow')}</span>
   </a>
   <figcaption>${q.access}</figcaption>
  </figure>
  <section class="qwen-audience" id="qwen-audience" aria-labelledby="qwen-audience-heading">
   <span class="qwen-section-label">${q.targetLabel}</span>
   <div><h2 id="qwen-audience-heading">${q.targetTitle}</h2><p>${q.targetBody}</p><ul>${q.targetPoints.map(point=>`<li>${point}</li>`).join('')}</ul></div>
  </section>
  <section class="qwen-overview" id="qwen-overview" aria-labelledby="qwen-overview-heading">
   <div class="qwen-overview-intro">
    <span class="qwen-section-label">${q.overviewLabel}</span>
    <div><h2 id="qwen-overview-heading">${q.overviewTitle}</h2><p>${q.overviewBody}</p></div>
   </div>
   <div class="qwen-agent-map" aria-label="${q.leadAgent}, ${q.specialistCount}, ${q.specialistNote}">
    <div class="qwen-lead-agent"><span class="qwen-lead-mark" aria-hidden="true"><span></span><span></span><span></span></span><div><strong>${q.leadAgent}</strong><span>${q.leadAgentNote}</span></div></div>
    <div class="qwen-agent-connector" aria-hidden="true"></div>
    <div class="qwen-specialists">
     ${Array.from({length:5},(_,i)=>`<span class="qwen-specialist" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>`).join('')}
    </div>
    <p><strong>${q.specialistCount}</strong><span>${q.specialistNote}</span></p>
   </div>
   <div class="qwen-feature-grid" role="group" aria-label="${q.featuresLabel}">
    ${q.features.map(feature=>`<div><h3>${feature.title}</h3><p>${feature.body}</p></div>`).join('')}
   </div>
   <div class="qwen-workflow">
    <div class="qwen-workflow-heading"><span class="qwen-section-label">${q.workflowLabel}</span><h3>${q.workflowTitle}</h3></div>
    <ol>${q.steps.map((step,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><strong>${step}</strong></li>`).join('')}</ol>
    <p>${q.flowNote}</p>
   </div>
  </section>
 </main>`);
}
function project(l,p){const c=copy[l],path=`work/${p.slug}/`;if(p.slug==='pison')return shell(l,path,`Pison Health Agent — ${displayName(l)}`,`<main id="main" class="detail pison-case"><a class="back" href="/${l}/#work">${icon('left')} ${c.home}</a>${pisonCase(pison,l)}</main>`);if(p.slug==='qwen-create')return qwenProject(l,p);if(['eye-tracking-thingz','lucian-freud-lora'].includes(p.slug))return shell(l,path,`${p.name} — ${displayName(l)}`,`<main id="main" class="detail experimental-case ${p.slug==='eye-tracking-thingz'?'eye-case':'freud-case'}"><a class="back" href="/${l}/#work">${icon('left')} ${c.home}</a>${p.slug==='eye-tracking-thingz'?eyeCase(l):freudCase(l)}</main>`);return shell(l,path,`${p.name} — ${displayName(l)}`,`<main id="main" class="detail"><a class="back" href="/${l}/#work">${icon('left')} ${c.home}</a><section class="detail-hero"><div class="detail-title-row"><h1>${p.name}</h1><a class="detail-scroll" href="#project-media">${c.scrollPrompt} ${icon('down')}</a></div><p class="detail-summary">${get(p,'summary',l)}</p><dl class="project-meta">${p.role?`<div><dt>${c.contribution}</dt><dd>${get(p,'role',l)}</dd></div>`:''}${p.period?`<div><dt>${c.period}</dt><dd>${p.period}</dd></div>`:''}<div><dt>${c.project}</dt><dd>${get(p,'type',l)}</dd></div><div><dt>${c.focus}</dt><dd>${get(p,'focus',l)}</dd></div></dl>${p.url?`<a class="external-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.visit} ${icon('arrow')}</a>`:''}</section><div id="project-media" class="detail-art">${artwork(p,l)}</div><section class="detail-section"><h2>${c.details}</h2><div><p>${get(p,'body',l)}</p>${p.contribution?`<h3>${c.contribution}</h3><p>${get(p,'contribution',l)}</p>`:''}<div class="editorial-note"><span class="status-dot"></span><div><strong>${p.wip?c.inProgress:c.coming}</strong><p>${c.comingBody}</p></div></div></div></section><a class="next-project" href="/${l}/work/${nextProject(p).slug}/"><span>${c.next}</span><strong>${nextProject(p).name} ${icon('arrow')}</strong></a></main>`)}
function about(l){
 const c=copy[l],a=aboutData[l];
 return shell(l,'about/',`${c.about} — ${displayName(l)}`,`<main id="main" class="detail about-page">
  <a class="back" href="/${l}/">${icon('left')} ${c.home}</a>
  <section class="about-opening" aria-labelledby="about-heading">
   <p class="about-overline">${a.eyebrow}</p>
   <h1 id="about-heading">${a.headline}</h1>
   <div class="about-intro-row"><p class="about-intro">${a.intro}</p><p class="about-bio">${a.bio}</p></div>
   <ul class="about-focus">${a.focus.map(item=>`<li>${item}</li>`).join('')}</ul>
  </section>
  <section class="about-section" aria-labelledby="about-experience-title"><div class="about-section-heading"><span class="about-index">01 /</span><h2 id="about-experience-title">${a.experienceTitle}</h2></div>
   <div class="about-section-content about-timeline">${a.experience.map(item=>`<article class="about-position"><div class="about-position-identity"><h3>${item.company}</h3><p>${item.period}</p></div><div class="about-position-story"><p class="about-role">${item.role}</p><p class="about-position-lead">${item.summary}</p><ul>${item.details.map(detail=>`<li>${detail}</li>`).join('')}</ul></div></article>`).join('')}</div>
  </section>
  <section class="about-section" aria-labelledby="about-education-title"><div class="about-section-heading"><span class="about-index">02 /</span><h2 id="about-education-title">${a.educationTitle}</h2></div>
   <div class="about-section-content about-education">${a.education.map(item=>`<article><div><h3>${item.school}</h3><span>${item.period}</span></div><div><p>${item.degree}</p><p class="about-subtle">${item.focus}</p></div></article>`).join('')}</div>
  </section>
  <section class="about-section" aria-labelledby="about-capabilities-title"><div class="about-section-heading"><span class="about-index">03 /</span><h2 id="about-capabilities-title">${a.capabilitiesTitle}</h2></div>
   <div class="about-section-content about-capabilities">${a.capabilities.map(item=>`<div><h3>${item.name}</h3><p>${item.items}</p></div>`).join('')}</div>
  </section>
  <section id="contact" class="about-contact"><p>${a.contactLabel}</p><h2>${a.contactTitle}</h2><a href="mailto:${site.email}">${site.email} ${icon('arrow')}</a></section>
 </main>`)
}
function contact(l){const c=copy[l];return shell(l,'contact/',`${c.contact} — ${displayName(l)}`,`<main id="main" class="contact-page"><h1>${c.contactTitle}</h1><div class="contact-layout"><div><span class="eyebrow">${c.contact}</span><a class="contact-email" href="mailto:${site.email}">${site.email}<span>${icon('arrow')}</span></a><p>${c.aboutIntro}</p></div><div class="contact-secondary"><span class="eyebrow">${c.location}</span><a class="dot-link" href="/${l}/about/">${c.resume}</a><a class="pill" href="mailto:${site.email}"><span>${icon('arrow')}</span>${c.sayHello}</a></div></div></main>`)}
export const pages = new Map();
for (const lang of ['en', 'zh']) {
 const prefix = '/' + lang + '/';
 pages.set(prefix, home(lang));
 pages.set(prefix + 'about/', about(lang));
 pages.set(prefix + 'contact/', contact(lang));
 for (const p of projects) pages.set(prefix + 'work/' + p.slug + '/', project(lang, p));
}

async function build() {
 const root = 'dist';
 const edits = await readEdits();
 await rm(root,{recursive:true,force:true});
 await mkdir(root,{recursive:true});
 await cp('src/fonts',`${root}/fonts`,{recursive:true});
 await cp('src/media',`${root}/media`,{recursive:true});
 for(const file of ['particles.js','site.js']) await copyFile(`src/${file}`,`${root}/${file}`);
 const componentFiles = ['styles', 'pison-product', 'project-covers', 'project-gallery', 'pond', 'qwen-product', 'research-cases', 'about-page', 'navigation', 'project-transition'];
 const components = await Promise.all(componentFiles.map(name => readFile('src/' + name + '.css', 'utf8')));
 const tokens = await readFile('src/design-tokens.css', 'utf8');
 const typography = await readFile('src/typography.css', 'utf8');
 await writeFile(root + '/styles.css', tokens + '\n@layer components {\n' + components.join('\n') + '\n}\n' + typography);
 for (const [route, source] of pages) {
  const html = renderCopy(source, route, edits).html;
  await mkdir(root + route, {recursive:true});
  await writeFile(root + route + 'index.html', html);
  if (/^\/(en|zh)\/$/.test(route)) {
   await mkdir(root + route + 'work/', {recursive:true});
   await writeFile(root + route + 'work/index.html', html);
   for (const variant of ['crab/', 'painted-crab/']) {
    await mkdir(root + route + variant, {recursive:true});
    await writeFile(root + route + variant + 'index.html', renderCopy(home(route.split('/')[1], variant), route, edits).html);
   }
   if (route === '/en/') await writeFile(root + '/index.html', html);
  }
 }
 await copyFile('src/hosted-review.html',`${root}/review.html`);
 for(const [name,route] of [['pison','pison'],['qwen','qwen-create']]){
  const destination=`/review.html#/en/work/${route}/`;
  await writeFile(`${root}/${name}-review.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><title>${name} portfolio review</title><script>location.replace(${JSON.stringify(destination)})</script><a href="${destination}">Open the ${name} review</a></html>`);
 }
 await writeFile(`${root}/404.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Bruce</title><link rel="stylesheet" href="/styles.css"><main class="detail"><h1>Page not found.</h1><a href="/en/">Return to the index ${icon('arrow')}</a></main></html>`);
 console.log(`Built bilingual home, about, contact, and ${projects.length} selected project routes.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await build();
