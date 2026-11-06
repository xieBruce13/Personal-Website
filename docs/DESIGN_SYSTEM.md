# Bruce — Portfolio design system

Version 1.3 · 6 November 2026 · Governs all new and modified portfolio UI.

This document is the visual source of truth. Read it before adding a page, section, component, animation, or project. Current user instructions override this document. Existing legacy CSS is not a precedent for new exceptions. Shared values live in `src/design-tokens.css`; gallery rules live in `src/project-gallery.css`.

## 1. Direction

**A white editorial portfolio, with product craft in the foreground.**

The site should communicate a product manager who can make clear choices and build with taste. Let the work provide the visual interest. Use few words, a consistent grid, quiet interface elements, and deliberate moments of motion. The hero’s glass B·XYZ is the signature artwork; it is not a material treatment to apply to every component.

### Reference hierarchy

1. **Studio Maria — primary visual reference.** Its home and Work page were visually reviewed. Adapt the continuous white canvas, economical navigation, disciplined sans-serif type, generous breathing room, and image-first project presentation. Keep our own branding, six-tile structure, and restrained rounded corners. Do not copy reference assets or reproduce its layout wholesale.
2. **Harbor Bai — gallery proportion and editorial economy.** Use wide landscape studies, substantial visual evidence, and brief copy between media. Synapse, Dive-in LLM and O2 were reviewed from introduction to conclusion. Their compact premise, role information, process imagery and short explanations establish the content model. Preserve Bruce’s explicit preference for no caption rows underneath covers; do not import the serif introduction or long uppercase captions.
3. **Apple — product presentation, not the portfolio identity.** Use clear hierarchy, readable device demonstrations, controlled cropping, and visible product behavior within case studies. Do not introduce blue surfaces, excessive glass, or giant type merely to signal Apple influence.
4. **DMCG / Archiv — restrained physicality.** Give actual product objects presence; let fine details carry character. Depth belongs to the depicted object, not to floating page containers.
5. **Qantas / Adham Dannaway and Artem / Sanjay — evidence and narrative.** Explain the problem, choices, working experience, and implementation. Avoid copying their denser prose or unrelated visual branding. Ricardo Garcia’s PMF page remains an earlier reference; it could not be retrieved in this review and is not the basis for a new rule.

These are ranked influences, not separate themes to alternate between sections.

## 2. Foundations

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#FFFFFF` | Page, header, gallery and white-to-white transitions |
| `--surface` | `#F7F7F7` | A necessary inset surface; never every section |
| `--text-primary` | `#171717` | Titles, meaningful labels, primary controls |
| `--text-secondary` | `#666666` | Supporting copy and pending labels |
| `--edge` | `#E8E8E8` | Decorative card edges and separators |

Use #F3F3F3 on Pison, Co-Hive and the first pending tile; other covers stay white. No beige wash, blue tint or colored gallery text. Product photography and the existing glass hero can retain authentic color. No red contact band or dark footer. Navigation remains About, Contact and language switching. The homepage gallery is the only project index; legacy Work URLs display the homepage. Essential controls need a visible outline or icon; pale decorative edges alone must not carry their meaning.

### Typography

Keep the bundled Inter variable font. Use the existing Chinese system fallbacks. Ordinary UI weight is 400; emphasis is 500–600. Use sentence case. Avoid new display fonts, all-caps microcopy, and heavy letter spacing.

| Role | Desktop | Narrow screen | Leading / tracking |
| --- | --- | --- | --- |
| Home headline | 44–60 px | 38–52 px; 40 px at ≤620 | 1.08 / −0.06em |
| Home introduction | 21–26 px | 20–21 px | 1.3 / −0.035em |
| Gallery project title | 20–26 px | 22 px | 1.1 / −0.045em |
| Body copy for new sections | 16–18 px | 16 px | 1.45–1.6 / near neutral |
| Navigation / compact labels | 14–15 px | 14–15 px where space allows | 1.4–1.6 |
| Small metadata | 12–13 px | 12–13 px | 1.4 minimum |

12 px is reserved for nonessential metadata, never core explanatory copy. Miniature phone-screen text is decorative cover art; essential meaning must exist in the accessible link name and the full case study. Do not shrink text to fit an overloaded layout. Cut copy or reflow first. Chinese text should use looser tracking and natural wrapping.

### Layout and shape

- White must be exactly the same white across adjoining sections. No seam caused by a shadow, gradient, or mismatched off-white wrapper.
- Use a 4 px spacing basis: 8, 12, 16, 24, 32, 40, 64, 96. Gallery inset 26 px and an 18 px inter-column gap are optical exceptions.
- Page edges: existing 40 px navigation gutter. Gallery gutters are 24 px desktop, 20 px at ≤1000 px and 16 px at ≤620 px; there is no maximum width.
- Gallery: three equal columns above 809 px, two from 621–809 px, one at ≤620 px. Column gaps 18 px desktop and 16 px narrow; row gaps 36–42 px desktop, 24 px tablet, 22 px phone.
- Cover aspect ratio **1.9:1**. Corner radius **18 px**. One 1 px neutral edge. No floating frame shadow, full-card tilt, or glossy panel treatment.
- Spacing between major sections: normally 64–100 px. Within a section, establish one primary alignment and keep headings, media and controls on it.

