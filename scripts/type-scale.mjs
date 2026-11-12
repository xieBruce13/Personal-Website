// Saved sizes use desktop pixels, including older drafts with custom values.
// The CSS variables resolve to the current viewport's size in the final page.
export const typeLevels = [
  { label: 'Title', size: 76, token: '--type-title' },
  { label: 'Section heading', size: 36, token: '--type-section' },
  { label: 'Subheading', size: 24, token: '--type-subheading' },
  { label: 'Body', size: 17, token: '--type-body' },
  { label: 'Label', size: 14, token: '--type-small' }
];

export function levelForSize(size) {
  if (size == null) return null;
  return typeLevels.reduce((nearest, level) =>
    Math.abs(size - level.size) < Math.abs(size - nearest.size) ? level : nearest);
}
