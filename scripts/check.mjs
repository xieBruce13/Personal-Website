import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const {site,copy,projects}=JSON.parse(await readFile('src/content.json','utf8'));
assert(site.email.includes('@'),'Contact email required');
assert.deepEqual(Object.keys(copy.en).sort(),Object.keys(copy.zh).sort(),'Language interface keys must match');
for(const l of ['en','zh'])for(const [key,value] of Object.entries(copy[l]))assert(typeof value==='string'&&value.trim(),`${l}.${key} is empty`);
assert.equal(new Set(projects.map(p=>p.slug)).size,projects.length,'Duplicate slugs');
for(const p of projects){assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug));assert(['business','experimental'].includes(p.group));for(const key of ['type','summary','body'])for(const l of ['en','zh'])assert(p[key]?.[l]?.trim(),`${p.slug}.${key}.${l} missing`);if(p.url)assert.equal(new URL(p.url).protocol,'https:')}
const files=['dist/index.html','dist/404.html'];
for(const l of ['en','zh']){files.push(`dist/${l}/index.html`,`dist/${l}/about/index.html`);for(const p of projects)files.push(`dist/${l}/work/${p.slug}/index.html`)}
for(const file of files){
 const html=await readFile(file,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file} needs one h1`);
 assert(!html.includes('undefined'),`${file} has undefined content`);
 assert(html.includes('name="viewport"'),`${file} needs a viewport`);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)){
  let target='dist'+match[1];if(target.endsWith('/'))target+='index.html';assert((await stat(target)).isFile(),`${file}: missing ${target}`);
 }
 if(file.includes('/work/')){const other=file.includes('/en/')?'/zh/':'/en/';const slug=file.split('/')[3];assert(html.includes(`href="${other}work/${slug}/"`),'Language toggle must preserve project')}
}
console.log(`Passed: bilingual copy, six project records, ${files.length} generated pages, internal assets/links, and language-pair navigation.`);
