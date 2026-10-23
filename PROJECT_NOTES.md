# Project notes

## Goal
Help Bruce Xie secure AI product manager roles by showing product judgment, design craft, and hands-on building.

## Current decisions
- English and Chinese, with persistent equivalent project routes.
- Dark landing page with a small-text, three-column composition and an evenly distributed, interactive particle background.
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
