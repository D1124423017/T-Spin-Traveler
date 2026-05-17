# Changelog

Notable project updates for T-Spin Traveler are recorded here.

## [Unreleased]

### Added

- Testing checklist for release and smoke-test passes.
- Changelog for tracking player-facing and production-quality improvements.

### Changed

- No gameplay changes are pending in this section.

### Fixed

- No fixes are pending in this section.

## [Current Prototype] - 2026-05-17

### Added

- GitHub Pages deployment for direct browser play.
- README play-online link.
- Custom `TSpin Traveler Display` font in `.ttf` and `.woff2` formats.
- Font test page for display-font readability checks.
- Asset loading registry with `window.TST_ASSETS.getSummary()`.
- Image loading fallback behavior with console warnings for failed images.

### Changed

- Main menu hierarchy and visual polish improved for a more game-like first screen.
- Battle HUD readability improved around player, enemy, Hold, Next, and combat feedback.
- Settings and Pause Menu readability polished.
- Display font readability improved through multiple passes, prioritizing readable English letters and HUD numbers.
- Next preview changed from 4 pieces to 5 pieces.

### Fixed

- Image loading failures now fail gracefully instead of leaving important visuals empty without diagnostics.
- Ambiguous display-font glyphs were adjusted for better readability in title, HUD, and combat text.
