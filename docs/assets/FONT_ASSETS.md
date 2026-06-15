# TSpin Traveler Display

`TSpinTravelerDisplay.ttf` and `TSpinTravelerDisplay.woff2` are original procedural vector font assets for T-Spin Traveler.

Included glyphs:

- `A-Z`
- `a-z`
- `0-9`
- `.,!?;:()[]+-/`
- `% × < >`

No external font outlines or commercial fonts were used as a base. Chinese UI text should continue to use `Noto Sans TC`, `system-ui`, or `sans-serif` fallback fonts.

## Readable First Rules

This font is a readable geometric display font before it is an alien-themed font.

Skeleton rules:

- Use clear Latin letter skeletons first: each glyph must read as its normal English letter or numeral at HUD size.
- Use a mixed square-round geometric outline, not a pure pixel or LCD construction.
- Keep stroke weight consistent and moderate; counters must stay open.
- Lowercase letters keep their normal identifying features: `a` is a single-storey a, `e` has a crossbar, `n` has a stem and shoulder, `r` has a short shoulder, and `v` is a clear two-stroke form.
- Metrics come before kerning: advance width, side bearings, and visible bounds must make normal words read continuously before special pairs are tuned.

Decoration rules:

- Alien styling is paused for this readable pass.
- `O`, `o`, and `0` may keep subtle geometric personality, but their counters must stay clear and they must not become eye icons.
- `i` and `j` may use a simple node-like dot, but it must not widen spacing.
- A few uppercase diagonals can keep geometric cuts, but lowercase readability takes priority.
- Do not add eyes, runes, UFOs, block holes, or extra ornaments to every glyph.
