import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const {site,copy,projects:allProjects}=JSON.parse(await readFile('src/content.json','utf8'));
const projects=site.featuredProjects.map(slug=>allProjects.find(p=>p.slug===slug));
const editorialTypography=await readFile('src/typography.css','utf8');
const builtStyles=await readFile('dist/styles.css','utf8');
assert(builtStyles.includes('--type-small: 14px;'),'Small editorial typography must have one canonical 14 px token');
assert(builtStyles.includes('--type-body: 16px;'),'Core explanatory copy must have one 16 px base');
for(const token of [
 '--text-primary: #252525;', '--text-secondary: #737373;', '--text-muted: #999999;',
 '--type-navigation: 20px;', '--type-gallery-category: 20px;', '--type-lead: 23px;',
 '--type-home-intro: 34px;', '--type-page-title: clamp(62px, 6vw, 82px);',
 '--type-page-subtitle: clamp(30px, 3vw, 35px);'
])assert(builtStyles.includes(token),`Reference-inspired design token missing: ${token}`);
assert(builtStyles.trimEnd().endsWith(editorialTypography.trimEnd()),'Shared editorial typography overrides must load last');
for(const selector of [
 '.header .language', '.work-gallery .gallery-card-category',
 '.pison-case .pison-eyebrow', '.pison-film-media figcaption',
 '.qwen-role', '.qwen-preview figcaption', '.qwen-workflow li > span',
 '.research-meta dt', '.research-eye-hero figcaption', '.research-freud-hero figcaption',
 '.research-evidence figcaption', '.about-overline', '.about-index'
])assert(editorialTypography.includes(selector),`Shared small-type scale missing selector: ${selector}`);
for(const selector of ['.pison-opening h1','.qwen-opening h1','.research-opening h1','.about-opening h1','.hero h1 .hero-line-muted'])
 assert(editorialTypography.includes(selector),`Reference type scale missing selector: ${selector}`);
