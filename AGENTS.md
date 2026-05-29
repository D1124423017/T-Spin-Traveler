# T-Spin Traveler Codex Development Rules

## 1. Project Scope

- T-Spin Traveler is a 2D HTML Canvas web game prototype.
- Core gameplay combines falling-block line clears with fantasy RPG combat.
- Supported target is PC / desktop browser / keyboard controls / GitHub Pages.
- Do not add mobile touch controls, mobile buttons, or large unrelated systems.

## 2. Architecture Rules

- `game.js` is the game flow coordinator, Canvas main entry, player input bridge, and module wiring layer.
- Do not put large new feature implementations back into `game.js`.
- Prefer existing modules for new work:
  - `src/data/upgrades.js`: upgrade data, Trait definitions, Overcap settings.
  - `src/data/enemies.js`: enemy data.
  - `src/data/i18n.js`: zh / en UI text.
  - `src/data/assets.js`: asset registry and paths.
  - `src/combat/damage.js`: pure damage calculation.
  - `src/combat/upgradeEffects.js`: upgrade effects and Overcap helpers.
  - `src/combat/buildStats.js`: Build / Trait statistics.
  - `src/combat/enemyTypes.js`: Boss / Mini Boss detection.
  - `src/combat/combatRules.js`: combat rule helpers.
  - `src/ui/piecePreview.js`: Hold / Next preview helpers.
  - `src/ui/upgradeCards.js`: upgrade card layout helpers.
  - `src/ui/traitPanel.js`: Trait panel helpers.
  - `src/ui/hudLayout.js`: HUD layout helpers.
  - `src/ui/textLayout.js`: text wrapping and fit helpers.
  - `src/render/drawUtils.js`: common Canvas drawing helpers.
  - `src/core/metaProgress.js`: Rift Energy, permanent upgrades, and localStorage.
  - `src/tetris/board.js`, `src/tetris/pieces.js`, `src/tetris/hold.js`, `src/tetris/spinDetection.js`: Tetris core logic.

## 3. Modification Rules

- If a task only asks for UI, do not change combat logic.
- If a task only asks for data, do not change rendering.
- If a task only asks for a bug fix, do not add unrelated features.
- Do not change core gameplay rules, key bindings, enemy values, upgrade card values, the music system, or the main menu NOA idle animation unless explicitly requested.
- Do not reset localStorage.
- Do not break GitHub Pages.
- Do not delete assets unless the replacement is confirmed and already wired.

## 4. i18n Rules

- All new UI text must be added to `src/data/i18n.js`.
- Always provide at least `zh` and `en`.
- Do not hardcode single-language UI text in `game.js`.

## 5. Art Rules

- Formal in-game art must use real production assets, not placeholders.
- Formal in-game image assets must be produced with image generation / 生圖模式 by default.
- Do not create formal in-game art with Canvas procedural drawing, SVG procedural drawing, PowerShell / GDI+, CSS / HTML image composition, geometric glow line art, placeholder blocks, Canva-style templates, or low-resolution temporary materials unless explicitly requested.
- This applies to upgrade card frames, UI icons, upgrade icons, energy icons, enemies, characters, spritesheets, VFX, backgrounds, panel ornaments, and any other formal image asset shown to players.
- Programmatic drawing is allowed for debug views, collision / hitbox / layout visualization, temporary test images, smoke-test placeholders, or when explicitly requested, but those outputs must not be committed as formal game art.
- New images should be placed in a reasonable asset folder, registered in the asset registry, and update `ASSET_VERSION` when needed.
- UI / character / enemy / spritesheet assets should be transparent PNGs when the game pipeline expects cutout art, with no black, white, or fake checkerboard background.
- Maintain the established fantasy style: magic rifts, purple-blue neon, forest ruins, and translucent magical UI.
- Do not shift the visual direction toward modern tech, cute cartoon, or low-cost mobile-game styling.

## 6. Testing Rules

Run these checks after every change:

- `npm run check`
- `npm run test`
- `git diff --check`
- Vite smoke test

If Browser smoke cannot run because of tool limitations, use HTTP / module import / asset smoke fallback and report the remaining risk.

## 7. Commit / Push Rules

- Do not commit or push unless the user explicitly allows it.
- If the user says "commit / push if OK", push to `main` only after checks pass.
- Use concise, clear commit messages.
- Do not mix unrelated changes into the same commit.

## 8. Final Report Format

After completing a task, report:

- Modified files
- Added files
- Deleted files
- Functional changes
- Architecture impact
- For art tasks: whether image generation was used, whether procedural drawing was avoided, generated filenames, resolution, transparency, asset folder, `src/data/assets.js` update, `ASSET_VERSION` update, and whether the asset is actually wired into the game.
- Test results
- GitHub commit hash
- Whether push succeeded
- `git status`
- Risks
