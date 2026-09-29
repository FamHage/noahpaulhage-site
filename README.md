# Noah Paul Hage — Editorial Archive

A static, data-driven fashion archive hosted from the repository root on GitHub Pages. No build step, package manager, or database is required.

## Files

- `index.html` — archive shell and navigation.
- `styles.css` — responsive editorial styling.
- `content.js` — all looks, hotspot notes, House Codes and Process entries.
- `app.js` — slideshow, dialog, keyboard/touch controls and local-development helper.
- `images/` — approved look, detail and process images.

## Add a new look

1. Put the approved full-look image in `images/`, for example `images/look-02.jpg`.
2. In `content.js`, add a new object to `ARCHIVE.looks`, using the first object as a template.
3. Set `id`, `title`, `collection`, `heroImage`, and an accurate `heroAlt` description.
4. Add one object to its `details` array for every interactive garment note.

## Add a hotspot and detail image

1. Add an approved close-up to `images/`, for example `images/look-02-corset.jpg`.
2. Add a `details` object with a unique `id`, `x` and `y` values, verified copy, and `image` path.
3. `x` and `y` are percentages: `x: 50, y: 35` is the centre of the image, 35% from the top.
4. Open the site locally (for example, `python3 -m http.server` in this folder). Click the full image and the development-only helper displays copyable `x`/`y` values. It never appears on `noahpaulhage.com`.

## Add a House Code

Edit `ARCHIVE.houseCodes` in `content.js`. Each entry is `[title, short explanation]`. Replace the placeholder text with verified house language.

## Placeholder notice

`images/look-01-placeholder.png` and all sample copy are explicitly placeholders. Replace them with approved fashion work and verified text before treating the site as a public portfolio archive.
