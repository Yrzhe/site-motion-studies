# Scroll Storyboard Demo

Original structural storyboard of the Oryzo page. This demo is intentionally not
a source clone. It maps the real top-to-bottom site order into a public,
inspectable scrollytelling diagram.

## What It Shows

- The real section sequence from Hero to Footer.
- How the same cork coaster is reinterpreted as AI model, wearable product,
  feature object, security device, material sample, social proof, product SKU,
  open model, and finally agency pitch.
- Which visual layer changes in each beat: DOM copy, WebGL product stage,
  gallery/media rail, table/list UI, configurator, or footer CTA.
- How the page uses serious product-launch language to make the coaster joke
  work.

## Source

- `index.html`: storyboard shell and semantic panels.
- `src/main.js`: real section data and scroll state mapping.
- `src/styles.css`: brand-neutral visual system.

## Run

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```
