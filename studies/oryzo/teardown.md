# Teardown

## Page Structure

Oryzo is a long-form product story with a narrow layout vocabulary. The page
does not feel like a stack of landing-page sections. It feels like one product
stage being reinterpreted as the scroll moves.

| Beat | Product Claim | Visual System |
|---|---|---|
| Intro | The coaster is a flagship object. | Giant wordmark, central object, desk/cutting-mat stage, model tab. |
| AI | The coaster is an "AI model." | Dark product reveal, hand/coaster focus, `Powered by AI*`, Adobe Illustrator disclaimer. |
| Wearable | The coaster is a lifestyle object. | Main gallery, side thumbnails, warning overlay, magazine-cover joke. |
| Lift | It raises the mug by exactly one coaster thickness. | Vertical measurement, shadow change, geometry formula. |
| Thermal | It handles hot/cold extremes. | Heatmap color mode, TDM formula, intensified HUD. |
| Circularity | It is now more round. | Coaster as precision circle, curve equation, circularity metric. |
| Flip | Turning it over becomes encryption. | Physical flip gesture, security copy, unchanged premium UI. |
| Grip | The material is a lab sample. | Macro cork/desk texture, zoom box, friction coefficient. |
| Sustainability | The material becomes sourcing narrative. | Giant sustainability typography, bark/cork visuals, harvest facts. |
| Testimonies | Fake users validate the product. | Review table, absurd author personas, avatar/media cells. |
| Social content | Product claims become launch cards. | Always-on, RTX 3090, drop-test, legacy support social tiles. |
| Product | The fake product becomes a SKU. | ORYZO / Pro / Pro Max selector, waitlist CTA, detail panel. |
| Open weight | The coaster becomes an AI model release. | Paper/model/code buttons, peer review joke. |
| Footer | The real pitch is Lusion. | Large agency CTA, newsletter, contact links. |

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
| Storyboard state | Maps the true section order and changing visual mode. | `effects/01-scroll-scene-state/`. |
| Editorial rail | Holds the current claim and keeps copy stable. | `effects/05-rail-and-stage/`. |
| Product stage | Keeps the object visually central through scroll. | `effects/05-rail-and-stage/` (stage half). |
| Instrumentation | Makes the ordinary object feel measured. | `effects/06-measurement-hud/`. |
| Scene color/props | Changes the meaning of the same object. | `effects/03-color-mode-switch/`. |

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
