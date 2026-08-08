# Interaction Map

## Scroll

Scroll is the main input. It controls scene ownership, scene-local progress,
and the product/camera relationship.

Public pattern:

- Divide the full scroll range into named beats.
- Convert global scroll into `beat index + local progress`.
- Update copy only when the beat changes.
- Update physical values continuously from local progress.
- Keep labels readable and avoid moving every text element at once.

The `effects/01-scroll-scene-state/` recipe implements this model directly.

## Hover

Hover is secondary. It should sharpen intent on nav links, play chips, and
small controls, but not compete with the scroll narrative.

Useful hover treatment:

- Dashed underline or line emphasis for nav.
- Slight brightness/contrast shift on HUD chips.
- No bouncy easing; use fast ease-out.

## Click Or Tap

Clicks are used for contained controls such as a play chip, refill/control
button, or feature demonstration. They should feel like instrument controls,
not large marketing CTAs.

## Responsive

Mobile should preserve the idea of a staged product with annotations, but with
fewer simultaneous labels.

Recommendations:

- Keep the product/stage first.
- Collapse edge labels into bottom or top bands.
- Reduce side tabs and dense mono annotations.
- Preserve the section progression even when WebGL detail is simplified.

The public demo collapses the rail into a top band and keeps the product stage
as the primary screen object.
