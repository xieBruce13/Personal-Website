# Bruce — Portfolio design system

Version 1.15 · 7 November 2026 · Governs all new and modified portfolio UI.

This document is the visual source of truth. Read it before adding a page, section, component, animation, or project. Current user instructions override this document. Existing legacy CSS is not a precedent for new exceptions. Shared values live in `src/design-tokens.css`; gallery rules live in `src/project-gallery.css`; cross-page editorial typography is enforced last by `src/typography.css`.

## 1. Direction

**A white editorial portfolio, with product craft in the foreground.**

The site should communicate a product manager who can make clear choices and build with taste. Let the work provide the visual interest. Use few words, a consistent grid, quiet interface elements, and deliberate moments of motion. The hero’s glass B·XYZ is the signature artwork; it is not a material treatment to apply to every component.

### Reference hierarchy

1. **Studio Maria — primary visual reference.** Its home and Work page were visually reviewed. Adapt the continuous white canvas, economical navigation, disciplined sans-serif type, generous breathing room, and image-first project presentation. Keep our own branding, editorial project grid, and restrained rounded corners. Do not copy reference assets or reproduce its layout wholesale.
2. **Harbor Bai — typography, neutrals and editorial economy.** The live homepage and Living Surface case study were remeasured on 7 November: about 20 px navigation, 33 px homepage introduction, 23 px card captions, 81 px case-study title, 34 px subtitle, 38 px section heading, 23 px narrative copy, and 13/22 px metadata label/value pairs. Adapt this hierarchy to Inter, with charcoal #252525, quiet gray captions and a white canvas. Use substantial visual evidence and brief copy between media. Bruce’s project names remain inside the covers, with gray category captions directly below the squares. Do not import the serif introduction, source images or unrelated text.
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
| `--text-primary` | `#252525` | Reference-inspired charcoal for titles, body statements and primary controls |
| `--text-secondary` | `#737373` | Readable gray for small supporting text and metadata |
| `--text-muted` | `#999999` | Larger soft-gray display phrasing, not essential 14 px body text |
| `--text-faint` | `#BFBFBF` | Nonessential subdued decoration only |
| `--edge` | `#E6E6E6` | Decorative card edges and separators |

Use #F3F3F3 on selected gallery covers for rhythm; other covers stay white. No beige wash, blue tint or colored gallery text. Product photography and the existing glass hero can retain authentic color. No red contact band or dark footer. Navigation remains About, Contact and language switching. The homepage gallery is the only project index; legacy Work URLs display the homepage. Essential controls need a visible outline or icon; pale decorative edges alone must not carry their meaning.

### Typography

Keep the bundled Inter variable font. Use the existing Chinese system fallbacks. Ordinary UI weight is 400; emphasis is 500–600. Use sentence case. Avoid new display fonts, all-caps microcopy, and heavy letter spacing.

| Role | Desktop | Narrow screen | Leading / tracking |
| --- | --- | --- | --- |
| Home statement | **34 px** | **31 px** | 1.24 / −0.045em |
| Home introduction | **23 px** | **20 px** | 1.4 / −0.018em |
| Case-study title | **62–82 px** | **50–68 px** | 1.06 / −0.055em |
| Case-study subtitle | **30–35 px** | **29 px** | 1.2 / −0.035em |
| Section headline | **34–42 px** | **34 px** | 1.15 / −0.043em |
| Gallery project title inside image | **18–25 px** | **22 px** | 1.1 / −0.035em |
| Navigation and gallery categories | **20 px** | Gallery category 20 px; overlay menu is intentionally larger | 1.25 / −0.015em |
| Lead / narrative statements | **23 px** | **19 px** | 1.4 / −0.02em |
| Detailed explanatory copy | **16 px** | **16 px** | 1.45–1.6 / near neutral |
| Metadata label, annotation, footnote and compact UI | **14 px** | **14 px** | 1.4–1.6 / neutral |
| Metadata value | **20 px** | **18 px** | 1.3 / neutral |

