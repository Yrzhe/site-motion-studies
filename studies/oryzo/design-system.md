# Design System Notes

## Color

Primary palette:

- Background: near-black warm brown, around `#100904`.
- Main type: warm cream, around `#FFEDD7`.
- Muted text: tan/brown, around `#9A7E5C`.
- Glow: low-saturation warm brown/orange, used as stage light rather than
  decorative gradient.
- Technical accent: cyan around `#59E6D8`, used sparingly for HUD elements.

The palette works because the cyan is rare. If cyan becomes the dominant color,
the page turns into generic dark-tech UI and loses the deadpan luxury tone.

## Spacing And Grid

Layout is edge-aware and presentation-like:

- Wide desktop margins, roughly 40-64px.
- Full-viewport pinned sections.
- Center-weighted product object.
- Text sits at the edges and corners, like annotation on a product render.
- Vertical rhythm is generous; dense information appears in mono labels, not
  paragraphs.

Most frames are rectangular/dashed measurement devices, not content cards.

## Components

- Fixed nav with a small wordmark and understated section links.
- Fixed editorial/copy rail with a blurred glass/film surface.
- Desk or lab stage where the product remains central.
- Dashed blueprint frame around the object.
- Side model tab with vertical mono label.
- Formula strip that makes claims feel measured.
- Cyan HUD overlays for pseudo-scientific product telemetry.
- Scene-specific props: desk tools, heatmap, gallery/media, legacy vessels.
- Mono labels for model numbers, formulas, section metadata, and captions.

The important component is not any single dashed box. It is the relationship:

```text
left claim rail + center product stage + right/bottom measurement labels
```

That triangle lets the page change claims while still feeling like one system.

## Visual Texture

Texture comes from contrast between physical material and interface overlay:

- Cork/wood/desk warmth.
- Technical dashed lines.
- Measurement ticks.
- Soft product shadows.
- Shallow-depth 3D staging.
- A little thermal/HUD color used as a punchline.

Avoid generic glassmorphism. Blur panels should feel like instrument overlays,
not decorative cards.

## Public Reconstruction Rules

- Use a brand-neutral object unless the asset license is explicit.
- Keep the original's typography roles, not necessarily its exact font files.
- Preserve the section grammar: intro, physical feature, technical mode,
  gesture/joke, historical or social proof.
- Make the motion inspectable. In the demo, motion values live in CSS variables
  such as `--progress`, `--local`, `--lift`, and `--tilt`.
