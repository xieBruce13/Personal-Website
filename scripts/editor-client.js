import { paintRange, rebaseRanges } from './color-ranges.mjs';
import { typeLevels, levelForSize } from './type-scale.mjs';

(() => {
  const { page, revision: initialRevision } = document.querySelector('script[src="/__editor/tools.js"]').dataset;
  let revision = initialRevision;
  const host = document.createElement('aside');
  host.setAttribute('aria-label', 'Portfolio editor');
  document.body.append(host);
  const panel = host.attachShadow({ mode: 'open' });
  panel.innerHTML = `<style>
    :host{position:fixed;bottom:12px;right:12px;z-index:2147483647;font:14px/1.4 Inter,system-ui,sans-serif;color:var(--text-primary,#252525)}
    *{box-sizing:border-box}section{padding:8px;background:white;border:1px solid #aaa;border-radius:12px;box-shadow:0 3px 18px #0002;max-width:min(390px,calc(100vw - 24px))}
    .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}button,input,textarea{font:inherit;color:inherit}
    button{min-height:40px;padding:0 12px;cursor:pointer;border:1px solid #aaa;background:white;border-radius:7px}button:disabled{opacity:.5;cursor:default}
    #save{background:#252525;color:white;border-color:#252525}label{display:block;margin:5px 0}
    textarea{display:block;width:100%;height:4em;padding:6px;resize:vertical}input{width:5em;padding:4px}p{margin:5px 3px}
    #color{vertical-align:middle;width:40px;height:36px;cursor:pointer}#hex{width:8ch;box-sizing:content-box}
    @media(max-width:500px){:host{bottom:6px;right:6px}section{max-width:calc(100vw - 12px)}}
    [hidden]{display:none!important}
  </style><section>
    <div id="fields" hidden><label>Selected text<textarea id="copy"></textarea></label>
      <label>Text size <select id="size"><option value="">Page default</option>${typeLevels.map(level => '<option value="' + level.size + '">' + level.label + '</option>').join('')}</select></label>
      <div class="row"><p id="scope" aria-live="polite"></p><button id="whole" hidden>Whole passage</button></div>
      <div class="row"><label>Text color <input id="color" type="color"></label>
        <input id="hex" aria-label="Hex color" maxlength="7" pattern="#?[0-9a-fA-F]{6}" required spellcheck="false">
        <button id="reset-color" type="button">Reset color</button>
      </div>
    </div>
    <div class="row"><button id="mode">Edit text</button><button id="save" hidden>Save changes</button><button id="undo" hidden>Discard edits</button></div>
    <p id="status" role="status" hidden></p></section>`;
  const ui = id => panel.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `
    html.copy-editing [data-copy-key]{cursor:text;pointer-events:auto;user-select:text}
    html.copy-editing [data-copy-key]:hover,html.copy-editing [data-copy-key]:focus-visible{outline:1px dashed #555;outline-offset:2px}
    html.copy-editing [data-copy-selected]{outline:2px solid #345d99!important;outline-offset:2px}
    html.copy-editing [data-copy-key]:empty::before{content:"＋";color:#666}
    html.copy-editing body{padding-bottom:320px}
  `;
  document.head.append(css);
  const elements = [...document.querySelectorAll('[data-copy-key]')];
  const baseline = new Map(elements.map(el => [el, {
    text: el.textContent.trim(), size: el.dataset.copySize ? Number(el.dataset.copySize) : null,
    color: el.dataset.copyColor || null, ranges: JSON.parse(el.dataset.copyRanges || '[]')
  }]));
  const initialStyle = new Map(elements.map(el => [el, el.getAttribute('style')]));
  const tabOrder = new Map(elements.map(el => [el, el.getAttribute('tabindex')]));
  const pending = new Map();
  let active = false, selected = null, saving = false;
  let target = null, beforeTyping = null;
  const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const stateOf = el => pending.get(el) || baseline.get(el);
  function status(message) { ui('status').textContent = message; ui('status').hidden = !message; }
  function buttons() {
    ui('mode').disabled = saving;
    ui('save').hidden = ui('undo').hidden = !active && !pending.size;
    ui('save').disabled = ui('undo').disabled = saving || !pending.size;
  }
  function clearSelection() {
    if (selected) {
      selected.removeAttribute('contenteditable');
      selected.removeAttribute('data-copy-selected');
    }
    selected = null;
    target = beforeTyping = null;
    ui('fields').hidden = true;
  }
  function paintProperty() { return selected instanceof SVGElement ? 'fill' : 'color'; }
  function renderText(el, raw, ranges) {
    const content = document.createDocumentFragment();
    const leading = raw.length - raw.trimStart().length;
    let offset = 0;
    const svg = el instanceof SVGElement;
    for (const { start, end, color } of ranges) {
      content.append(raw.slice(offset, leading + start));
      const span = svg ? document.createElementNS(el.namespaceURI, 'tspan') : document.createElement('span');
      if (!svg) span.style.all = 'unset';
      span.style.setProperty(svg ? 'fill' : 'color', color, 'important');
      span.textContent = raw.slice(leading + start, leading + end);
      content.append(span);
      offset = leading + end;
    }
    content.append(raw.slice(offset));
    el.replaceChildren(content);
  }
  function pageOffsets() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!selected.contains(range.commonAncestorContainer)) return null;
    const prefix = range.cloneRange();
    prefix.selectNodeContents(selected);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length;
    return { start, end: start + range.toString().length };
  }
  function textOffsets(raw, offsets) {
    if (!offsets) return null;
    const leading = raw.length - raw.trimStart().length;
    const clamp = i => Math.min(raw.trim().length, Math.max(0, i - leading));
    return { start: clamp(offsets.start), end: clamp(offsets.end) };
  }
  function boxOffsets() {
    const box = ui('copy');
    return textOffsets(box.value, { start: box.selectionStart, end: box.selectionEnd });
  }
  function updateScope() {
    const state = stateOf(selected);
    const first = target && state.ranges.find(run => run.start <= target.start && target.start < run.end);
    showColor(first?.color || state.color);
    ui('reset-color').disabled = target
      ? !state.ranges.some(run => run.start < target.end && run.end > target.start)
      : !state.color && !state.ranges.length;
    ui('whole').hidden = !target;
    if (!target) { ui('scope').textContent = 'Highlight letters to color just those letters.'; return; }
    const excerpt = state.text.slice(target.start, target.end);
    ui('scope').textContent = 'Coloring “' + (excerpt.length > 24 ? excerpt.slice(0, 24) + '…' : excerpt) + '”';
  }
  function rememberRange(offsets) {
    if (!offsets || !selected) return;
    let next = null;
    if (offsets.end > offsets.start) {
      const segments = graphemes.segment(stateOf(selected).text);
      const first = segments.containing(offsets.start), last = segments.containing(offsets.end - 1);
      if (first && last) next = { start: first.index, end: last.index + last.segment.length };
    }
    if (next?.start === target?.start && next?.end === target?.end) return;
    target = next;
    updateScope();
  }
  function readPageRange() {
    if (selected && document.activeElement !== host) rememberRange(textOffsets(selected.textContent, pageOffsets()));
  }
  document.addEventListener('selectionchange', readPageRange);
  document.addEventListener('pointerup', readPageRange);
  for (const type of ['select', 'selectionchange', 'keyup', 'pointerup', 'click']) {
    ui('copy').addEventListener(type, () => {
      if (selected && panel.activeElement === ui('copy')) rememberRange(boxOffsets());
    });
  }
  ui('whole').onclick = () => {
    target = null;
    window.getSelection().removeAllRanges();
    ui('copy').setSelectionRange(0, 0);
    updateScope();
  };
  function showColor(override) {
    let color = override;
    if (!color) {
      // Convert the computed CSS paint to the sRGB hex value used by the picker.
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      context.fillStyle = getComputedStyle(selected).getPropertyValue(paintProperty());
      context.fillRect(0, 0, 1, 1);
      const rgb = context.getImageData(0, 0, 1, 1).data.slice(0, 3);
      color = '#' + Array.from(rgb, channel => channel.toString(16).padStart(2, '0')).join('');
    }
    ui('color').value = ui('hex').value = color;
    ui('reset-color').disabled = !override;
  }
  function select(el) {
    if (selected === el) return;
    clearSelection();
    selected = el;
    el.setAttribute('data-copy-selected', '');
    const state = pending.get(el) || baseline.get(el);
    ui('fields').hidden = false;
    ui('copy').value = state.text;
    ui('size').value = state.size ?? '';
    updateScope();
    if (el instanceof HTMLElement) { el.contentEditable = 'plaintext-only'; el.focus({preventScroll:true}); }
    else ui('copy').focus();
  }
  ui('mode').onclick = () => {
    clearSelection();
    active = !active;
    document.documentElement.classList.toggle('copy-editing', active);
    document.dispatchEvent(new Event('portfolio-copy-preview'));
    for (const el of elements) {
      if (active) el.tabIndex = 0;
      else if (tabOrder.get(el) === null) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', tabOrder.get(el));
    }
    ui('mode').textContent = active ? 'Browse' : 'Edit text';
    status(active ? 'Select text on the page to edit it.' : pending.size ? 'You have unsaved edits.' : '');
    buttons();
  };
  document.addEventListener('pointerdown', event => {
    if (!active || saving || event.button !== 0) return;
    const el = event.target.closest?.('[data-copy-key]');
    if (el instanceof HTMLElement) select(el);
  }, true);
  document.addEventListener('click', event => {
    if (!active || event.target === host) return;
    if (saving) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    const el = event.target.closest?.('[data-copy-key]');
    if (!el) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    select(el);
  }, true);
  document.addEventListener('keydown', event => {
    if (!active || saving || event.isComposing) return;
    const el = event.target.closest?.('[data-copy-key]');
    if (el && event.key === 'Enter') { event.preventDefault(); event.stopImmediatePropagation(); select(el); ui('copy').focus(); }
    if (event.key === 'Escape') clearSelection();
  }, true);
  function note(change) {
    const before = baseline.get(selected);
    const next = { ...(pending.get(selected) || before), ...change };
    if (next.text === before.text && next.size === before.size && next.color === before.color &&
        JSON.stringify(next.ranges) === JSON.stringify(before.ranges)) pending.delete(selected);
    else pending.set(selected, next);
    buttons();
    status(pending.size ? 'Unsaved edits' : '');
  }
  function changeText(value, inline) {
    const state = stateOf(selected);
    const text = value.trim();
    const ranges = rebaseRanges(state.text, text, state.ranges, beforeTyping);
    beforeTyping = target = null;
    if (inline) ui('copy').value = value;
    if (!inline || state.ranges.length) {
      const caret = inline && pageOffsets();
      renderText(selected, value, ranges);
      if (caret) {
        const walker = document.createTreeWalker(selected, NodeFilter.SHOW_TEXT);
        let remaining = caret.end;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (remaining <= node.length) { window.getSelection().collapse(node, remaining); break; }
          remaining -= node.length;
        }
      }
    }
    note({ text, ranges });
    updateScope();
  }
  ui('copy').addEventListener('beforeinput', event => { beforeTyping = { ...boxOffsets(), type: event.inputType }; });
  document.addEventListener('beforeinput', event => {
    if (event.target === selected) {
      const offsets = textOffsets(selected.textContent, pageOffsets());
      beforeTyping = offsets && { ...offsets, type: event.inputType };
    }
  });
  document.addEventListener('input', event => {
    if (selected && event.target === selected && !event.isComposing) changeText(selected.innerText ?? selected.textContent, true);
  });
  document.addEventListener('compositionend', event => {
    if (event.target === selected) changeText(selected.innerText ?? selected.textContent, true);
  });
  ui('copy').oninput = event => { if (!event.isComposing) changeText(ui('copy').value, false); };
  ui('copy').oncompositionend = () => changeText(ui('copy').value, false);
  ui('size').onchange = () => {
    const size = ui('size').value === '' ? null : Number(ui('size').value);
    if (size === null) selected.style.removeProperty('font-size');
    else selected.style.setProperty('font-size', 'var(' + levelForSize(size).token + ')', 'important');
    note({ size });
  };
  function changeColor(color) {
    if (target) {
      const state = stateOf(selected);
      const ranges = paintRange(state.ranges, target.start, target.end, color);
      renderText(selected, selected.textContent, ranges);
      note({ ranges });
      updateScope();
      return;
    }
    const property = paintProperty();
    if (color) selected.style.setProperty(property, color, 'important');
    else {
      const base = document.createElement('span').style;
      base.cssText = selected.dataset.copyBaseStyle || '';
      selected.style.setProperty(property, base.getPropertyValue(property), base.getPropertyPriority(property));
    }
    if (stateOf(selected).ranges.length) renderText(selected, selected.textContent, []);
    note({ color, ranges: [] });
    updateScope();
  }
  ui('color').oninput = () => changeColor(ui('color').value);
  ui('hex').oninput = () => {
    if (ui('hex').validity.valid) changeColor('#' + ui('hex').value.replace('#', '').toLowerCase());
    else { ui('reset-color').disabled = false; status('Enter a six-digit hex color, such as #999999.'); }
  };
  ui('reset-color').onclick = () => changeColor(null);
  ui('undo').onclick = () => {
    clearSelection();
    for (const el of pending.keys()) {
      const state = baseline.get(el);
      renderText(el, state.text, state.ranges);
      const style = initialStyle.get(el);
      if (style === null) el.removeAttribute('style'); else el.setAttribute('style', style);
    }
    pending.clear(); buttons(); status('Unsaved edits discarded.');
    document.dispatchEvent(new Event('portfolio-copy-preview'));
  };
  ui('save').onclick = async () => {
    if (selected && !ui('hex').reportValidity()) return;
    const batch = new Map(pending);
    clearSelection();
    saving = true; buttons(); status('Saving…');
    try {
      const response = await fetch('/__editor/save', { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ route:page, revision, changes:[...batch].map(([el, state]) => ({ key:el.dataset.copyKey, ...state })) }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      revision = result.revision;
      for (const [el, state] of batch) {
        baseline.set(el, state);
        pending.delete(el);
        initialStyle.set(el, el.getAttribute('style'));
      }
      status(pending.size ? 'Saved. New edits are pending.' : 'Saved to your portfolio.');
    } catch (error) { status(error.message || 'Could not save. Your draft is still here.'); }
    finally { saving = false; buttons(); }
  };
  window.addEventListener('beforeunload', event => {
    if (pending.size) { event.preventDefault(); event.returnValue = ''; }
  });
  buttons();
})();
