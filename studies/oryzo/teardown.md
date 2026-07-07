# Teardown

## Page Structure

Oryzo is a long-form product story with roughly six conceptual beats:

1. Intro hero: huge `ORYZO` wordmark, the coaster staged as a precision object,
   blueprint/cutting-mat framing, Lusion credit panel, and a model label tab.
2. Wearable: the coaster treated as a body-adjacent utility with caffeine/HUD
   language.
3. Smart flip encryption: a joke feature presented with product-security
   seriousness.
4. Built different: social proof, damage/floor/sticker/color beats, and
   physical durability claims.
5. Legacy/backwards compatibility: ancient vessels presented as compatibility
   evidence.
6. Contact: short closing line, email, and the "made for mugs" refrain.

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

## Rendering Surfaces

The private archive indicates several rendering layers:

- DOM for navigation, copy, labels, credit panels, and CTA text.
- WebGL/Three-style runtime for 3D product scenes and scroll-driven camera
  beats.
- Gaussian splat / point-cloud style props for staged depth and atmosphere.
- Rive/video/media surfaces for supporting motion beats.
- CSS for dashed frames, typography, fixed labels, and layered stage chrome.

Public lesson: use DOM for text and instrumentation, and reserve WebGL for the
object/camera world. That keeps copy crisp while the product remains cinematic.

## Notable Techniques

- Treat a tiny object as if it has a full industrial design system.
- Use measurement language to create perceived precision.
- Let scroll choose the active scene instead of just staggering elements.
- Keep color disciplined: warm dark stage, cream UI, one cyan technical accent.
- Pair absurd claims with serious execution so the joke feels premium, not
  goofy.
- Build public pattern demos from the interaction grammar rather than copying
  the original runtime.
