// Offsets use UTF-16, like DOM Range and textarea.selectionStart.
export function validRanges(text, ranges) {
  if (!Array.isArray(ranges) || ranges.length > text.length) return false;
  let previousEnd = 0;
  return ranges.every(run => {
    if (!run || !Number.isInteger(run.start) || !Number.isInteger(run.end) ||
        run.start < previousEnd || run.start >= run.end || run.end > text.length ||
        typeof run.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(run.color)) return false;
    previousEnd = run.end;
    return !splitsSurrogate(text, run.start) && !splitsSurrogate(text, run.end);
  });
}

function splitsSurrogate(text, index) {
  const unit = text.charCodeAt(index);
  return unit >= 0xdc00 && unit <= 0xdfff && text.charCodeAt(index - 1) >= 0xd800 && text.charCodeAt(index - 1) <= 0xdbff;
}

function spliceColors(ranges, start, end, length, color) {
  const result = [];
  function append(start, end, color) {
    if (!color || start >= end) return;
    const last = result.at(-1);
    if (last?.end === start && last.color === color) last.end = end;
    else result.push({ start, end, color });
  }
  for (const run of ranges) append(run.start, Math.min(run.end, start), run.color);
  append(start, start + length, color);
  const shift = start + length - end;
  for (const run of ranges) append(Math.max(run.start, end) + shift, run.end + shift, run.color);
  return result;
}

export function paintRange(ranges, start, end, color) {
  return spliceColors(ranges, start, end, end - start, color);
}

export function rebaseRanges(before, after, ranges, selection) {
  if (!ranges.length || before === after) return ranges;
  // Anchor a typed edit at the actual caret, even in a string of repeated letters.
  if (selection && selection.start === selection.end && after.length < before.length) {
    const removed = before.length - after.length;
    if (selection.type?.endsWith('Backward')) selection = { start: Math.max(0, selection.start - removed), end: selection.end };
    else if (selection.type?.endsWith('Forward')) selection = { start: selection.start, end: Math.min(before.length, selection.end + removed) };
  }
  let start = 0;
  let end = before.length;
  const limit = Math.min(before.length, after.length, selection?.start ?? Infinity);
  while (start < limit && before[start] === after[start]) start++;
  if (splitsSurrogate(before, start) || splitsSurrogate(after, start)) start--;
  let newEnd = after.length;
  const stop = Math.max(start, selection?.end ?? 0);
  while (end > stop && newEnd > start && before[end - 1] === after[newEnd - 1]) { end--; newEnd--; }
  if (splitsSurrogate(before, end) || splitsSurrogate(after, newEnd)) { end++; newEnd++; }
  const inheritAt = start === end && start > 0 ? start - 1 : start;
  const color = ranges.find(run => run.start <= inheritAt && inheritAt < run.end)?.color;
  return spliceColors(ranges, start, end, newEnd - start, color);
}
