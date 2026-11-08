# Bruce · Personal Website

Bilingual AI product management portfolio. Dependency-free static generation with Node.js 22+; Bruce is the display name in both languages.

## Design and content

Read `docs/DESIGN_SYSTEM.md` before changing the UI. The white editorial layout uses a glass B·XYZ hero and a single row of four square project covers: Pison Health Agent (Personal Agent), Qwen (Agent Team), Eye Tracking (Research Tool), and an in-progress Lucian Freud LoRA study (Model Training). Each title and specialty appears below its cover. About and Contact are separate pages.

- `src/content.json`: bilingual portfolio copy and project order.
- `src/case-studies/pison.json` and `pison.mjs`: bilingual Pison presentation, demonstrations and team credits.
- `src/case-studies/qwen.json` and `src/qwen-product.css`: compact bilingual Qwen introduction, regional access note, and Bruce-supplied English product screenshot linked to the live Agent Team page.
- `src/design-tokens.css` and `src/project-gallery.css`: shared visual rules.
- `src/hero-object.mjs`: glass letter artwork; `src/site.js`: interactions.
- `build.mjs`: static routes; `scripts/preview.mjs`: standalone previews.

Preserve factual attribution, prototype status, accessible motion and concise copy. The Pison business-model comparison and roadmap have been removed by request.

## Run and review

```sh
npm run dev
```

Open `http://localhost:4173/review.html` for the lightweight hosted desktop/mobile portfolio review, including Home, Pison, and Qwen. `/en/` and `/zh/` are the actual pages. `/pison-review.html` and `/qwen-review.html` redirect to the relevant hosted-review tabs.

```sh
npm run check
npm run preview
npm test
```

`npm run preview` also creates self-contained offline previews in `previews/review.html`, `previews/pison-review.html`, and `previews/qwen-review.html`. These may be large because media is embedded. The deployed `dist/review.html` remains a lightweight viewer that loads the actual Site routes. Do not edit generated files manually.

## GitHub and hosting

Repository: https://github.com/xieBruce13/Personal-Website

GitHub pushes run build checks. They do not automatically redeploy a separately hosted Site. Deploy `dist/` only when publication is authorized.
