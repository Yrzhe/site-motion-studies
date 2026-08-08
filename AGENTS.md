# site-motion-studies — Agent Guide

This repository is a library of **rebuildable website motion effects**. Its
primary consumers are coding agents: point your agent here and rebuild any
effect on your own site **with your own assets**.

## How to consume this repo (protocol)

1. Open `llms.txt` for the index of studies and effects.
2. Pick an effect: `studies/<site>/effects/<effect>/`.
3. Read that folder's **`RECIPE.md`**. It is self-contained — you do not need
   any other file in the repo to rebuild the effect.
4. Build against the recipe in this order:
   - **Contract** — parameters, inputs/outputs, invariants. Respect the
     invariants; they are what make the effect read correctly.
   - **Mechanism** — the exact math/structure. Reuse it verbatim.
   - **Asset adaptation** — how to swap in the user's object, palette, copy.
     The recipe locks the mechanism, never the skin.
   - **Acceptance checks** — verify your build: expected values at given
     progress points plus a visual checklist. Do not report success until
     these pass.
   - **Porting notes** — what you may change and what you must not.
5. `demo/index.html` in the same folder is a minimal runnable reference
   (single file, no dependencies). Use it to sanity-check behavior, not as
   the thing you copy wholesale.

## Rules

- Rebuild the **mechanism**, not the original site's pixels. Do not fetch or
  reuse the studied site's assets, fonts, or source.
- Every value the recipe marks as an invariant must survive your port.
- If the host page already has a scroll framework (GSAP/Lenis), you may remap
  the Mechanism's progress math onto it as long as outputs match the
  Acceptance table.

## For contributors (agents adding studies)

- One study per site under `studies/<slug>/`. Decompose the site into MANY
  effects — one folder per effect, numbered.
- Each effect folder = `RECIPE.md` (sections: Contract / Mechanism / Build
  steps / Asset adaptation / Acceptance checks / Porting notes / Demo) +
  `demo/index.html` (single file, no deps, gray page + one accent + live
  readout, no decoration).
- Recipes must be self-contained: inline the scroll math in every recipe;
  never write "see effect 01".
- List every effect in the study's `manifest.json` `effects[]`.
- Run `node tools/check-study.mjs` before publishing; it validates structure
  and public-safety rules.
- Never commit original-site bundles, fonts, models, or source-quality
  captures. See the root `README.md` safety model.
