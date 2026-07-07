# Teardown

## Page Structure

Oryzo is a long-form product story with a narrow layout vocabulary. The page
does not feel like a stack of landing-page sections. It feels like one product
stage being reinterpreted as the scroll moves.

| Beat | Product Claim | Visual System |
|---|---|---|
| Intro | The coaster is a flagship object. | Giant wordmark, central object, desk/cutting-mat stage, model tab. |
| Lift | It raises the mug by exactly one coaster thickness. | Vertical measurement, shadow change, geometry formula. |
| Thermal | It handles hot/cold extremes. | Heatmap color mode, TDM formula, intensified HUD. |
| Flip | Turning it over becomes encryption. | Physical flip gesture, security copy, unchanged premium UI. |
| Built different | It survives/socializes like a product. | Gallery/media beats, stickers, colorways, floor/damage jokes. |
| Legacy | It supports ancient vessels. | Museum-like register, vessel silhouettes, compatibility copy. |
| Contact | The joke resolves calmly. | Reduced motion, simple email, product tagline. |

## Layout System

The site feels premium because it uses very few conventional webpage modules.
Most sections behave like scenes:

- Full viewport stage.
- Central product or model moment.
- One or two edge-aligned text groups.
- Mono labels as measurement marks.
- Dashed or gridded frames instead of cards.
- Fixed navigation and side tabs that make the page feel instrumented.

The result is closer to an industrial-design presentation deck than a SaaS
landing page.

## Layer Responsibilities

The public reconstruction separates the page into four reusable layers:

| Layer | Role | Public Demo Equivalent |
|---|---|---|
| Editorial rail | Holds the current claim and keeps copy stable. | `.copy-rail` in `scene-choreography`. |
| Product stage | Keeps the object visually central through scroll. | `.scene-lab`, `.desk`, `.pegboard`, `.product`. |
| Instrumentation | Makes the ordinary object feel measured. | `.blueprint`, `.hud-stack`, `.formula-strip`, `.model-tab`. |
| Scene color/props | Changes the meaning of the same object. | `body[data-scene]` thermal/legacy state changes. |

## Rendering Surfaces

The private archive indicates several rendering layers:

- DOM for navigation, copy, labels, credit panels, and CTA text.
- WebGL/Three-style runtime for 3D product scenes and scroll-driven camera
  beats.
- Gaussian splat / point-cloud style props for staged depth and atmosphere.
- Rive/video/media surfaces for supporting motion beats.
- CSS for dashed frames, typography, fixed labels, and layered stage chrome.

Public lesson: use DOM for text and instrumentation, and reserve WebGL/canvas
only for the object/camera world when needed. The public demo proves the
structure without copying Oryzo's renderer.

## Notable Techniques

- Product permanence: the object remains the anchor while the claim changes.
- Measurement as comedy: tiny specs make the product feel over-engineered.
- Left rail continuity: copy changes, but its container behaves like a fixed
  instrument panel.
- Scene state instead of animation soup: `intro`, `lift`, `thermal`, `flip`,
  and `legacy` have distinct visual rules.
- Rare accent color: cyan is only for instrumentation; thermal/legacy modes
  earn their own palettes.