## 3. Component contracts

### Hero B·XYZ

Keep the existing glass artwork, separate glyph positions, centered dot, rotation rates, pointer repulsion, reduced-motion support, and offscreen pausing. The canonical glyph scale is **0.44**, 12% smaller than the previous 0.50. Keep the loose staggered arrangement, with B and Z in the middle band, X above, Y below, and the dot beside B, matching the supplied formation. Scale the inner glyph wrapper, not the stage. Do not enlarge the letters at wide breakpoints. Preserve empty space around them and keep them clear of navigation and the headline.

The homepage moves directly from hero to project cards and ends there. Keep biography and focus details on the dedicated About page; do not restore the removed homepage About block.

### Six-tile project gallery

- Exactly four real projects, in order: Pison Health Agent, Qwen Create, Co-Hive, Eye Tracking Thingz. Qwen is restored by the current user instruction.
- Two further tiles are honestly labeled **Coming soon**. No invented project names, fake links, or hover effects suggesting that these tiles open.
- All real titles share the same size, weight, top inset, and left inset. Pison is not a larger typographic logo in this grid.
- Keep project names inside the cover. No duplicate title, description, role, date, or caption row underneath.
- Use actual Pison Watch art without changing its hardware or branding. The decorative phone is an illustrative native UI composition, not a claimed screenshot.
- Qwen uses a neutral creative-canvas study. Eye Tracking uses a monochrome optical study. Co-Hive uses a neutral locker study. These are thematic illustrations, not fabricated product evidence. Replace them with supplied project media when available.
- Put arrow feedback in the top-right. Reveal it on hover/focus and keep it visible on touch layouts. The complete real card is a normal link with an accessible project name.
- Keep a card’s container and title still. Optional inner artwork movement is capped at 4 px per axis; a small object gesture may clarify the theme. Do not move surrounding content.

### Case studies and demos

Use the same type, white canvas, neutral icons, and alignment. A case study may have larger media, but should not become a second website with a different UI system.

Recommended sequence: concise premise and demo → company and problem → product decisions → concept film → contextual experience → system → additional demonstration and resources. Pison omits the removed business-model comparison and commercial roadmap; preserve its remaining order unless a new user instruction changes it.

Each section should answer one reader question. Pair a product decision with a useful visual and a short reason. Distinguish implemented behavior, proposed integrations, assumptions, and measured results. Put necessary qualifications next to the relevant claim or in expandable detail; do not repeat tiny disclaimers after every visual.

Videos should autoplay muted only when in view, with native playback controls. Respect reduced motion and explicit user pauses. Show real-life footage uncropped with `object-fit:contain`. Crop decorative device framing deliberately; never hide the part needed to understand a demo. Use a sensible display size for low-resolution footage rather than claiming that upscaling creates detail.

Pison naming: **Pison Health Agent** for the portfolio cover; **Pison Ultimate Agent** for the agent; **Pison Watch** for the wearable. Preserve team attribution and factual source links.

## 4. Editorial economy — a requirement, not a preference

**Show the work. Say only what the visual cannot.** Every new feature and case-study section must obey this principle. Removing copy is a design task: reduce the empty container height, align the remaining elements and reconsider the visual balance afterward.

### What the reference study establishes

- **Studio Maria:** a clear project name, a short premise, compact role information and substantial imagery. Its Vanagon project leads with a brief two-line description, then the work. The home page reveals service detail on demand rather than presenting all explanation at once.
- **Harbor Bai:** Synapse, Dive-in LLM and O2 alternate concise context with demos, process and product imagery. Their complete rendered page text was approximately 219, 387 and 405 words respectively, including navigation and metadata when observed. These are evidence for editorial restraint, not an instruction to copy their exact structure or compress technical diagrams into prose.
- **Our application:** retain Pison’s narrative sequence and working demonstrations. Remove repeated introductions, step descriptions, captions and headings that restate what the visual already communicates. Keep the product choice and its tradeoff in short inline disclosures.

### Copy budgets

| Element | Default limit | Purpose |
| --- | --- | --- |
| Gallery cover | Project name only | Recognize the work |
| Section headline | 3–8 words | State one point |
| Project premise | 15–30 words | Product + audience or value |
| Main section body | One sentence; usually 12–30 words, maximum 35 | Add information absent from the visual |
| Compact card explanation | 8–18 words | Explain one decision |
| Expanded decision | 40–60 words maximum | Choice + reason or tradeoff |
| Whole case-study narrative | Aim for 250–400 words | Excludes navigation, UI labels, demo conversations, diagrams, credits and sources |