assert.deepEqual(site.featuredProjects,['pison','qwen-create','eye-tracking-thingz','lucian-freud-lora'],'Homepage must feature four projects in the requested order');
assert(site.email.includes('@'),'Contact email required');
assert.deepEqual(Object.keys(copy.en).sort(),Object.keys(copy.zh).sort(),'Language interface keys must match');
for(const l of ['en','zh'])for(const [key,value] of Object.entries(copy[l]))assert(typeof value==='string'&&value.trim(),`${l}.${key} is empty`);
assert.equal(new Set(projects.map(p=>p.slug)).size,projects.length,'Duplicate slugs');
for(const p of projects){assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug));assert(['business','experimental'].includes(p.group));for(const key of ['type','summary','body'])for(const l of ['en','zh'])assert(p[key]?.[l]?.trim(),`${p.slug}.${key}.${l} missing`);if(p.url)assert.equal(new URL(p.url).protocol,'https:')}
const files=['dist/index.html','dist/404.html'];
for(const name of ['review.html','pison-review.html','qwen-review.html'])assert((await stat(`dist/${name}`)).isFile(),`${name} review route must stay available`);
for(const l of ['en','zh']){files.push(`dist/${l}/index.html`,`dist/${l}/about/index.html`,`dist/${l}/work/index.html`,`dist/${l}/contact/index.html`);for(const p of projects)files.push(`dist/${l}/work/${p.slug}/index.html`)}
for(const file of files){
 const html=await readFile(file,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file} needs one h1`);
 assert(!html.includes('undefined'),`${file} has undefined content`);
 assert(html.includes('name="viewport"'),`${file} needs a viewport`);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)){
  let target='dist'+match[1];if(target.endsWith('/'))target+='index.html';assert((await stat(target)).isFile(),`${file}: missing ${target}`);
 }
 if(file.includes('/work/')&&!file.endsWith('/work/index.html')){const other=file.includes('/en/')?'/zh/':'/en/';const slug=file.split('/')[3];assert(html.includes(`href="${other}work/${slug}/"`),'Language toggle must preserve project')}
}
for(const l of ['en','zh']){
 const html=await readFile(`dist/${l}/index.html`,'utf8');
 assert(html.includes('class="hero-line-muted"')&&html.includes('class="hero-line-emphasis"'),'Homepage statement must use gray/charcoal phrase hierarchy');
 assert(!html.includes('Co-Hive'),'Removed Co-Hive should not appear on the homepage');
 const gallery=html.slice(html.indexOf('<section id="work"'));
 const linkedSlugs=[...gallery.matchAll(/href="\/(?:en|zh)\/work\/([a-z0-9-]+)\/"/g)].map(x=>x[1]);
 assert.deepEqual(linkedSlugs,site.featuredProjects,'Each of the four cover cards must link to its own case study');
 assert.equal((gallery.match(/class="project-card" data-gallery-tile/g)||[]).length,4,'Homepage must contain exactly four project cards');
 assert.equal((gallery.match(/class="gallery-card-category"/g)||[]).length,4,'Each category must appear in gray below its cover');
 for(const title of ['Pison Agent','Qwen Create','Eye Tracking','Defying Freud'])assert(gallery.includes(`<span class="gallery-film-title">${title}</span>`),`Labeled card title must be inside its cover: ${title}`);
 assert.equal((gallery.match(/class="gallery-film-meta"/g)||[]).length,4,'Each card needs a title overlay');
 assert(!gallery.includes('class="gallery-film-category"'),'Categories should not overlap the videos');
 assert.equal((gallery.match(/class="gallery-preview-video"/g)||[]).length,4,'All four homepage cards must have looping video covers');
 assert(gallery.includes('/media/pison/card-three-shots-loop.mp4'),'Pison gallery card must show only the first phone shot, opening/closing hand and person departing');
 assert(!gallery.includes('/media/pison/card-no-bubbles-clean-loop.mp4'),'Pison gallery must not use the longer version containing the second phone shot');
 assert(gallery.includes('muted loop playsinline'),'Pison gallery card must silently loop inline');
 assert(gallery.includes('/media/pison/card-13-30-poster.webp'),'Pison gallery card needs its new 13–30 second clip poster');
 assert(gallery.includes('/media/qwen/card-shampoo-moon-soft-loop.mp4'),'Qwen gallery card must have smooth style dissolves and finish on the moon before the billboard zoom-out');
 assert(gallery.includes('/media/qwen/card-shampoo-styles-slow-poster.webp'),'Qwen gallery card needs its matching slow clip poster');
 assert.equal((gallery.match(/data-playback-rate="1"/g)||[]).length,4,'Pre-rendered clips must play at intended timing without a second slowdown');
 assert(gallery.includes('/media/eye-tracking/attention-heatmap-loop.mp4'),'Eye Tracking must use the eight-second moving heatmap');
 assert(gallery.includes('poster="/media/eye-tracking/attention-heatmap-poster.webp"'),'Eye Tracking needs a still poster for reduced motion');
 assert(gallery.includes('/media/lora/blink-loop.mp4'),'Lucian Freud LoRA must use the blinking portrait video');
 assert(gallery.includes('poster="/media/lora/reference-portrait.jpg"'),'Lucian Freud LoRA must retain the supplied portrait as a video poster');
 assert(!gallery.includes('project-placeholder'),'Remove the two coming-soon tiles');
 for(const p of projects){assert(gallery.includes(p.galleryTitle[l]),`${p.slug} display title missing`);assert(gallery.includes(p.galleryCategory[l]),`${p.slug} gallery category missing`)}
 const css=await readFile('dist/styles.css','utf8');assert(css.includes('--gallery-aspect: 1;'),'The four gallery covers must be square');
 assert(css.includes('background:rgba(24,24,24,.85)'),'All four covers must use 85% #181818 shading');
 assert(css.includes('.work-gallery .gallery-card-category'),'Gallery needs gray category typography under cards');
 const about=await readFile(`dist/${l}/about/index.html`,'utf8');
 assert(about.includes('class="detail about-page"'),'About must use the résumé-based editorial layout');
 assert.equal((about.match(/class="about-position"/g)||[]).length,3,'Three detailed experience positions must appear');
 assert.equal((about.match(/class="about-section-content about-education"/g)||[]).length,1,'Two institutions must appear in the education list');
 assert.equal((about.match(/class="about-section-content about-capabilities"/g)||[]).length,1,'Résumé skills must be present');
 for(const fact of ['Qwen','TikTok','Co-Hive','0.93/0.91','78%'])assert(about.includes(fact),`${l} About must include résumé fact: ${fact}`);
 assert(!about.includes('8,000')&&!about.includes('8000')&&!about.includes('71%')&&!about.includes('92%'),'Conflicting Qwen metrics must not appear');
}
for(const name of ['card-middle-loop.mp4','card-middle-poster.webp'])assert((await stat(`dist/media/pison/${name}`)).isFile(),`Pison card media ${name} missing`);
for(const name of ['card-background.mp4','card-background-poster.webp'])assert((await stat(`dist/media/qwen/${name}`)).isFile(),`Qwen card media ${name} missing`);
for(const name of ['card-13-30-loop.mp4','card-13-30-poster.webp'])assert((await stat(`dist/media/pison/${name}`)).isFile(),`New Pison 13–30 media ${name} missing`);
for(const name of ['card-shampoo-moon-slow12-loop.mp4','card-shampoo-styles-slow-poster.webp'])assert((await stat(`dist/media/qwen/${name}`)).isFile(),`New Qwen moon-ending media ${name} missing`);
assert((await stat('dist/media/pison/card-no-bubbles-loop.mp4')).isFile(),'Pison clean cover loop missing');
assert((await stat('dist/media/qwen/card-shampoo-moon-balanced-loop.mp4')).isFile(),'Qwen balanced-pace cover loop missing');
assert((await stat('dist/media/pison/card-no-bubbles-clean-loop.mp4')).isFile(),'Pison fully trimmed cover loop missing');
assert((await stat('dist/media/pison/card-three-shots-loop.mp4')).isFile(),'Pison three-shot cover loop missing');
assert((await stat('dist/media/qwen/card-shampoo-moon-soft-loop.mp4')).isFile(),'Qwen smoothed cover loop missing');
assert((await stat('dist/media/lora/reference-portrait.jpg')).isFile(),'Supplied LoRA portrait cover must be copied into the site');
assert((await stat('dist/media/lora/blink-loop.mp4')).isFile(),'Freud blink video must be copied into the site');
assert((await stat('dist/media/eye-tracking/attention-study.png')).isFile(),'Eye Tracking cover must be copied into the site');
for(const name of ['attention-heatmap-loop.mp4','attention-heatmap-poster.webp'])assert((await stat(`dist/media/eye-tracking/${name}`)).isFile(),`Eye Tracking video asset ${name} missing`);
for(const l of ['en','zh']){
 const html=await readFile(`dist/${l}/work/lucian-freud-lora/index.html`,'utf8');
 assert(html.includes('Defying Freud'),'New Freud project page title required');
 assert(html.includes('research-freud-hero'),'Freud study must have a substantive media-first presentation');
 for(const id of ['173','002','003','004'])assert(html.includes('/media/lora/ref-LF-'+id+'.webp'),'Missing one of the four Freud reference plates');
 for(const id of ['base','pilot','oil39'])assert(html.includes('/media/lora/portrait-classical-'+id+'.webp'),'Missing matched classical portrait');
 assert(html.includes('class="folio-flow"') && html.includes('class="folio-branches"'),'Freud study must explain the training and refinement process');
 assert(html.includes('research-material-grid'),'Freud study must examine the visual qualities');
 assert(!html.includes('class="next-project"'),'Freud presentation should end cleanly');
 const eye=await readFile(`dist/${l}/work/eye-tracking-thingz/index.html`,'utf8');
 assert(eye.indexOf('id="eye-context-title"') >= 0 && eye.indexOf('id="eye-solution-title"') > eye.indexOf('id="eye-context-title"'),'Eye Tracking should introduce the research problem before the solution');
 const opening=eye.slice(eye.indexOf('class="eye-landing"'),eye.indexOf('class="eye-brief"'));
 assert(opening.includes('<a href="https://eye-tracking-canva-bruce.brucexie13.chatgpt.site"'),'Opening visual must link to the working prototype');
 for(const size of ['wide','phone']){
  for(const ext of ['mp4','webp'])assert(opening.includes('/media/eye-tracking/landing-'+size+'.'+ext),'Missing landing film or poster');
 }
 for(const stage of ['positions','dwell','heatmap'])assert(eye.includes('/media/eye-tracking/layout-'+stage+'.svg'),'Missing illustrated heatmap stage: '+stage);
 assert(!/class="(?:research-meta|eye-screens)"|HealParallel|study-upload|study-cast|Start a session|Open a portfolio/.test(eye),'Omit the retired examples, setup panels and metadata');
 assert(eye.includes('class="eye-model"') && eye.includes('class="eye-detail-flow"'),'Explain calibration and heatmap generation visually');
 assert(eye.includes(l==='en'?'Why this is useful':'这对设计研究有什么用') && eye.includes('https://pubmed.ncbi.nlm.nih.gov/22309059/') && eye.includes('https://www.nngroup.com/articles/eyetracking-tasks-efficient-scanning/'),'Ground the design rationale in the linked studies');
 assert(eye.includes('id="eye-next-title"') && eye.includes(l==='en'?'Measure the error':'测量追踪误差'),'Describe the upcoming accuracy and design-review tests');
 assert(!eye.includes('camera-setup.webp'),'Omit the retired seated-person illustration');
 assert(!eye.includes('class="next-project"'),'Eye Tracking presentation should end cleanly');
}
console.log(`Passed: bilingual copy, ${projects.length} project records, ${files.length} generated pages, internal assets/links, and language-pair navigation.`);

const pison=JSON.parse(await readFile('src/case-studies/pison.json','utf8'));
assert.deepEqual(Object.keys(pison.en).sort(),Object.keys(pison.zh).sort(),'Pison language keys must match');
for(const l of ['en','zh']){
 const html=await readFile(`dist/${l}/work/pison/index.html`,'utf8');
 for(const id of ['pison-overview','pison-background','pison-solution','pison-system','pison-demos'])assert(html.includes(`id="${id}"`),`Pison section missing: ${id}`);
 assert.equal((html.match(/<video /g)||[]).length,3,'All three supplied videos must be present');
 assert(!html.includes('pison-credits'),'Pison credits section should be removed');
 assert(!html.includes('class="next-project"'),'Pison next-project footer should be removed');
 assert(!html.includes('project-deck.pdf'),'Pison deck link should be removed');
 assert(!html.includes('Biometrics-AI-Agent'),'Pison GitHub link should be removed');
 assert(!html.includes('Project page in preparation.'),'Pison placeholder must be replaced');
 for(const match of html.matchAll(/poster="(\/[^"#]+)"/g))assert((await stat('dist'+match[1])).isFile(),'Video poster missing');
}
console.log('Passed: bilingual Pison sections, three local videos, clean ending and posters.');
const qwen=JSON.parse(await readFile('src/case-studies/qwen.json','utf8'));
assert.deepEqual(Object.keys(qwen.en).sort(),Object.keys(qwen.zh).sort(),'Qwen language keys must match');
for(const l of ['en','zh']){
 const html=await readFile(`dist/${l}/work/qwen-create/index.html`,'utf8');
 assert(html.includes('class="qwen-opening"'),'Qwen should share the Pison-style editorial opening');
 assert(html.includes(`<h2>${qwen[l].headline}</h2>`),'Qwen headline missing');
 assert(html.includes('/media/qwen/ad-video-creator-english.png'),'Qwen must use the supplied English Ad video creator screenshot');
 assert(!html.includes('/media/qwen/experts-english.png'),'The Experts grid screenshot must not appear');
 assert.equal((html.match(/href="https:\/\/create\.qwen\.com\/r\/ai-studio-pc-global\/main\/agent-team\/"/g)||[]).length,1,'Qwen should have only one product link');
 assert(!html.includes('class="next-project"'),'Qwen next-project footer should be removed');
 assert(html.includes('id="qwen-overview"'),'Qwen overview must appear after the screenshot');
 assert(html.includes('id="qwen-audience"'),'Qwen target audience must appear after the screenshot');
 for(const point of qwen[l].targetPoints)assert(html.includes(point),`Qwen target user trait missing: ${point}`);
 assert(html.includes(`>${qwen[l].overviewTitle}</h2>`),'Localized Qwen overview heading missing');
 assert(html.includes(qwen[l].specialistCount),'Five-agent architecture caption missing');
 assert.equal((html.match(/class="qwen-specialist"/g)||[]).length,5,'Qwen architecture should show five specialists');
 assert.equal((html.match(/class="qwen-feature-grid"/g)||[]).length,1,'Qwen agent capabilities should appear once');
 for(const feature of qwen[l].features)assert(html.includes(feature.title)&&html.includes(feature.body),`Qwen capability missing: ${feature.title}`);
 assert.equal((html.match(/<li><span>0[1-5]<\/span><strong>/g)||[]).length,5,'Five-step Qwen process strip missing');
 assert(html.includes(qwen[l].flowNote),'Five-stage flow must have its simplified-process qualifier');
}
console.log('Passed: bilingual Qwen hero, single external link, five-agent overview, five-step illustration, and clean ending.');
