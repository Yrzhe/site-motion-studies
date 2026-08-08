# Studies

Each folder is one public website study. One site = **many effects**.

A study explains what was learned from the original site and decomposes it
into individually rebuildable effects under `effects/`. It never contains a
full clone or copied deployment assets.

## Adding a new study

1. Scaffold from the private `motion-director` workspace:

   ```bash
   node scripts/scaffold-public-study.mjs <site-slug> \
     --title "<Public Study Title>" \
     --url "<original-url>"
   ```

2. Watch the original site and list candidate effects (aim for 5+; every
   interesting site has many). Record them in the study `README.md` table
   and `manifest.json` `effects[]`.
3. For each effect, copy `templates/study/effects/01-example-effect/` and
   fill in `RECIPE.md` (Contract / Mechanism / Build steps / Asset
   adaptation / Acceptance checks / Porting notes) and the minimal
   `demo/index.html` (single file, gray page, one accent, live readout).
4. Recipes must be self-contained — inline the scroll math in every recipe.
5. Validate: `node tools/check-study.mjs` must pass with 0 errors.
6. Best test before publishing: give ONE effect folder to a cold agent and
   ask it to rebuild the effect with different assets. Whatever it has to
   guess is what the recipe is missing.

## Maintaining

- Mature, brand-neutral effects graduate to `patterns/`.
- Keep `llms.txt` in sync when adding studies or effects.
- `manifest.json` `status` tracks the study lifecycle
  (draft / review / public / withdrawn).
