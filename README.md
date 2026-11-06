# Bruce · Personal Website

Bilingual AI product management portfolio. Dependency-free static generation with Node.js 22+; Bruce is the display name in both languages.

## Design and content

Read `docs/DESIGN_SYSTEM.md` before changing the UI. The white editorial layout uses a glass B·XYZ hero and six landscape cards: Pison Health Agent, Qwen Create, Co-Hive, Eye Tracking Thingz, and two coming-soon studies. About and Contact are separate pages.

- `src/content.json`: bilingual portfolio copy and project order.
- `src/case-studies/pison.json` and `pison.mjs`: bilingual Pison presentation, demonstrations and team credits.
- `src/design-tokens.css` and `src/project-gallery.css`: shared visual rules.
- `src/hero-object.mjs`: glass letter artwork; `src/site.js`: interactions.
- `build.mjs`: static routes; `scripts/preview.mjs`: standalone previews.

Preserve factual attribution, prototype status, accessible motion and concise copy. The Pison business-model comparison and roadmap have been removed by request.

## Run and review

```sh
npm run dev
```

Open `http://localhost:4173/review.html` for desktop/mobile review. `/en/` and `/zh/` are the actual pages. `/pison-review.html` is the dedicated project preview.

```sh
npm run check
npm run preview
npm test
```

`dist/review.html` and `dist/pison-review.html` are standalone offline previews with embedded assets. `dist/` is generated and ignored by Git. Do not edit generated files manually.

## GitHub and hosting

Repository: https://github.com/xieBruce13/Personal-Website

GitHub pushes run build checks. They do not automatically redeploy a separately hosted Site. Deploy `dist/` only when publication is authorized.