Budgets are ceilings, not targets. Do not add filler to meet them. A visual interaction may require more labels than a photography-led project, but each label must earn its place. Chinese copy must preserve the same information density and natural phrasing; do not enforce English word counts on Chinese text.

### Editing rules

1. Use one headline and, only when needed, one supporting sentence. Avoid a stack of eyebrow, headline, subheading, paragraph and caption making the same point.
2. Explain a PM decision with a concrete choice, constraint or tradeoff. Remove generic claims about innovation or user-centric thinking.
3. Let product behavior, diagrams and process media supply evidence. Put secondary depth in existing inline disclosures or linked sources.
4. Remove repeated copy; do not make it pale or tiny. Essential text remains readable.
5. Preserve meaningful status: prototype vs. shipped, proposed vs. connected, hypothesis vs. measured result. Place the qualifier once beside the relevant claim.
6. A comparison earns space only if it changes the product decision. Prefer a few meaningful rows to comprehensive feature or price lists.
7. Before handing off, read the page without opening disclosures. The product, main decisions and evidence must still be understandable.

Example: replace a paragraph explaining membership pilots with **“Pilot with existing Watch members.”** Keep the rationale in the adjacent model comparison. Replace repeated technical descriptions with **“Analyze once. Reuse.”** and the actual pipeline visual.

## 5. Interaction, accessibility and performance

- Native scroll; no scroll hijacking. A scroll story must also offer buttons or a readable static arrangement.
- Feedback: 220 ms. Object motion: roughly 550 ms. Easing: `cubic-bezier(.2,.7,.2,1)`. Hero rotation retains its existing slower timing.
- Animate transform and opacity. Run pointer work with requestAnimationFrame, only for fine pointers. Reset on exit, pointer cancellation, visibility changes, and preference changes.
- `prefers-reduced-motion` disables decorative drift, rotations and autoplay. All text and navigation remain available.
- Hover is enhancement, never the only way to discover a project or understand content. Visible keyboard focus must remain. Use real links/buttons; pending tiles are not interactive.
- Aim for WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text and essential UI graphics. Decorative hairlines are exempt but cannot replace a meaningful control boundary.
- Maintain at least 44 px targets for standalone actions. A smaller arrow is acceptable only as decoration within a fully clickable project card.
- Use one shared stroke icon family. Do not mix filled clip art, emoji, and line icons. Never add an icon when a short label is clearer.
- Load project images lazily; set intrinsic dimensions. Pause invisible animation. Do not add a framework or animation dependency for a CSS-level effect.

## 6. Future-feature acceptance gate

Before implementation, state the reader task, the reusable component, and the evidence/media available. Check the token file and this guide before inventing a style.

A feature is ready only when:

1. It uses the existing palette, type roles, spacing, icon family and corner rules, or records a justified system-level exception here.
2. It passes the editorial budgets above: one point per section, no duplicated explanations, and no shrinking text to conceal excess. Claims match the project evidence; no fictional metrics or features.
3. Desktop, 390 px mobile, Chinese, keyboard navigation and reduced-motion behavior have been reviewed. No clipping or horizontal page overflow.
4. Links, disclosure controls, media and route-preserving language switching work.
5. `npm run check`, `npm run preview`, and `npm test` pass. Browser limitations are recorded honestly rather than represented as a pass.
6. The preview and source archive are updated together. New recurring values belong in `src/design-tokens.css`; obsolete component rules are replaced rather than stacked indefinitely.

Change this document when a deliberate system decision changes. Do not let a one-off feature silently redefine the site. Current older case-study CSS may contain legacy values; migrate those during relevant edits rather than treating them as new standards.

## Reference links and review scope

Visually reviewed for the current revision: https://www.studiomaria.xyz/ , https://www.studiomaria.xyz/work/vanagon , https://hangbai.cargo.site/ , https://hangbai.cargo.site/synese-node-image , https://hangbai.cargo.site/dive-in-llm , https://hangbai.cargo.site/o2 . Earlier gallery review: https://hangbai.cargo.site/studies .

Textually revisited: https://dmcg.co/work/archiv , https://www.adhamdannaway.com/portfolio/qantas-map-search , https://www.sanjay.page/artem . Apple guidance from the prior portfolio color study: https://developer.apple.com/design/human-interface-guidelines/color , https://developer.apple.com/design/human-interface-guidelines/materials , https://developer.apple.com/design/human-interface-guidelines/layout .

Earlier user-supplied Apple product URLs and https://www.ricardougarcia.com/work/pmf are retained as historical references, not asserted as newly verified sources. No reference photography, code, icons, or branding was copied.

Mobile hero: no viewport-height minimum. Artwork height clamps from 260 to 370 px; retain the staggered formation with 22%-wide glyph wrappers. Avoid empty vertical space above or below the artwork.
