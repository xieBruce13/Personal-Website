# Project notes

## Goal
Help Bruce Xie secure AI product manager roles by showing product judgment, design craft, and hands-on building.

## Current decisions
- English and Chinese, with persistent equivalent project routes.
- Dark landing page with a small-text, three-column composition and a loosely clustered, interactive particle hero above a solid black project index.
- Business and Experimental project groups, plus About and contact.
- Six project overview pages. Full case studies are a later stage.
- Editable copy centralized in `src/content.json`.
- Dependency-free static generation for this initial portfolio; reconsider a framework only when richer requirements justify it.
- GitHub is the user-facing code repository. Review hosting is separate and not auto-synced on GitHub push.

## Known limitations
- The Harvard WebGL effect could not be visually inspected. The particle behavior is an original interpretation.
- Pison, AI for Business, Eye Tracking Thingz, and Astra need detailed materials before writing case studies.
- Resume download, project imagery, and demo videos are not included in this landing-page iteration.
- Future public launch requires checking the content and choosing public hosting/access.

## Next
1. Review the revised landing-page composition, particle density, and color cycle with Bruce.
2. Add approved project screenshots, videos, and individual contribution details.
3. Complete the three business case studies.
4. Add a résumé download and finalize public deployment/domain.

## Revision 2
- Removed the oversized hero heading and framed particle shape.
- Added evenly spaced jittered particles over a continuous viewport background.
- Preserved cursor repulsion and spring-back parameters.
- Added a 72-second hue cycle, 160px drawing overscan, and a soft viewport edge fade.
- Source/build/link checks passed. Browser visual QA was blocked by an automatic approval review usage limit; this revision needs visual review.

## Revision 3
- Aligned the introduction, identity, and Work navigation at the top on desktop; kept a readable stacked mobile layout.
- Localized the displayed name: Bruce Xie in English, 谢凌翔 in Chinese.
- Replaced the cursor hint with the language switch at the lower right of the hero; retained pause/play.
- Confined particles to the hero with a soft bottom fade. All lower content uses solid black.
- Mixed broad drifting clusters with a sparse field; preserved cursor repulsion and hue cycling.
- Paused animation when the hero is offscreen. Language switching remains available if Canvas is unsupported.
- Browser visual QA remains blocked by the automatic approval review usage limit; verify the composition on desktop and mobile when browser access returns.

## Revision 4
- Removed the particle pause/play button at Bruce’s request. The language switch remains.
- Preserved automatic reduced-motion handling and offscreen/tab-hidden animation suspension.
- Bruce considers the landing-page direction settled after this small cleanup.

## Revision 5
- Anchored the introduction block to the right page margin, including when the desktop grid column is wider than its 440px reading width.
- Kept the text itself left-aligned; the mobile block also follows the right page margin.

## Pending review — Selected Work cards
- Not committed, pushed, or deployed. Existing site and GitHub version remain unchanged.
- Six full-width cards with numbered left rails, descriptions, focus labels, and explicit visual placeholders.
- Project text and images blur together near the viewport edges and sharpen in the reading area; keyboard focus and reduced motion show clear content.
- The hero particles gather into the active project number, then morph between 01–06 on scroll.
- Reference observed in browser: Jason Yuan’s opening screen shows a blurred lower project grid; scrolling resolves the grid. Our row layout and particle numbering are original adaptations.
- Next: Bruce reviews the preview; only after approval integrate and commit to GitHub.

Validation: static build and all 18 generated routes passed; desktop and 390px mobile views inspected in the browser, blur/clear states and particle numerals 01, 02, 06 observed, and English/Chinese project navigation verified. Browser logs contained extension metadata errors only, with no observed application error.

## Pending review — smoother single-number transitions
- Replaced irregular particle sampling with a shared regular dot grid for cleaner numerals.
- Hid all static numeral rails when canvas is active, including 01 in the opening blurred preview.
- One canvas draws only the active numeral; adjacent project numbers stay hidden.
- Added a 0.95-second eased transition between masks and smoothed the initial particle gathering.
- Applied identical blur/opacity/translation to each card’s copy and visual, including outgoing cards.
- Validation: syntax, build, and route/content checks passed. Browser confirmed opening preview copy/image blur with no numeral, a clean 01 after formation, and active 03 with hidden 02/04 and matching copy/image blur. Desktop/mobile behavior reviewed.
- Still uncommitted, unpushed, and undeployed. Await Bruce’s review before GitHub integration.

