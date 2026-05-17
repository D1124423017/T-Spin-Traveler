# T-Spin Traveler Testing Checklist

Use this checklist after every gameplay, UI, asset, or deployment change. For visual checks, test both Traditional Chinese and English when the changed surface contains text.

## Basic Boot

- [ ] GitHub Pages opens: https://d1124423017.github.io/T-Spin-Traveler/
- [ ] Main menu renders in Traditional Chinese.
- [ ] Main menu renders in English.
- [ ] Display font loads correctly for English title, HUD text, numbers, and combat popups.
- [ ] Chinese text falls back to Noto Sans TC / system-ui and does not show missing glyph boxes.
- [ ] Image assets load correctly: background, NOA, enemies, attack sprites, and UI art.
- [ ] `window.TST_ASSETS.getSummary()` is available in the browser console.
- [ ] `window.TST_ASSETS.getSummary().counts.error` is absent or `0` during normal loading.

## Game Flow

- [ ] Start Endless from the main menu.
- [ ] Start Tutorial from the main menu.
- [ ] Battle starts with the 3-second countdown.
- [ ] Pause menu opens and closes.
- [ ] Return to main menu from pause.
- [ ] Settings opens from menu and pause.
- [ ] Settings tabs work: General, Controls, Audio, Language.
- [ ] Move Guide / 招式圖鑑 opens and returns correctly.
- [ ] Restart / retry flow works after defeat or victory.

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
- [ ] Combo produces visible combo feedback.
- [ ] B2B produces visible B2B feedback.
- [ ] T-Spin produces visible T-Spin feedback.
- [ ] Perfect Clear produces special feedback and damage.
- [ ] Enemy HP changes after player attacks.
- [ ] Enemy hit reaction is visible.
- [ ] Enemy intent counts down and enemy attack resolves.
- [ ] Player HP / Guard changes after enemy attack.
- [ ] Low player HP state is noticeable and readable.

## Layout Checks

- [ ] 1920x1080 viewport reads clearly.
- [ ] Small desktop window reads clearly.
- [ ] Traditional Chinese UI does not overlap.
- [ ] English UI does not overlap.
- [ ] Board remains the first visual priority.
- [ ] Next 5 preview does not overlap the enemy card.
- [ ] Hold panel does not overlap the player card.
- [ ] Bottom control hints do not cover the board or character.
- [ ] Pause menu text remains inside its panels.
- [ ] Settings / Controls rows stay aligned.

## Asset Fallback

- [ ] Temporarily override or break one image path for local testing.
- [ ] Game does not crash when the image fails to load.
- [ ] Browser console shows one clear warning for the missing image.
- [ ] `window.TST_ASSETS.getSummary()` reports the missing image as `error`.
- [ ] Fallback drawing appears instead of an empty missing character, enemy, or crop.
- [ ] Restore the image path before committing.

## Suggested Local Smoke Commands

```powershell
node --check game.js
git diff --check
git status --short
```

Optional asset summary check in browser console:

```js
window.TST_ASSETS.getSummary()
```
