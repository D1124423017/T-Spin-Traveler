# Image Asset Notes

- Runtime NOA art lives in `assets/images/characters/noa/`.
- The canonical NOA proportion reference is `assets/images/characters/noa/ET_Character_fullbody_alpha.png`.
- Runtime region art lives in `assets/images/regions/<region>/`.
- Shared presentation art is grouped under `assets/images/ui/`, `equipment/`, `cards/`, and `vfx/`.
- Future chapter art belongs in `assets/future/regions/<region>/` until its gameplay and data wiring are ready.
- Uncertain alternatives belong in ignored `tmp/` or `renders/` until approved.
- Remove superseded art only through a separately approved cleanup change.
- Runtime character and attack animations use transparent 4 x 4, 16-frame sprite sheets unless a focused renderer documents another grid.
- New sprite sheets must be added to `src/data/assets.js` and, when useful for inspection, `src/debug/spriteSheetCatalog.js`.

Do not add asset tables or animation configuration directly to `game.js`.
