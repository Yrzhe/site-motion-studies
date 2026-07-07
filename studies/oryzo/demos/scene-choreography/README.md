# Scene Choreography Demo

Original reconstruction of Oryzo's page-level motion grammar. This is not a
clone of the source site. It isolates the design system behind the original
experience:

- fixed left editorial rail
- desk/pegboard product stage
- scroll-owned scene beats
- centered object choreography
- technical HUD overlays
- thermal color state
- flip/security beat
- legacy/spec-history beat

## Motion Beats

| Beat | What Changes | What Stays Stable |
|---|---|---|
| Intro | Object sits as a measured product on a desk stage. | Nav, left rail, object center, model tab. |
| Lift | Coaster raises the cup and measurement ticks activate. | Stage composition and pegboard grid. |
| Thermal | Scene warms into a heatmap state and formula/HUD overlays intensify. | Product remains the only hero object. |
| Flip | Coaster rotates into a security metaphor while copy changes tone. | Technical instrumentation remains serious. |
| Legacy | Background shifts to a museum/spec register with vessel silhouettes. | Mono labels and precise product framing. |

## Source

- `index.html`: semantic stage structure.
- `src/styles.css`: visual system, object construction, responsive layout.
- `src/main.js`: scroll progress, scene selection, and dynamic labels.

## Run

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```
