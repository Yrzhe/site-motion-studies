# Motion

## Inventory

Important motion moments:

- Hero product stage: scroll-controlled camera/object relationship, not a
  simple fade-in.
- Blueprint frame: stable reference geometry while the object moves.
- Wearable/HUD beat: telemetry appears as if attached to the product concept.
- Flip encryption: a physical gesture becomes a security metaphor.
- Social/durability beats: image/video gallery rhythm supports feature jokes.
- Legacy beat: historical compatibility appears as a product spec.
- Contact ending: simpler, calmer, and more editorial.

## Choreography

Oryzo's scroll choreography works because each section owns a clear scene. The
page does not animate every object independently for decoration. Instead:

1. Scroll enters a section.
2. Section becomes the current scene.
3. Product/camera/labels update within that scene.
4. The visual grammar stays consistent across beats.

This pattern is useful for public demos: separate `section progress` from
`global scroll`, then map each section to a local 0-1 value.

## Reproduction Notes

Do not copy the original runtime. Rebuild the grammar:

- Use CSS dashed frames and mono labels for the technical layer.
- Use a simple 3D primitive, CSS transform, Canvas, or Three.js object as the
  product placeholder.
- Drive transforms from scroll progress.
- Keep the product object centered and let labels orbit the narrative.
- Use one accent color for HUD/telemetry only.

The included `blueprint-product-frame` demo implements the smallest useful
version of this: a staged product object, blueprint frame, spec labels, model
tab, and scroll progress HUD.
