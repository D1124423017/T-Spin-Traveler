# T-Spin Traveler Testing Checklist

Use this checklist after every gameplay, UI, asset, audio, or deployment change. Test Traditional Chinese and English for every screen that contains text.

## Basic Boot

- [ ] GitHub Pages opens: https://d1124423017.github.io/T-Spin-Traveler/
- [ ] Local build opens from a desktop-browser local server.
- [ ] GitHub Pages smoke test reaches the asset loading screen, then the main menu.
- [ ] Recommended platform is treated as desktop-only: keyboard required, no mobile touch controls.
- [ ] Main menu renders in Traditional Chinese.
- [ ] Main menu renders in English.
- [ ] Display font loads for English title, HUD text, numbers, and combat popups.
- [ ] Chinese text falls back to Noto Sans TC / system-ui and does not show missing glyph boxes.
- [ ] Background progression assets load correctly.
- [ ] Image assets load correctly: NOA, enemies, enemy attack sprites, backgrounds, and UI art.
- [ ] `window.TST_ASSETS.getSummary()` is available in the browser console.
- [ ] `window.TST_ASSETS.getSummary().counts.error` is absent or `0` during normal loading.

## Settings

- [ ] Left tabs show only Controls / Handling / Audio / Language / Feedback.
- [ ] General tab is not shown.
- [ ] Controls list is readable in Traditional Chinese.
- [ ] Controls list is readable in English.
- [ ] Controls key rebinding enters a visible waiting state.
- [ ] Rebind Move Left, Hard Drop, and Hold; the new keys work in gameplay.
- [ ] Rebound controls are saved to localStorage and remain after refresh.
- [ ] Esc cancels key rebinding instead of binding Esc, except existing Pause behavior remains valid.
- [ ] Audio sliders update Master / Music / SFX volume.
- [ ] M mute works and persists after refresh.
- [ ] Language can switch between Traditional Chinese and English.
- [ ] Feedback page shows Report Bug / Suggest Idea links.
- [ ] Report Bug opens GitHub Issues new.
- [ ] Suggest Idea opens GitHub Discussions or a valid fallback.
- [ ] Back to Pause / Back to Menu does not overlap with Esc in Traditional Chinese or English.
- [ ] Back to Pause / Back to Menu works from menu Settings and pause Settings.

## Game Flow

- [ ] Start Endless from the main menu.
- [ ] Start Tutorial from the main menu.
- [ ] Battle starts with the 3-second countdown.
- [ ] First-wave combat hint appears after battle start and fades out.
- [ ] Pause menu opens and closes.
- [ ] Settings opens from menu and pause.
- [ ] Return to main menu works from pause and result screens.
- [ ] Defeat enters the result screen without freezing.
- [ ] Pressing R restarts from the pause menu.
- [ ] Pressing R restarts from defeat / victory result screens.
- [ ] Retry button still works by mouse.
- [ ] Move Guide / 招式圖鑑 opens and returns correctly.

## Piece Controls

- [ ] Move left.
- [ ] Move right.
- [ ] Soft drop.
- [ ] Hard drop.
- [ ] Rotate clockwise.
- [ ] Rotate counterclockwise.
- [ ] Rotate 180 degrees.
- [ ] Hold stores and swaps one piece correctly.
- [ ] Hold lockout works after holding once before placement.
- [ ] Next preview shows 5 pieces.
- [ ] Next pieces refill in order after each placed piece.
- [ ] Restarting a run resets Hold and Next correctly.

## Combat Feedback

- [ ] Single line clear produces damage and feedback.
- [ ] Double line clear produces stronger feedback than Single.
- [ ] Triple line clear produces stronger feedback than Double.
- [ ] Tetris produces large clear feedback.
- [ ] Combo produces visible combo feedback and audio.
- [ ] B2B produces visible B2B feedback and audio.
- [ ] T-Spin produces distinct visual and audio feedback.
- [ ] Perfect Clear produces special feedback, hit-stop, and audio.
- [ ] Enemy HP changes after player attacks.
- [ ] Enemy hit reaction is visible.
- [ ] Hit breakdown popup shows move type and total damage.
- [ ] Enemy attack warning cue triggers before an enemy attack.
- [ ] Enemy attack resolves and updates player HP / Guard.
- [ ] Guard / shield blocked sound is distinct from player damage.
- [ ] Low player HP warning appears and audio pulse is not too frequent.

