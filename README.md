# Bruce Xie · Personal Website

Bilingual portfolio for Bruce Xie / 谢凌翔. Dependency-free static generation; Node.js 22+.

## Edit content

All English and Chinese copy is in `src/content.json`. The `projects` array controls card order and numbering:

1. Pison
2. Qwen Create
3. Eye Tracking Thingz
4. Generative Ground (existing `/work/astra/` URL retained)
5. Co-Hive

Keep slugs stable when changing names. Visuals are explicit placeholders; full case studies and real assets are still to be added. No metrics or research should be added without supporting materials.

## Run and review

```sh
npm run dev
```

Open `http://localhost:4173/review.html` for the desktop/mobile review, or `/en/` and `/zh/` for the actual pages. After source edits, run `npm run preview` and refresh.

```sh
npm run check
npm run preview
npm test
```

`dist/review.html` is a standalone offline file with embedded styles, scripts, and bilingual pages. Download and open it directly in a browser. `dist/` is generated and ignored by Git; do not edit it manually. Running the build replaces generated output.

## Source map

| File | Purpose |
| --- | --- |
| `src/content.json` | Editable copy, project order, links and placeholder colors |
| `build.mjs` | Static page templates and bilingual routes |
| `src/styles.css` | Responsive layout, equal cards, sticky reading positions |
| `src/site.js` | Card sizing and active-only blur |
| `src/particles.js` | Hero clusters, numeral formation, closing transition |
| `scripts/preview.mjs` | Standalone offline preview generator |
| `scripts/serve.mjs` | Local-only development server by default |
| `scripts/check.mjs` | Content, routes, assets and link checks |
| `PROJECT_NOTES.md` | Decisions, validation and next tasks |

## Interaction behavior

Only the active card is sharp. Its number forms beside the title; inactive card text and imagery remain blurred. Keyboard focus reveals content so links remain readable. Cards have equal measured heights at each viewport size. Cards too tall to fit the viewport use normal scrolling.

The hero gathers into 01 after a threshold, then finishes without further scroll input. Later numbers gather locally in 480ms. Leaving the last card triggers a 700ms spread and scroll to the footer. Upward wheel/key input or touch cancels this automatic travel. Reduced motion displays settled particles without continuous animation and disables pinning/snap. Hidden tabs suspend animation.

## GitHub and hosting

GitHub: https://github.com/xieBruce13/Personal-Website

GitHub pushes run build checks. They do not automatically redeploy the separately hosted Site. Deploy `dist/` only when publication is authorized; the offline preview does not publish anything.

## Next session

Start with `PROJECT_NOTES.md`. Prioritize real project images/demos and factual case-study content. Validate changes in both languages and at desktop/mobile widths before committing.
