Project image asset notes:

- Runtime character and attack animations use 16-frame sprite sheets.
- Current hero attack sheets are 4 x 4, read left-to-right and top-to-bottom.
- Current menu idle sheets are 4 x 4, read left-to-right and top-to-bottom.
- Current enemy attack sheets are 4 x 4, read left-to-right and top-to-bottom.
- `hero_perfect_clear_ultimate_alpha.png` is 8 x 2, still 16 frames.
- `Enemy01_alpha.png` and `Enemy02_alpha.png` are enemy concept crop sheets, not frame animations.
- `ET_Character_alpha.png`, `noa_battle_idle.png`, `noa_menu_showcase.png`, and `noa_feedback_bow.png` are fallback or presentation art.

If a future animation asset is added, keep it at 16 frames and update the animation config in `game.js`.
