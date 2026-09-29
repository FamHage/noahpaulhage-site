# Noah Paul Hage — UI reset starter

This is a plain static GitHub Pages site. `main` publishes the repository root; no build step is required.

## Active frontend

- `index.html` — minimal root layout and placeholder sections.
- `styles.css` — intentionally neutral global styling.

## Reserved structure

- `components/` — future reusable UI grouped by layout, navigation, media, archive, and work.
- `data/` — structured page or portfolio data.
- `content/` — longer-form copy or editorial content.
- `images/` — image assets. Drop future mockup assets here and reference clear filenames in a data file.

`content.js` remains as a preserved source of earlier archive data but is not currently loaded by the page. It can be refactored into `data/` when a mockup calls for that content.

## Working from mockups

Send a mockup with its intended page or section name. I will map each visible image area to an explicit content ID (for example `work-hero`), implement its layout faithfully, and tell you the exact filename/location for the final asset.
