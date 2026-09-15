# SolaRe Source

Static, responsive website. No build step or runtime dependencies.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. Logo variants: http://localhost:4173/brand/srs-logo-variants.html.

## Files

- `index.html`: page, navigation, search and enquiry dialogs.
- `styles.css`: responsive layouts, typography, motion and reduced-motion support.
- `app.js`: menu, local search, carousel, material accordions and enquiry preparation.
- `assets/laminate.js`: existing solar-panel diagram, moved from the original page.
- `brand/srs-mark-*.svg`: four vector reconstructions of the supplied logo, on transparent backgrounds.
- `archive/`: reference only, never served. Static scrape of the previous site, www.srcorp.com.au, taken 13 September 2026, plus its fetch log.

The enquiry form validates fields and prepares a `mailto:` draft. The visitor must send it from their email app. There is no backend, submission storage or analytics.

## Design and content

The layout adapts Palantir's homepage as inspected on 13 September 2026: full-screen hero, floating navigation, centered display type, large editorial sections and material rows. It is not a pixel-identical copy: SolaRe Source content, local solar imagery, an animated photograph and Archivo replace Palantir's content, reel and licensed Alliance typography.

Business copy and contact details were carried forward or adapted from this repository. The supplied logo was reconstructed as SVG; the original artwork is not embedded. The archived website is kept under `archive/`. The four earlier mark explorations were retired and live in git history at commit 526a9d4.

## Validation

JavaScript syntax, CSS parsing, internal anchor and asset resolution, and DOM interaction checks passed. Interaction checks covered navigation, modal scroll locking, search, no-result handling, contact field validation and animation pause. Browser screenshot comparison and mobile visual inspection remain unverified because the browser connection was unavailable.

## Assets

Solar images come from the existing SRC website's archived image references. The font is self-hosted Archivo from Google Fonts; see `assets/SOURCES.md`. No Palantir scripts, tracking, fonts or media are loaded by this site.
