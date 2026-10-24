import {mkdir,writeFile,copyFile,readFile,rm} from 'node:fs/promises';
const {projects,copy,site}=JSON.parse(await readFile(new URL('./src/content.json',import.meta.url),'utf8'));
const root='dist';
await rm(root,{recursive:true,force:true});
await mkdir(root,{recursive:true});
for(const file of ['styles.css','particles.js','site.js']) await copyFile(`src/${file}`,`${root}/${file}`);
const get=(p,k,l)=>typeof p[k]==='object'?p[k][l]:p[k]||'';
const displayName = l => l === 'zh' ? site.chineseName : site.name;
function languageSwitch(l, path='') {
  return `<a class="language" href="/${l==='en'?'zh':'en'}/${path}" lang="${l==='en'?'zh-CN':'en'}" aria-label="${copy[l].switchLanguage}"><span class="${l==='en'?'active':''}">EN</span><span class="language-divider">/</span><span class="${l==='zh'?'active':''}">中文</span></a>`;
}
function header(l,path='',landing=false){const c=copy[l];return `<a class="skip" href="#main">${c.skip}</a><header class="header ${landing?'home-header':''}"><a class="identity" href="/${l}/" aria-label="${displayName(l)} — ${c.homeLabel}">${displayName(l)}</a><nav aria-label="${c.navigation}"><a href="/${l}/#work">${c.index}<sup>${String(projects.length).padStart(2,'0')}</sup></a><a href="/${l}/about/" ${path==='about/'?'aria-current="page"':''}>${c.about}</a><a class="contact-nav" href="mailto:${site.email}">${c.contact}<span aria-hidden="true"> ↗</span></a></nav>${landing?'':languageSwitch(l,path)}</header>`}
function footer(l){const c=copy[l];return `<footer class="footer"><div class="footer-top"><h2>${c.footer}</h2><a class="hello" href="mailto:${site.email}">${c.sayHello}<span aria-hidden="true">↗</span></a></div><div class="footer-bottom"><span>© ${site.copyrightYear} ${displayName(l)}</span><span>${c.location}</span><a href="#top">${c.top} ↑</a></div></footer>`}
function shell(l,path,title,body,particle=false){const c=copy[l];return `<!doctype html><html lang="${l==='zh'?'zh-CN':'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${c.meta}"><meta name="theme-color" content="#10110f"><title>${title}</title><link rel="alternate" hreflang="en" href="/en/${path}"><link rel="alternate" hreflang="zh-CN" href="/zh/${path}"><link rel="stylesheet" href="/styles.css"><script type="module" src="/site.js"></script>${particle?'<script type="module" src="/particles.js"></script>':''}</head><body id="top" class="${particle?'home-page':''}">${particle?'<div class="particle-background" aria-hidden="true"><canvas id="particles"></canvas></div>':''}${header(l,path,particle)}${body}${footer(l)}</body></html>`}
function cards(l) {
  const c=copy[l];
  return `<div class="work-group">
    ${projects.map(p=>{
      const number=String(projects.indexOf(p)+1).padStart(2,'0');
      return `<div class="project-stage"><article class="project-card" data-number="${number}" aria-labelledby="title-${p.slug}">
        <div class="number-rail"><span class="project-number" aria-hidden="true">${number}</span><span class="sr-only">${c.project} ${number}</span></div>
        <div class="card-copy">
          <p class="card-kind">${get(p,'type',l)}</p>
          <h3 id="title-${p.slug}"><a href="/${l}/work/${p.slug}/">${p.name}</a></h3>
          <p class="card-description">${get(p,'summary',l)}</p>
          <dl class="card-focus"><dt>${c.focus}</dt><dd>${get(p,'focus',l)}</dd></dl>
          <a class="card-link" href="/${l}/work/${p.slug}/">${c.view}<span aria-hidden="true">↗</span><span class="sr-only"> — ${p.name}</span></a>
        </div>
        <figure class="card-visual">
          <a class="media-link" href="/${l}/work/${p.slug}/" aria-label="${c.view} — ${p.name}">
            <div class="media-placeholder" style="--media-tone:${p.visualTone}"><span class="media-marker" aria-hidden="true">+</span><span class="media-name">${p.name}</span><span class="media-format">${c.mediaPlaceholder}</span><span class="media-corner" aria-hidden="true">↗</span></div>
          </a>
          <figcaption><span>${c.visualPlaceholder}</span></figcaption>
        </figure>
      </article></div>`;
    }).join('')}
  </div>`;
}
function home(l) {
  const c = copy[l];
  return shell(l, '', c.title, `
    <main id="main">
      <section class="hero" aria-labelledby="intro-title">
        <div class="intro">
          <h1 id="intro-title">${c.role}</h1>
          <p>${c.intro}</p>
          <p>${c.bio}</p>
          <p>${c.homeEducation}</p>
        </div>
        <div class="particle-controls">
          ${languageSwitch(l)}
        </div>
      </section>
      <section id="work" class="work">
        <div class="section-heading"><h2>${c.work}<sup>${String(projects.length).padStart(2,'0')}</sup></h2></div>
        ${cards(l)}
        <div class="particle-outro" aria-hidden="true"></div>
      </section>
    </main>`, true);
}
function project(l,p){const c=copy[l],path=`work/${p.slug}/`;return shell(l,path,`${p.name} — ${displayName(l)}`,`<main id="main" class="detail"><a class="back" href="/${l}/#work">← ${c.home}</a><section class="detail-hero"><span class="eyebrow">${p.group==='business'?c.business:c.experimental} / ${get(p,'type',l)}</span><h1>${p.name}</h1><p class="detail-summary">${get(p,'summary',l)}</p>${p.role?`<div class="role-line"><span>${get(p,'role',l)}</span><span>${p.period}</span></div>`:''}${p.url?`<a class="external-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.visit} ↗</a>`:''}</section><section class="detail-section"><h2>${c.details}</h2><div><p>${get(p,'body',l)}</p>${p.contribution?`<h3>${c.contribution}</h3><p>${get(p,'contribution',l)}</p>`:''}<div class="editorial-note"><span class="status-dot"></span><div><strong>${p.wip?c.inProgress:c.coming}</strong><p>${c.comingBody}</p></div></div></div></section><a class="next-project" href="/${l}/work/${projects[(projects.indexOf(p)+1)%projects.length].slug}/"><span>${c.next}</span><strong>${projects[(projects.indexOf(p)+1)%projects.length].name} ↗</strong></a></main>`)}
function about(l){const c=copy[l];return shell(l,'about/',`${c.about} — ${displayName(l)}`,`<main id="main" class="detail"><a class="back" href="/${l}/">← ${c.home}</a><section class="detail-hero about-hero"><span class="eyebrow">${displayName(l)}</span><h1>${c.aboutTitle}</h1><p class="detail-summary">${c.aboutIntro}</p></section><section class="detail-section"><h2>${c.about}</h2><div><p>${c.aboutBio}</p></div></section><section class="detail-section"><h2>${c.experience}</h2><div class="experience-list">${site.experience.map(item=>`<div><h3>${item.name}</h3><span>${item.period}</span><p>${item.role[l]}</p></div>`).join('')}</div></section><section class="detail-section"><h2>${c.education}</h2><div class="experience-list">${site.education.map(item=>`<div><h3>${item.name}</h3><span>${item.period}</span><p>${item.program[l]}</p></div>`).join('')}</div></section><section id="contact" class="detail-section"><h2>${c.contact}</h2><div><a class="email-address" href="mailto:${site.email}">${site.email} ↗</a></div></section></main>`)}
for(const l of ['en','zh']){await mkdir(`${root}/${l}/about`,{recursive:true});await writeFile(`${root}/${l}/index.html`,home(l));await writeFile(`${root}/${l}/about/index.html`,about(l));for(const p of projects){await mkdir(`${root}/${l}/work/${p.slug}`,{recursive:true});await writeFile(`${root}/${l}/work/${p.slug}/index.html`,project(l,p))}}
await writeFile(`${root}/index.html`,home('en'));
await writeFile(`${root}/404.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Bruce Xie</title><link rel="stylesheet" href="/styles.css"><main class="detail"><h1>Page not found.</h1><a href="/en/">Return to the index ↗</a></main></html>`);
console.log('Built bilingual home, about, and five project routes.');