Use `--type-small: 14px` for **compact editorial annotation**, including Pison/Qwen labels, both research studies' evidence captions, numbered notes and overlines. The visibly larger reference-style header and homepage categories share `--type-navigation: 20px`, while gallery project names are about 23 px. Do not add one-off 10–13 px type to editorial UI, including mobile. Explanatory body copy retains the shared 16 px base, with 23 px reserved for high-level prose; titles and section statements use the scale above. The “Bruce” masthead and menu-open links are intentional controls with their own scale. Text inside miniature phone screens, system-node diagrams and screenshot browser chrome depicts artifacts and is not part of the editorial scale. Essential meaning in those visuals must remain in accessible text outside them. Do not shrink text to fit overloaded layouts; cut copy or reflow first. Chinese text should use natural wrapping.

### Layout and shape

- White must be exactly the same white across adjoining sections. No seam caused by a shadow, gradient, or mismatched off-white wrapper.
- Use a 4 px spacing basis: 8, 12, 16, 24, 32, 40, 64, 96. Gallery inset 26 px and an 18 px inter-column gap are optical exceptions.
- Page edges: existing 40 px navigation gutter. Gallery gutters are 24 px desktop, 20 px at ≤1000 px and 16 px at ≤620 px; there is no maximum width.
- Gallery: four equal columns in one desktop row above 809 px, two from 621–809 px, one at ≤620 px. Column gaps 16 px; no second desktop row. Gray category captions sit below the covers. Align each caption to the left edge of its white project title at every viewport width, including the 1 px cover border in the caption inset.
- Cover aspect ratio **1:1** (square). Corner radius **18 px**. One 1 px neutral edge. No floating frame shadow, full-card tilt, or glossy panel treatment.
- Spacing between major sections: normally 64–100 px. Within a section, establish one primary alignment and keep headings, media and controls on it.

## 3. Component contracts

### Hero B·XYZ

Keep the existing glass artwork, separate glyph positions, centered dot, rotation rates, pointer repulsion, reduced-motion support, and offscreen pausing. The canonical glyph scale is **0.405**, modestly smaller than the prior 0.44. Letter silhouettes have slightly thinner strokes and the layered glass depth is 4.25 px per slice, creating a lighter sculptural presence. Keep the loose staggered arrangement, with B and Z in the middle band, X above, Y below, and the dot beside B, matching the supplied formation. Scale the inner glyph wrapper, not the stage. Do not enlarge the letters at wide breakpoints. Preserve empty space around them and keep them clear of navigation and the headline.

The homepage moves directly from hero to project cards and ends there. Keep biography and focus details on the dedicated About page; do not restore the removed homepage About block.

### Project gallery

- Exactly four featured projects, in order: Pison Health Agent, Qwen, Eye Tracking, Defying Freud (the Lucian Freud LoRA study). Co-Hive and the old Coming soon tiles are not shown or linked from the homepage gallery.
- Place **Pison Agent**, **Qwen Create**, **Eye Tracking**, and **Defying Freud** inside their respective lower-left cover corners in white, over the uniform **85% #181818 shade**. Put their categories **Personal Agent**, **Agent Team**, **Research Tool**, and **Model Training** on a separate, left-aligned line directly beneath each cube in #777 gray. The whole image tile links to the case study, with visible keyboard focus.
- Pison's homepage cover draws only from the **13.00–30.00-second span of the original 35.6-second concept film**, cropped to 600×600 without top or bottom bands. The current **9.75-second loop** contains exactly three shots: the **first phone-holding shot** (start), the **watch-hand opening/closing** (middle), and **Marcus smiling and departing** (end). The second locker-room phone-holding shot and all partially cut-off “heading to game” / “Good luck Marcus” message overlays are removed. The cut removes frames 164–236 from the previous 12.79-second no-bubbles loop, retaining 234 frames at 24 fps. Keep the complete concept film on its detail page and retain the established first-phone-shot poster.
- Qwen's homepage cover shows the shampoo product changing through visual styles and ends **while the product is on the moon, after the light sweep, before the pullback/billboard reveal**. The current **5.54-second loop** retains the balanced 7 November timing (0.21-second opening hold and first 2.5 seconds slowed an additional 20%) and applies four-frame dissolves at eight style-change cuts. These transitions soften visual jumps without altering the duration or the moon ending; do not append the zoom-out. Both Pison and Qwen cover loops run at normal browser playback rate because their final timing is baked into the files, silently only while visible, with the same **85% #181818 overlay** as the other two. Keep the full originals in the existing project media. Eye Tracking uses an eight-second animated heatmap of Bruce's supplied interior reference image; the traveling color patches are an **illustrative attention visualization, not measured participant gaze**. Defying Freud uses the subtle 16-second blink-loop animation of Bruce's supplied portrait reference with the original artwork as its poster; it is **animated reference artwork, not a claimed trained model output**. All motion pauses offscreen and obeys reduced-motion preferences.
- Put arrow feedback in the top-right. Reveal it on hover/focus and keep it visible on touch layouts. The complete real card is a normal link with an accessible project name.
- Keep a card’s container and title still. All four cover artworks share a very slight hover/focus magnification and bounded pointer-driven movement (at most 2 px per axis); the card itself never tilts or shifts. Disable this effect for reduced motion. Do not move surrounding content.

