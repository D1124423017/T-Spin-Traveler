# T-Spin Traveler Development Rules

## Project Scope

T-Spin Traveler is a 2D HTML Canvas desktop browser game prototype.

Tech stack:

- HTML
- CSS
- JavaScript ES Modules
- Canvas
- Vitest
- GitHub Pages

The supported target is PC and desktop browsers with keyboard controls.

Do not add mobile touch controls, unrelated RPG systems, shop systems, gacha
systems, or large unrelated features unless explicitly requested.

## game.js Role

`game.js` must stay as the orchestration layer.

`game.js` may contain:

- app entry wiring
- state wiring
- main loop orchestration
- mode routing glue
- callback integration
- high-risk gameplay lifecycle glue that is intentionally kept central

`game.js` must not receive new large feature implementations.

Do not add these directly into `game.js`:

- full UI screen renderers
- Canvas panel renderers
- VFX configuration tables
- spritesheet renderers
- new data tables
- new system rules
- large input routing blocks
- debug or smoke helpers
- permanent progression logic
- asset registry logic
- large formatter or layout helpers

Before adding logic to `game.js`, check whether it belongs in an existing
module. Create a focused module only when no existing module has the correct
responsibility.

If `game.js` must be modified:

1. Explain why.
2. Keep the change to imports, wiring, orchestration, or callback integration.
3. Report how many lines were added and removed.
4. State why the logic could not live entirely in an existing module.

## Module Placement Rules

Use the existing modular structure:

- UI screens and Canvas UI: `src/ui/`
- Gameplay renderers, sprites, effects, and board rendering: `src/render/`
- Tetris rules and board logic: `src/tetris/`
- Combat calculations and combat rules: `src/combat/`
- Persistent progress, save migration, ascension state, and pure core rules:
  `src/core/`
- Static data, enemies, upgrades, i18n, and asset registry: `src/data/`
- Input routing and key binding: `src/input/`
- Debug HUD, smoke helpers, and diagnostics: `src/debug/`
- Tests: `tests/`

Before adding a new module, check whether an existing module should be
extended instead. Keep modules focused and avoid replacing `game.js` with a
different giant file.

Presentation modules may read display state and return layout or render data.
They must not own damage, score, progression, save writes, win/loss rules, or
gameplay timing.

## Existing Important Modules

Respect these modules and extend them when appropriate.

### Render and VFX

- `src/render/playerAttackVfx.js`
- `src/render/enemyAttackVfx.js`
- `src/render/enemyDeathVfx.js`
- `src/render/playerHitVfx.js`
- `src/render/gameplayRenderer.js`
- `src/render/battleSceneRenderer.js`
- `src/render/battleBoardRenderer.js`
- `src/render/battleParticleRenderer.js`
- `src/render/attackEffectRenderer.js`
- `src/render/combatCinematicRenderer.js`
- `src/render/combatAnimationStateController.js`
- `src/render/playerStageRenderer.js`
- `src/render/enemyStageRenderer.js`

### UI

- `src/ui/metaUpgradeScreen.js`
- `src/ui/upgradeScreen.js`
- `src/ui/upgradeCardRenderer.js`
- `src/ui/upgradeUiPrimitives.js`
- `src/ui/battleHud.js`
- `src/ui/enemyPanel.js`
- `src/ui/sidePieceRenderer.js`
- `src/ui/menuScreen.js`
- `src/ui/settingsScreen.js`
- `src/ui/pauseOverlay.js`
- `src/ui/resultOverlayRenderer.js`
- `src/ui/overlayRenderController.js`
- `src/ui/battleFeedbackController.js`

### Core, Input, and Debug

- `src/core/metaProgress.js`
- `src/core/ascensionChallenge.js`
- `src/core/assetLoadingController.js`
- `src/core/gameModeHelpers.js`
- `src/input/inputController.js`
- `src/input/controlBindings.js`
- `src/input/settingsInputRouter.js`
- `src/debug/debugHud.js`
- `src/debug/runtimeSmoke.js`

## High-Risk Areas

Do not refactor or casually modify these areas unless the task explicitly asks
for it:

