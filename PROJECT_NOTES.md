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
