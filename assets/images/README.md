Project image asset notes:

- Runtime character and attack animations use 16-frame sprite sheets.
- NOA's canonical character proportion reference is `clean/ET_Character_fullbody_alpha.png`.
- Future NOA spritesheets should keep that large-hood, large-head, short-body proportion family.
- Current hero combat sheets are 4 x 4 with 896 x 512 frames, read left-to-right and top-to-bottom.
- Current hero combat sheet filenames are `hero_melee_combat_16_spritesheet_alpha.png`, `hero_ranged_combat_16_spritesheet_alpha.png`, and `hero_ultimate_16_spritesheet_alpha.png`.
- Current menu idle sheets are 4 x 4, read left-to-right and top-to-bottom.
- Current enemy attack sheets are 4 x 4, read left-to-right and top-to-bottom.
- `ET_Character_fullbody_alpha.png` is also the canonical static presentation art for the main menu and equipment preview.
- `noa_feedback_thanks_alpha.png` is the feedback/settings presentation art.

If a future animation asset is added, keep it at 16 frames and update the animation config in `game.js`.
