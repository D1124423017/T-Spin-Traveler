# Project Structure

T-Spin Traveler keeps runtime code, development tools, and future content
separate so changes can be scoped and reviewed safely.

## Runtime

- `game.js`: application orchestration and lifecycle wiring only.
- `src/`: production ES modules grouped by responsibility.
- `data/`: shared root-level balance data retained for compatibility.
- `assets/images/`: images loaded by the current game.
- `assets/audio/`: music, jingles, and sound effects used by the current audio system.
- `assets/fonts/`: production font files.
- `tests/`: Vitest coverage for runtime rules, render contracts, assets, and UI.

## Future Content

- `assets/future/regions/<region>/`: approved future chapter art that is not active gameplay content.

Future content must not be promoted into runtime folders until its data,
renderer, registry, and tests are ready in the same change.

## Developer Support

- `tools/`: asset generators and normalization utilities.
- `tools/previews/`: browser-only visual inspection pages.
- `scripts/dev/`: local Windows development launch helpers.
- `docs/`: contributor-facing project, asset, and test documentation.

## Generated And Private Material

- `dist/`: generated Vite output; do not edit by hand.
- `tmp/`, `renders/`, `exports/`: ignored temporary output; do not reference from runtime code.
- `node_modules/`: installed dependencies.
- `.codex/`, `.vs/`, `.playwright-cli/`: local tool state.
- `企劃文件/`: private planning material; do not commit.

## Ownership Rules

- Put gameplay rules in `src/tetris/` or `src/combat/`.
- Put Canvas rendering in `src/render/`.
- Put screens and overlays in `src/ui/`.
- Put static data and the asset registry in `src/data/`.
- Put diagnostics and smoke helpers in `src/debug/`.
- Keep `game.js` limited to imports, wiring, orchestration, and central lifecycle glue.
