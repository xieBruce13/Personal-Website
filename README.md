# Bruce Xie · Personal Website

A bilingual portfolio for Bruce Xie — AI Product Manager & Builder.

The first version includes an English/Chinese landing page, an evenly distributed, color-shifting particle background, a project index, an About page, and honest project-overview pages ready for further case-study development.

## Start here: edit the text

**All editable portfolio copy lives in [`src/content.json`](src/content.json).**

- `site`: name, contact email, experience, and education.
- `copy.en` / `copy.zh`: navigation, homepage, labels, footer, and interface text.
- `projects`: names, category, summaries, roles, project links, and overview copy.
- Every translated project field has explicit `en` and `zh` keys.
- Keep a project's `slug` unchanged after sharing its URL. It controls both language routes.
- `wip: true` marks the project itself as in progress. An unfinished case study does **not** mean the underlying project is unfinished.
- The `aboutTitle` interface field intentionally contains `<br>` for line breaks. Other fields should be plain text. Content is trusted author-edited source, not user-submitted input.

After editing, run `npm run build`. Never edit `dist/` by hand; it is generated.

## Local development

Use Node.js 22 or later. There are no runtime or build dependencies to install.

```bash
npm run build
npm run dev
```

Then open `http://localhost:4173`. After editing the source, rebuild and refresh the browser. `npm run dev` builds once at startup.

```bash
npm run check
npm test
```

The checks validate source syntax, bilingual content completeness, internal links, language-pair routes, project slugs, and page structure. Browser QA still matters for layout and interaction.

## Structure

| File | Purpose |
| --- | --- |
| `src/content.json` | Editable English and Chinese text, projects, contact details |
| `build.mjs` | Shared page templates and static page generation |
| `src/styles.css` | Colors, typography, layout, mobile rules |
| `src/particles.js` | Original canvas particle artwork and pointer interaction |
| `src/site.js` | Clickable project rows |
| `scripts/serve.mjs` | Dependency-free local preview server |
| `scripts/check.mjs` | Content and generated-page checks |
| `.github/workflows/check.yml` | Automatic build and checks on commits / pull requests |
| `PROJECT_NOTES.md` | Decisions, known limitations, next tasks |

## URLs

- `/en/` and `/zh/`: landing page
- `/en/about/` and `/zh/about/`: background and contact
- `/en/work/{slug}/` and `/zh/work/{slug}/`: project overview
- `/`: English landing page

The language control links to the corresponding page. Navigation and text work without JavaScript. JavaScript enhances the particle field and the clickable area of table rows.

## Accessibility and performance

- Semantic headings, tables, links, and navigation.
- Visible keyboard focus and a skip link.
- A pause/play control; reduced-motion preferences default to a still image.
- Animation stops when the tab is hidden; reduced-motion defaults to a still frame.
- Mobile has fewer particles; pixel density is capped.
- No external fonts, trackers, or animation libraries.
- The canvas is decorative and never blocks access to project links.

## Deployment

`npm run build` produces a static site in `dist/`. Deploy that directory to a static host that supports directory `index.html` routes. No API keys, backend, database, or account system are required.

The current review deployment is managed separately through ChatGPT Sites. GitHub pushes run checks; they **do not automatically redeploy** that review site. Hosting integration can be added later.

## Version-control practice

For subsequent changes: create a focused feature branch, edit source, run checks, review both languages in a browser, and open a pull request. Keep commits small and describe the visitor-facing behavior. Do not commit credentials, dependencies, generated output, or private project materials.

## Design and content provenance

The visual direction closely follows Jason Yuan’s restrained three-column layout: identity on the left, vertical navigation in the center, and a compact introduction on the right. The particle field spans the viewport, with 160px of drawing overscan and a soft 22px outer edge fade to avoid clipping during hover. Colors cycle gradually over 72 seconds. The requested Harvard Innovation Labs particle reference could not render in the review browser because WebGL was unavailable; this implementation is an original Canvas 2D interaction, not a copy of its code or assets.

Bio, Qwen, TikTok, and Co-Hive overview facts are grounded in the supplied portfolio brief and résumé. Pison and experimental project pages remain explicitly preliminary where source materials have not been reviewed. No project metrics or individual contributions have been invented.
