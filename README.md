# Bruce · Personal Website

Bilingual AI product management portfolio. Build with Node.js 22+ and install the build dependencies with `npm ci`. Bruce is the display name in both languages.

## Design and content

Read `docs/DESIGN_SYSTEM.md` before changing the UI. The white editorial layout uses a swimming scarlet koi behind the landing page and a single row of four square project covers: Pison Health Agent (Personal Agent), Qwen (Agent Team), Eye Tracking (Research Tool), and Defying Freud, a completed private LoRA study (Model Training). Each title and specialty appears below its cover. About and Contact are separate pages.

- `src/content.json`: bilingual portfolio copy and project order.
- `src/case-studies/pison.json` and `pison.mjs`: bilingual Pison presentation, demonstrations and team credits.
- `src/case-studies/qwen.json` and `src/qwen-product.css`: compact bilingual Qwen introduction, regional access note, and Bruce-supplied English product screenshot linked to the live Agent Team page.
- `src/design-tokens.css` and `src/project-gallery.css`: shared visual rules.
- `src/koi/`: landing-page koi illustration and motion; `src/site.js`: interactions.
- `build.mjs`: static routes; `scripts/preview.mjs`: standalone previews.

Preserve factual attribution, prototype status, accessible motion and concise copy. The Pison business-model comparison and roadmap have been removed by request.

## Run and review

### Temporary copy editor

Run `npm run edit` and open [the editing preview](http://127.0.0.1:4183/en/) on this computer. Choose **Edit text**, click a passage and type directly on the page. Choose one of the five text sizes, or choose **Text color** and use the swatch or hex field. Drag over individual letters on the page or in the text box before choosing a color. The panel shows which letters you selected. Repeat for additional colors, or choose **Whole passage** to color all its text at once. **Reset color** returns selected letters to the passage color, or restores the site default for a whole passage. Choose **Page default** to restore the original text role. Choose **Save changes** before using **Browse** to follow links or switch languages.

Save writes to `src/portfolio-edits.json`. Edits apply to the current page and language. Header edits are shared across pages in that language. Text embedded in images and video, link destinations and changing playback/menu labels are outside the editor.

Use `npm run build` for the finished pages or `npm run preview` to refresh the offline previews. Both include saved edits. The editing toolbar and save endpoint exist only in the local editing preview. Press Ctrl+C in its terminal to stop it.

```sh
npm run dev
```

Open `http://localhost:4173/review.html` for the lightweight hosted desktop/mobile portfolio review, including Home, Pison, Qwen, and Defying Freud. `/en/` and `/zh/` are the actual pages. `/pison-review.html` and `/qwen-review.html` redirect to the relevant hosted-review tabs.

```sh
npm run check
npm run preview
npm test
```

`npm run preview` also creates self-contained offline previews in `previews/review.html`, `previews/pison-review.html`, and `previews/qwen-review.html`. These may be large because media is embedded. The deployed `dist/review.html` remains a lightweight viewer that loads the actual Site routes. Do not edit generated files manually.

## GitHub and hosting

Repository: https://github.com/xieBruce13/Personal-Website

GitHub pushes run build checks. They do not automatically redeploy a separately hosted Site. Deploy `dist/` only when publication is authorized.
