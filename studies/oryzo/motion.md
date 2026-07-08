# Motion

## Inventory

The strongest motion idea is scene ownership. Each scroll span changes the
meaning of the same object rather than throwing in unrelated transitions.

| Motion | Trigger | Purpose | Public Demo |
|---|---|---|---|
| Section mode switch | Global scroll | Shows which product-launch trope is currently being borrowed. | `scroll-storyboard`. |
| Stage drift | Global scroll | Makes the environment feel cinematic without losing object focus. | Pegboard/mat translation. |
| Object lift | Lift beat local progress | Converts a product claim into physical evidence. | Cup/coaster vertical offset and shadow change. |
| Thermal state | Thermal beat local progress | Turns insulation into a visible technical mode. | Heat wash + HUD value + formula copy. |
| Flip gesture | Flip beat local progress | Makes the joke feature physically legible. | Coaster rotates while labels stay serious. |
| Legacy shift | Legacy beat entry | Reframes the product as historical compatibility. | Terracotta background + vessel silhouettes. |
| Interface takeover | Later sections | Changes the page from product scene into table, gallery, content wall, configurator, model release, and footer. | Storyboard visual modes. |

## Choreography

Oryzo's choreography is not "elements fade in as they enter viewport." It is a
state machine:

1. Scroll enters a section.
2. Section becomes the current scene.
3. Product/camera/labels update within that scene.
4. The visual grammar stays consistent across beats.

In the public demo, this is represented by:

```text
global scroll progress -> beat index -> local beat progress -> CSS variables
```

That split matters. The global progress owns page travel, while local progress
owns the current physical action. Mixing those two is how scrollytelling demos
usually become mushy.

## Reproduction Notes

To rebuild the motion without copying the original runtime:

- Define named scene states before writing animation code.
- Keep one stable product anchor across all states.
- Give each state one physical action: lift, heat, flip, gallery, legacy.
- Use CSS variables for motion values that need to stay inspectable.
- Keep labels mostly stable. If every label moves, nothing feels measured.
- Let color modes mark semantic changes, not generic decoration.

Use `demos/scroll-storyboard/` first to understand the full site sequence.
Use `demos/scene-choreography/` second to inspect one focused implementation of
the product-stage grammar.
