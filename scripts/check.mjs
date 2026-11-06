import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const {site,copy,projects:allProjects}=JSON.parse(await readFile('src/content.json','utf8'));
const projects=site.featuredProjects.map(slug=>allProjects.find(p=>p.slug===slug));
assert(site.email.includes('@'),'Contact email required');
assert.deepEqual(Object.keys(copy.en).sort(),Object.keys(copy.zh).sort(),'Language interface keys must match');
for(const l of ['en','zh'])for(const [key,value] of Object.entries(copy[l]))assert(typeof value==='string'&&value.trim(),`${l}.${key} is empty`);
assert.equal(new Set(projects.map(p=>p.slug)).size,projects.length,'Duplicate slugs');
for(const p of projects){assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug));assert(['business','experimental'].includes(p.group));for(const key of ['type','summary','body'])for(const l of ['en','zh'])assert(p[key]?.[l]?.trim(),`${p.slug}.${key}.${l} missing`);if(p.url)assert.equal(new URL(p.url).protocol,'https:')}
const files=['dist/index.html','dist/404.html'];
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
console.log(`Passed: bilingual copy, ${projects.length} project records, ${files.length} generated pages, internal assets/links, and language-pair navigation.`);

const pison=JSON.parse(await readFile('src/case-studies/pison.json','utf8'));
assert.deepEqual(Object.keys(pison.en).sort(),Object.keys(pison.zh).sort(),'Pison language keys must match');
for(const l of ['en','zh']){
 const html=await readFile(`dist/${l}/work/pison/index.html`,'utf8');
 for(const id of ['pison-overview','pison-background','pison-solution','pison-system','pison-demos'])assert(html.includes(`id="${id}"`),`Pison section missing: ${id}`);
 assert.equal((html.match(/<video /g)||[]).length,3,'All three supplied videos must be present');
 for(const person of ['Bruce','Daniel Tecum-Pauc','Jerry Chen'])assert(html.includes(person),'Team credit missing');
 assert(!html.includes('Project page in preparation.'),'Pison placeholder must be replaced');
 for(const match of html.matchAll(/poster="(\/[^"#]+)"/g))assert((await stat('dist'+match[1])).isFile(),'Video poster missing');
}
console.log('Passed: bilingual Pison sections, three local videos, team credits and posters.');