### Case studies and demos

Use the same type, white canvas, neutral icons, and alignment. A case study may have larger media, but should not become a second website with a different UI system.

Recommended sequence: concise premise and demo → company and problem → product decisions → concept film → contextual experience → system → additional demonstration and resources. Pison omits the removed business-model comparison and commercial roadmap; preserve its remaining order unless a new user instruction changes it.

Each section should answer one reader question. Pair a product decision with a useful visual and a short reason. Distinguish implemented behavior, proposed integrations, assumptions, and measured results. Put necessary qualifications next to the relevant claim or in expandable detail; do not repeat tiny disclaimers after every visual.

Videos should autoplay muted only when in view, with native playback controls. Respect reduced motion and explicit user pauses. Show real-life footage uncropped with `object-fit:contain`. Crop decorative device framing deliberately; never hide the part needed to understand a demo. Use a sensible display size for low-resolution footage rather than claiming that upscaling creates detail.

Pison naming: **Pison Health Agent** for the portfolio cover; **Pison Ultimate Agent** for the agent; **Pison Watch** for the wearable. Per the 6 November review, do not show the former ending block with team credits, the project deck, GitHub, or the next-project teaser. Keep factual sources in the relevant product sections.

Qwen uses the same opening title, headline and body hierarchy as Pison. The user-supplied English Ad video creator workspace screenshot sits in a centered, 1280 px maximum-width landscape frame, matching the scale of Harbor Bai's Dive-in LLM presentation. The screenshot is the one external link to Qwen Create; the access-region note is quiet text below. Do not add a second external CTA or next-project teaser.

Eye Tracking and Defying Freud use a **shared experimental case-study system** (`src/case-studies/experiments.mjs`, `src/research-cases.css`): same large Inter title, concise subheadline, maximum 1280 px width, white canvas, visual-first project evidence and no generic next-project footer. Borrow Harbor Bai's media-first pacing and compact metadata without importing its serif font. Each visual claim identifies its evidence type once. Eye Tracking opens with a clickable recording of the prototype’s “Where do your eyes go?” landing screen. Use the actual desktop and phone layouts, with a still poster and accessible playback control. Give context and solution separate full-width rows using the shared Pison/Qwen type scale. Explain the 17 calibration targets and five validation positions with unframed monochrome drawings directly on the white page, connected by dotted arrows. Show sample points, occupied cells and heat on one minimal image-and-caption schematic. Ground the design rationale in linked primary studies of text placement and task-dependent scanning. Close with the planned accuracy baseline, setup comparisons and a conditional reading pilot. Keep the illustrative film on the homepage cover. The prototype has restricted access. Defying Freud opens with a portrait of an older man reading his phone generated by the refined LoRA. Introduce Freud, the curatorial question and SDXL with a left-to-right diagram of the frozen and trainable paths. Present four references in equal 2:3 plates with the complete Queen portrait visible. Mark selected works with circled checks. Branch the shortlist into two labeled contact sheets for the 77/8 split, then three equally sized outputs from a matched refinement test. Keep both portrait comparisons unframed on white. Both pages have complete EN/中文 copy. Project films follow the existing offscreen pause and reduced-motion policy.