## Layout Checks

- [ ] 1920x1080 viewport reads clearly.
- [ ] Small desktop window reads clearly.
- [ ] Desktop keyboard hints remain visible and readable.
- [ ] No mobile virtual buttons or touch-only controls are shown.
- [ ] Traditional Chinese UI does not overlap.
- [ ] English UI does not overlap.
- [ ] Board remains the first visual priority.
- [ ] Next 5 preview does not overlap the enemy card.
- [ ] Hold panel does not overlap the player card.
- [ ] Bottom control hints do not cover the board or character.
- [ ] Pause menu text remains inside its panels.
- [ ] Settings / Controls rows stay aligned.
- [ ] Relic Draft English rarity and type labels do not overlap the emblem.
- [ ] Relic Draft Traditional Chinese layout remains readable.
- [ ] Move Guide uses the single-column list and does not show the old challenge panel.

## Visual Assets

- [ ] NOA main-menu idle breathing, glow, cloak, and particles are visible.
- [ ] NOA cube idle sprite sheet plays on the menu.
- [ ] NOA meditate idle sprite sheet plays on the menu.
- [ ] Egyptian Scarab Scout attack sprite sheet plays when its enemy attacks.
- [ ] Sand Tomb Mummy Priest attack sprite sheet plays when its enemy attacks.
- [ ] Anubis Rift Guard attack sprite sheet plays when its enemy attacks.
- [ ] Maya Stone Beast Scout attack sprite sheet plays when its enemy attacks.
- [ ] Maya Eclipse Priest attack sprite sheet plays when its enemy attacks.
- [ ] Maya Feathered Serpent Guard attack sprite sheet plays when its enemy attacks.
- [ ] Atlantis Crystal Jellyfish attack sprite sheet plays when its enemy attacks.
- [ ] Atlantis Tidal Shell Guard attack sprite sheet plays when its enemy attacks.
- [ ] Atlantis Rift Jellyfish attack sprite sheet plays when its enemy attacks.
- [ ] Atlantis Crystal Temple Sentinel attack sprite sheet plays when its enemy attacks.
- [ ] Enemy attack effects remain readable and do not cover the board.

## Background Progression

- [ ] Wave 1 uses the Egyptian star tomb exterior rift background.
- [ ] Wave 5 uses the Egyptian pyramid observatory rift background.
- [ ] Wave 10 uses the boss background override without breaking readability.
- [ ] Wave 11 returns to the Maya eclipse temple rift background.
- [ ] Wave 15 uses the Atlantis sunken crystal temple rift background.
- [ ] Boss waves 10 / 20 / 30 override the normal background with the ancient rift boss background.
- [ ] Backgrounds are dimmed enough to keep the board, HUD, and text readable.

## Audio

- [ ] Menu music starts after browser audio unlock.
- [ ] Wave 1 uses the early music layer.
- [ ] Wave 5 transitions to the mid music layer.
- [ ] Wave 10 triggers the boss stinger and boss music layer once.
- [ ] Wave 11 returns to the mid music layer.
- [ ] Wave 15 transitions to the late music layer.
- [ ] HP below 30% or high pending garbage triggers the danger layer without becoming annoying.
- [ ] Perfect Clear music ducking does not conflict with boss or danger layers.
- [ ] Master / Music / SFX sliders work.
- [ ] M mute silences audio and can be toggled back on.

## Asset Fallback

- [ ] Temporarily override or break one image path for local testing.
- [ ] Game does not crash when the image fails to load.
- [ ] Browser console shows one clear warning for the missing image.
- [ ] `window.TST_ASSETS.getSummary()` reports the missing image as `error`.
- [ ] Fallback drawing appears instead of an empty missing character, enemy, or background.
- [ ] Restore the image path before committing.

## Release / File Hygiene

- [ ] `git status --short` does not show accidental source changes.
- [ ] `renders/` is ignored and not committed.
- [ ] `.codex/` is ignored for future files; already tracked files should be reviewed separately.
- [ ] `dist/`, `tmp/`, and large render output folders are ignored.
- [ ] Confirm no obsolete promotional render artifacts are tracked.
- [ ] Confirm asset cache version before publishing GitHub Pages.

## Suggested Local Smoke Commands

```powershell
npm run check
npm run test
git diff --check
git status --short --ignored
```

Optional asset summary check in browser console:

```js
window.TST_ASSETS.getSummary()
```
