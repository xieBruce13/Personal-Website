import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';
import { validRanges } from './color-ranges.mjs';
import { levelForSize } from './type-scale.mjs';

export const editsFile = new URL('../src/portfolio-edits.json', import.meta.url);
export const readEdits = async () => JSON.parse(await readFile(editsFile, 'utf8'));
export const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 24);
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// Decorate after saved copy is applied, without changing the editor's stable keys.
function headlineBlur(html) {
  const patches=[];
  function visit(node) {
    const headline=node.attrs?.some(a=>a.name==='id' && a.value==='hero-phrase');
    const inscription=node.parentNode?.attrs?.some(a=>a.name==='class' && a.value==='calling-inscription');
    if(headline || (inscription && node.tagName==='span')) {
      const runs=[];
      let text='';
      function collect(n) {
        if(n.nodeName==='#text'){runs.push({node:n,start:text.length});text+=n.value;}
        else for(const child of n.childNodes||[])collect(child);
      }
      collect(node);
      const pattern=headline ? /(?<=\b(?:ide|cre|innov))ate\b/gi : /(?<=\bwe)bsite\b|(?<=\bbruce)xie\b|(?<=\bport)folio\b/gi;
      const matches=[...text.matchAll(pattern)];
      for(const {node:n,start} of runs) {
        let result='',offset=0;
        for(const match of matches) {
          const from=Math.max(0,match.index-start),to=Math.min(n.value.length,match.index+match[0].length-start);
          if(from>=to)continue;
          result+=escape(n.value.slice(offset,from))+'<span class="headline-ending">'+escape(n.value.slice(from,to))+'</span>';
          offset=to;
        }
        if(offset)patches.push([n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset,result+escape(n.value.slice(offset))]);
      }
      return;
    }
    for(const child of node.childNodes||[])visit(child);
  }
  visit(parse(html,{sourceCodeLocationInfo:true}));
  for(const [start,end,value] of patches.sort((a,b)=>b[0]-a[0]))html=html.slice(0,start)+value+html.slice(end);
  return html;
}

// Patch source ranges so unrelated HTML, embedded diagrams and inline markup survive unchanged.
export function renderCopy(html, route, edits, editing = false) {
  const lang = route.split('/')[1];
  const shared = '/' + lang + '/header';
  const fields = new Map();
  if (!editing && !edits[route] && !edits[shared]) return { html:headlineBlur(html), fields };
  const replacements = [];
  function visit(node, path, scope) {
    const tag = node.tagName;
    if (['script', 'style', 'template', 'title', 'desc', 'textarea'].includes(tag)) return;
    const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
    // These two controls supply their own changing labels during playback/navigation.
    if ((attrs.class || '').split(/\s+/).some(c => ['menu-toggle', 'eye-playback'].includes(c))) return;
    if (tag === 'header' || (tag === 'a' && attrs.class === 'skip')) { scope = shared; path = tag; }
    if (tag === 'main') { scope = route; path = 'main'; }
    const children = node.childNodes || [];
    const counts = new Map();
    for (const child of children) {
      const name = child.nodeName;
      const index = (counts.get(name) || 0) + 1;
      counts.set(name, index);
      const childPath = path + '/' + name + index;
      if (name !== '#text') { visit(child, childPath, scope); continue; }
      const original = child.value.trim();
      if (!scope || !original || !child.sourceCodeLocation) continue;
      const key = digest(childPath + '\n' + original);
      fields.set(key, { scope, original });
      const saved = edits[scope]?.[key];
      if (!saved && !editing) continue;
      const loc = child.sourceCodeLocation;
      const raw = html.slice(loc.startOffset, loc.endOffset);
      let content = saved && saved.text !== original
        ? child.value.match(/^\s*/)[0] + escape(saved.text) + child.value.match(/\s*$/)[0]
        : raw;
      const level = levelForSize(saved?.size);
      const color = saved?.color;
      const svg = node.namespaceURI === 'http://www.w3.org/2000/svg';
      const ranges = saved?.ranges ?? [];
      if (ranges.length) {
        const text = saved.text;
        if (!validRanges(text, ranges)) throw new Error('Invalid letter colors in ' + scope + ' (' + key + ').');
        const tag = svg ? 'tspan' : 'span';
        const paint = svg ? 'fill:' : 'all:unset;color:';
        let offset = 0;
        const parts = [child.value.match(/^\s*/)[0]];
        for (const run of ranges) {
          parts.push(escape(text.slice(offset, run.start)),
            '<' + tag + ' style="' + paint + run.color + ' !important">' + escape(text.slice(run.start, run.end)) + '</' + tag + '>');
          offset = run.end;
        }
        parts.push(escape(text.slice(offset)), child.value.match(/\s*$/)[0]);
        content = parts.join('');
      }
      const declarations = [];
      if (level) declarations.push('font-size:var(' + level.token + ') !important');
      if (color) declarations.push((svg ? 'fill:' : 'color:') + color + ' !important');
      const style = declarations.join(';');
      let mark = editing ? ' data-copy-key="' + key + '" data-copy-size="' + (level?.size ?? '') + '"' : '';
      if (editing && color) mark += ' data-copy-color="' + color + '"';
      if (editing && ranges.length) mark += ' data-copy-ranges="' + escape(JSON.stringify(ranges)) + '"';
      if (editing && children.length === 1 && attrs.style) mark += ' data-copy-base-style="' + escape(attrs.style) + '"';
      if (children.length === 1) {
        const start = node.sourceCodeLocation.startTag;
        const styleLoc = node.sourceCodeLocation.attrs?.style;
        if (style && styleLoc) replacements.push([styleLoc.startOffset, styleLoc.endOffset,
          'style="' + escape(attrs.style + ';' + style) + '"']);
        replacements.push([start.endOffset - 1, start.endOffset - 1,
          mark + (style && !styleLoc ? ' style="' + style + '"' : '')]);
      } else if (editing || style) {
        const wrap = svg ? 'tspan' : 'span';
        content = '<' + wrap + mark + (style ? ' style="' + style + '"' : '') + '>' + content + '</' + wrap + '>';
      }
      replacements.push([loc.startOffset, loc.endOffset, content]);
    }
  }
  visit(parse(html, { sourceCodeLocationInfo: true }), '', null);
  for (const scope of [shared, route]) {
    for (const key of Object.keys(edits[scope] || {})) {
      if (!fields.has(key)) throw new Error('Saved copy no longer matches ' + scope + ' (' + key + '). Review src/portfolio-edits.json.');
    }
  }
  for (const [start, end, value] of replacements.sort((a, b) => b[0] - a[0])) {
    html = html.slice(0, start) + value + html.slice(end);
  }
  return { html:headlineBlur(html), fields };
}