The About page uses `src/case-studies/about.json` and `src/about-page.css` for a **résumé-grounded, bilingual editorial timeline**. Lead with Bruce's Harvard GSD Human–AI Interaction and RISD Industrial Design background, then his specific contributions at Qwen Create, TikTok and Co-Hive, then education and practical capabilities. Use the résumé's precise technical approach, measured results and business responsibilities, keeping content concise and legible on mobile. The English and Chinese résumés conflict on Qwen's seed-user and satisfaction figures; do not publish either figure without confirmation. Avoid substituting a generic personal brand statement for the actual work.

After the Qwen screenshot, identify the target users documented in Bruce's résumé: frequent marketing creators with limited specialist production expertise, working across text/image/video and social formats. Then show a restrained Overview with one lead agent coordinating five specialists and reusable Skills/tools, plus a three-point capabilities strip for intent/routing, platform-ready assets, and evaluation across model quality, planning, execution, and end-to-end success. Below it, retain the five-part editorial process strip: Brief, Plan, Delegate, Create, Refine (localized in Chinese). Explicitly call this an illustrated or simplified process, not a verified fixed five-step sequence shipped in the interface. Do not invent individual agent names or unverified impact metrics. The English and Chinese résumés disagree on seed-user and satisfaction figures; omit those metrics until Bruce confirms one set. Keep the Qwen sections under the same 1280 px alignment as the media.

## 4. Editorial economy — a requirement, not a preference

**Show the work. Say only what the visual cannot.** Every new feature and case-study section must obey this principle. Removing copy is a design task: reduce the empty container height, align the remaining elements and reconsider the visual balance afterward.

### What the reference study establishes

- **Studio Maria:** a clear project name, a short premise, compact role information and substantial imagery. Its Vanagon project leads with a brief two-line description, then the work. The home page reveals service detail on demand rather than presenting all explanation at once.
- **Harbor Bai:** Synapse, Dive-in LLM and O2 alternate concise context with demos, process and product imagery. Their complete rendered page text was approximately 219, 387 and 405 words respectively, including navigation and metadata when observed. These are evidence for editorial restraint, not an instruction to copy their exact structure or compress technical diagrams into prose.
- **Our application:** retain Pison’s narrative sequence and working demonstrations. Remove repeated introductions, step descriptions, captions and headings that restate what the visual already communicates. Keep the product choice and its tradeoff in short inline disclosures.

### Copy budgets

| Element | Default limit | Purpose |
| --- | --- | --- |
| Gallery cover | Project name only; category beneath | Recognize the work |
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
6. For local-only iterations, keep a self-contained, downloadable focused preview current with the source; do not publish or prepare a deployment archive until Bruce explicitly asks. For deployments, update the preview and source archive together. New recurring values belong in `src/design-tokens.css`; obsolete component rules are replaced rather than stacked indefinitely.

Change this document when a deliberate system decision changes. Do not let a one-off feature silently redefine the site. Current older case-study CSS may contain legacy values; migrate those during relevant edits rather than treating them as new standards.

## Reference links and review scope

Visually reviewed for the current revision: https://www.studiomaria.xyz/ , https://www.studiomaria.xyz/work/vanagon , https://hangbai.cargo.site/ , https://hangbai.cargo.site/synese-node-image , https://hangbai.cargo.site/dive-in-llm , https://hangbai.cargo.site/o2 . Earlier gallery review: https://hangbai.cargo.site/studies .

Textually revisited: https://dmcg.co/work/archiv , https://www.adhamdannaway.com/portfolio/qantas-map-search , https://www.sanjay.page/artem . Apple guidance from the prior portfolio color study: https://developer.apple.com/design/human-interface-guidelines/color , https://developer.apple.com/design/human-interface-guidelines/materials , https://developer.apple.com/design/human-interface-guidelines/layout .

Earlier user-supplied Apple product URLs and https://www.ricardougarcia.com/work/pmf are retained as historical references, not asserted as newly verified sources. No reference photography, code, icons, or branding was copied.

Mobile hero: no viewport-height minimum. Artwork height clamps from 260 to 370 px; retain the staggered formation with 22%-wide glyph wrappers. Avoid empty vertical space above or below the artwork.
