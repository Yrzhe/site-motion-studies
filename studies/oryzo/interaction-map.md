# Interaction Map

## Scroll

Scroll is the main input. It controls section ownership, scene transitions, and
the product/camera relationship.

Private reconstruction used the concept of registered sections with measured
show/hide offsets. Public pattern:

- Measure each section relative to the viewport.
- Convert the active section into a local progress value.
- Update the stage from that local progress.
- Keep labels readable and avoid moving every text element at once.

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
