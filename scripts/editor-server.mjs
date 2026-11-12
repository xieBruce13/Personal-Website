import { readFile, rename, writeFile } from 'node:fs/promises';
import { digest, editsFile, readEdits, renderCopy } from './portfolio-copy.mjs';
import { pages } from '../build.mjs';
import { rebaseRanges, validRanges } from './color-ranges.mjs';

export const editorOrigin = 'http://127.0.0.1:4183';
const revision = edits => digest(JSON.stringify(edits));
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
function canonical(path) {
  const page = path.replace(/index\.html$/, '').replace(/\/?$/, '/');
  return page === '/' ? '/en/' : page.replace(/^\/(en|zh)\/work\/$/, '/$1/');
}

let saving = false;
async function save(req, res) {
  if (req.method !== 'POST' || req.headers.origin !== editorOrigin ||
      req.headers['content-type'] !== 'application/json') fail(403, 'Open the editor on this computer to save.');
  let body = '';
  req.setEncoding('utf8');
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 4000000) fail(413, 'Too much text for one save.');
  }
  let data;
  try { data = JSON.parse(body); } catch { fail(400, 'Invalid edit request.'); }
  if (!pages.has(data?.route) || !Array.isArray(data.changes)) fail(400, 'Invalid page.');
  if (saving) fail(409, 'Another save is in progress. Try again.');
  saving = true;
  try {
    const edits = await readEdits();
    if (revision(edits) !== data.revision) fail(409, 'Another tab saved changes. Copy your draft and refresh before saving.');
    const source = pages.get(data.route);
    const { fields } = renderCopy(source, data.route, edits, true);
    for (const { key, text, size, color: requestedColor, ranges: requestedRanges } of data.changes) {
      const field = fields.get(key);
      if (!field || typeof text !== 'string' || text.length > 20000 ||
          !(size === null || (Number.isFinite(size) && size >= 1 && size <= 512))) fail(400, 'Use plain text and a font size between 1 and 512 px.');
      const group = edits[field.scope] ||= {};
      // A tab opened before the color picker was added can still save its draft.
      const color = requestedColor === undefined ? (group[key]?.color ?? null) : requestedColor;
      if (color !== null && !(typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))) {
        fail(400, 'Choose a six-digit hex color.');
      }
      const previous = group[key];
      const ranges = requestedRanges === undefined
        ? rebaseRanges(previous?.text ?? field.original, text, previous?.ranges ?? [])
        : requestedRanges;
      if (!validRanges(text, ranges)) fail(400, 'The selected letters no longer match this text.');
      if (text === field.original && size === null && color === null && !ranges.length) delete group[key];
      else {
        group[key] = { original: field.original, text, size };
        if (color) group[key].color = color.toLowerCase();
        if (ranges.length) group[key].ranges = ranges.map(({ start, end, color }) => ({ start, end, color: color.toLowerCase() }));
      }
      if (!Object.keys(group).length) delete edits[field.scope];
    }
    const temp = new URL(editsFile.href + '.tmp');
    await writeFile(temp, JSON.stringify(edits, null, 2) + '\n', 'utf8');
    await rename(temp, editsFile);
    res.end(JSON.stringify({ revision: revision(edits) }));
  } finally { saving = false; }
}

export async function editorRequest(req, res, path) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.headers.host !== new URL(editorOrigin).host) { res.writeHead(403); res.end(); return true; }
  if (path === '/__editor/save') {
    res.setHeader('Content-Type', 'application/json');
    try { await save(req, res); } catch (error) {
      res.statusCode = error.status || 500;
      res.end(JSON.stringify({ error: error.status ? error.message : 'Save failed. Your draft is still on this page.' }));
    }
    return true;
  }
  if (['/__editor/tools.js','/__editor/color-ranges.mjs','/__editor/type-scale.mjs'].includes(path)) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    const file = path.endsWith('.mjs') ? './' + path.split('/').pop() : './editor-client.js';
    res.end(await readFile(new URL(file, import.meta.url)));
    return true;
  }
  const route = canonical(path);
  const base = pages.get(route);
  if (!base) return false;
  const edits = await readEdits();
  const { html } = renderCopy(base, route, edits, true);
  const script = '<script type="module" src="/__editor/tools.js" data-page="' + route + '" data-revision="' + revision(edits) + '"></script>';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html.replace('</head>', script + '</head>'));
  return true;
}