## Pending review — title-anchored numerals
- Formed particle numerals now align with their own project heading and scroll with the card.
- Removed the fixed viewport position and sticky number rail on desktop and mobile.
- Preserved initial gathering, single active numeral, and whole-card blur. No commit or deployment.

## Pending review — direct number switch
- Removed the visible Business and Experimental dividers from Selected Work while retaining accessible grouping and categories on project pages.
- Kept the hero-to-01 gathering, but subsequent active numerals switch immediately with no morph or dissolve.
- Numbers remain beside their own titles and scroll with the cards. Not committed or published.

## Pending review — compact particle formation
- Replaced the direct switch for 02–06 with a 480ms local particle gather around the incoming glyph.
- The outgoing number disappears immediately; the successor resolves in place beside its heading without a cross-number morph.
- The initial hero-to-01 gather remains. Reduced motion shows the settled glyph immediately.

## Pending review — five-project sequence and closing field
- Reordered selected work to Pison, Qwen Create, Eye Tracking Thingz, Generative Ground, and Co-Hive. AI for Business is not in the current five-card review.
- Renamed Astra's displayed title to Generative Ground in both languages while preserving the existing `/work/astra/` URL.
- Added a closing scroll area where 05 disperses back into a full-viewport particle field. Increased clustered particle share and tightened the cluster spread in both hero and closing field.
- Build and bilingual route checks passed; browser verified card order, 05 counter, and closing field. This remains an uncommitted, unpublished preview.

## Pending review — pinned reading interval
- Added native proximity scroll alignment and a bounded sticky interval per project. Oversized cards and reduced-motion layouts retain normal flow.
- Initial numeral gathering now completes after its entry threshold, even when scrolling stops. Local number formation remains timed.
- No GitHub commit or publication.

## Pending review — compact project cards
- Desktop media placeholders now cap at 520px wide (640px on very wide screens), roughly 60% of the former image area. Card padding and pinned dwell spacing are shorter.
- Mobile media sits beneath the text column at 250px in a 390px viewport. Build and bilingual checks passed; desktop and mobile dimensions verified in the browser.
- Review-only; no GitHub commit or deployment.

## Pending review — consistent card sizes and spacing
- Shared measured card height across all five projects; mobile image rows use the same copy-row height.
- Pin top is now 32px; dwell gap reduced from 24svh to 32–60px.
- Exit blur uses outgoing card position rather than height, so smaller pinned cards stay sharp.
- Browser confirmed all five desktop cards at 399px and mobile cards at 473px, with zero blur on the active pinned card. Source/build checks passed. No commit or publication.

## Approved GitHub update
Bruce authorized upload and commit of this five-project review with active-only blur. Adjacent cards retain 14px blur, including with reduced motion; keyboard-focused links remain readable.

## Ending transition refinement
05 now stays formed while Co-Hive is pinned. Passing the final card starts a 700ms spread and automatic travel to the footer. Upward scrolling can cancel the transition. This follow-up is pending review.

## End-of-day checkpoint — 2026-10-24
- Latest approved state: five compact, equal-height cards; active-only blur; particle numbers attached to headings; final timed transition to the footer.
- Fixed local-server startup regenerating the offline preview, stale transition anchor on fast scroll, and touch cancellation of automatic ending travel. Added graceful mask-canvas fallback and expanded syntax checks.
- Validation: source syntax, static build, all 16 generated pages, internal assets/links, bilingual copy and language-pair routes. Browser checked Chinese home, project navigation and equivalent English project page. Previous browser checks verified desktop/mobile equal sizing, active blur, and ending at exact page bottom.
- GitHub upload authorized. Hosting is separate and has not been redeployed.
- Tomorrow: replace placeholders with approved images/demo videos; fill Pison and other case studies from source materials; review keyboard/reduced-motion behavior on the user's own browser before public launch.
- No claim of exhaustive bug-free coverage: Safari/iOS and real project media have not been tested in this environment.
