# Changelog

Notable project updates for T-Spin Traveler are recorded here.

## [Unreleased]

### Added

- Release-oriented testing checklist updates for Settings, controls rebinding, background progression, audio layers, defeat retry, and file hygiene.
- Git ignore rules for generated render outputs, temporary folders, and local Codex workspace files.
- ES module entry through `src/main.js`, focused core modules, `package.json`, and Vitest coverage for board, hold, queue, Spin detection, and damage calculation.
- Asset loading screen before the main menu with fallback warning text for failed assets.

### Changed

- `game.js` now delegates core Tetris, asset registry, and battle result flow to smaller modules while preserving desktop browser gameplay.
- Documentation now states desktop browser only with keyboard controls required.

### Fixed

- Spin detection no longer treats a single upward collision as enough for All-Spin; non-T pieces must be immobile in four directions, and O pieces do not trigger All-Spin.

## [Current Prototype] - 2026-05-19

### Added

- GitHub Pages deployment for direct browser play.
- README play-online link.
- Custom `TSpin Traveler Display` font in `.ttf` and `.woff2` formats.
- Font test page for display-font readability checks.
- Asset loading registry with `window.TST_ASSETS.getSummary()`.
- Image loading fallback behavior with console warnings for failed images.
- First-wave combat hint explaining that line clears attack enemies and T-Spins deal heavy damage.
- Hit breakdown combat popups for line clears, Combo, B2B, T-Spin, and Perfect Clear damage.
- Feedback links in Settings for GitHub bug reports and improvement suggestions.
- Controls key rebinding with localStorage persistence.
- Wave-based background progression using forest, ruins, corrupted forest, and rift boss scenes.
- Audio v0.3 SFX layering pass for soft drop, lock, Combo, B2B, T-Spin, Perfect Clear, guard block, enemy warning, and low HP cues.
- Audio v0.4 music layers for menu, early, mid, late, boss, and danger states.
- NOA main-menu idle sprite sheets for cube and meditate idles.
- Enemy-specific attack sprite sheets for Thorn Prowler, Wisp Moth, and Ruin Sentinel.
- Promotional trailer template, render script, and tracked `trailer.mp4`.

### Changed

- Main menu hierarchy and visual polish improved for a more game-like first screen.
- Battle HUD readability improved around player, enemy, Hold, Next, and combat feedback.
- Settings menu reworked to five tabs: Controls, Handling, Audio, Language, Feedback.
- Settings and Pause Menu readability polished.
- Display font readability improved through multiple passes, prioritizing readable English letters and HUD numbers.
- Next preview changed from 4 pieces to 5 pieces.
- Move Guide changed to a cleaner single-column list without the old challenge panel.
- Relic Draft card layout improved for English rarity and type labels.
- Boss HP scaling lowered from `1.3` to `1.2` so ordinary players spend less time on boss waves.

### Fixed

- Image loading failures now fail gracefully instead of leaving important visuals empty without diagnostics.
- Ambiguous display-font glyphs were adjusted for better readability in title, HUD, and combat text.
- Defeat state cleanup clears active pieces, pending hits, countdown, hit-stop, and input repeat before showing the result screen.
- Result and pause retry flow now uses `R` for restart / retry.

## [Documentation Baseline] - 2026-05-17

### Added

- Testing checklist for release and smoke-test passes.
- Changelog for tracking player-facing and production-quality improvements.