- `lockPiece`
- `spawnPiece`
- Hold and Next queue rules
- rotate, hard drop, and soft drop core behavior
- `checkDefeatState`
- `resolvePlayingFlowSafety`
- `triggerDefeat`
- `finishRun`
- `drawResultOverlay` flow control
- hidden buffer and top out
- piece lifecycle
- battle flow core
- pending hit scheduling
- damage calculation
- enemy attack schedule
- Rift Energy settlement
- localStorage and `metaProgress` migration
- audio unlock
- music system
- main menu NOA idle animation

If one of these must be touched:

1. Explain the risk before editing.
2. Use the smallest possible change.
3. Add or update focused tests.
4. Keep the change isolated.
5. Report exactly which conditions, timing, or state mutations changed.

Do not move a high-risk function merely to reduce `game.js` line count.

## Modification Rules

- If a task only asks for UI, do not change combat logic.
- If a task only asks for data, do not change rendering.
- If a task only asks for a bug fix, do not add unrelated features.
- Do not change core gameplay rules, key bindings, enemy values, upgrade
  values, ascension rules, music behavior, or NOA idle behavior unless
  explicitly requested.
- Do not reset localStorage.
- Do not break the GitHub Pages entry.
- Do not delete assets unless a confirmed replacement is already wired.

## i18n Rules

All new user-facing UI text must go through:

- `src/data/i18n.js`

Always provide both:

- `zh`
- `en`

Do not hardcode single-language user-facing text in `game.js` or presentation
modules. Do not bake card names, descriptions, values, or UI text into images.

## Art and Asset Rules

If a task involves art, icons, spritesheets, UI images, backgrounds, or VFX:

- create formal usable assets, not placeholders
- use image generation for formal player-visible art by default
- use high resolution
- place files in a logical asset folder
- update `src/data/assets.js`
- update tests when needed
- update `ASSET_VERSION` when needed
- confirm the assets actually load in the game

Minimum sizes:

- Backgrounds: at least 1920x1080
- UI and icons: at least 512x512, preferably 1024x1024 when detailed
- Spritesheets: consistent grid, transparent PNG, no fake transparency, no
  text, and no frame numbering

Formal in-game art must not be created with Canvas procedural drawing, SVG
procedural drawing, PowerShell or GDI+, CSS or HTML image composition,
placeholder blocks, or template-style mockups unless explicitly requested.
Programmatic drawing is allowed for debug and temporary test visualization,
but those outputs must not be committed as formal game art.

The visual style must remain:

- fantasy
- ancient ruins
- purple-blue rift energy
- magical alien and Grey alien motifs
- semi-transparent dark panels
- lost civilizations, star maps, obelisks, temples, and crystal ruins

Do not shift the style toward modern sci-fi mecha, cute cartoon, low-cost
mobile-game styling, or horror gore.

## Git Rules

Never use:

```text
git add .
```

Before every commit:

1. Show `git status --short`.
2. Stage precise files only.
3. Show `git diff --cached --name-status`.
4. Confirm no forbidden or unrelated files are staged.

Never commit:

- `企劃文件/`
- `tmp/`
- `.playwright-cli/`
- `.codex/`
- `codex-backups/`
- `renders/`
- `exports/`
- smoke test screenshots
- private files
- school assignment files
- unrelated files

Do not commit or push unless the user explicitly permits it. When permitted,
push to `main` only after all required checks pass.

## Required Checks

After changes, run:

- `npm run check`
- `npm run test`
- `git diff --check`
- `node --check` for every modified or added JavaScript file
- Vite smoke test

If Browser smoke cannot run because of tool limitations, use an HTTP, module,
and asset smoke fallback and report the remaining risk.

If assets, the GitHub Pages entry, audio, ES modules, or the image registry
change, also confirm:

- Network 404 = 0
- Console runtime error = 0
- `window.TST_ASSETS.getSummary()` has no new asset errors

## Required Report Format

Every implementation report must include:

- modified files
- added files
- deleted files
- whether `game.js` changed
- `game.js` lines added and removed
- why `game.js` had to change
- new module responsibilities
- tests run
- smoke test result
- commit hash when committed
- push result when pushed
- current `git status`
- risks
- whether commit or push is recommended

## Future Library Constraint

Do not introduce Anime.js for Canvas gameplay. If it is explicitly introduced
later for DOM-only UI animation, isolate it behind `src/dom/domAnimation.js`.
That adapter may receive DOM elements and display options only; it must not
read or mutate gameplay state. The existing `requestAnimationFrame` loop stays
authoritative for Canvas rendering and gameplay timing.
