# Asset Workflow

## Asset States

1. **Temporary review**: uncertain alternatives stay in ignored `tmp/` or `renders/`.
2. **Future**: approved content for an unreleased region goes to `assets/future/regions/<region>/`.
3. **Runtime**: shipped assets go to `assets/images/`, `assets/audio/`, or `assets/fonts/`.

Do not place temporary exports, generator intermediates, or smoke screenshots in
runtime asset folders.

## Promote An Asset

1. Confirm the file is the approved version and its case-sensitive filename is final.
2. Move it to the correct runtime category.
3. Register it in `src/data/assets.js`.
4. Update the relevant renderer or data module without adding asset tables to `game.js`.
5. Add it to `src/debug/spriteSheetCatalog.js` when frame inspection is useful.
6. Update focused tests and increment `ASSET_VERSION`.
7. Run the required checks and verify browser network/runtime diagnostics.

## Region Layout

Active region art:

```text
assets/images/regions/<region>/
  backgrounds/
  enemies/
```

Future region art:

```text
assets/future/regions/<region>/
  backgrounds/
  enemies/
    attacks/
    portraits/
```

Keep generic shared VFX outside region folders only when more than one region
actually uses them.

## Retirement

- Remove replaced files only after explicit human approval.
- Temporary candidates must not be registered or loaded by runtime code.
- Before deleting, search the full repository and verify registry, preview, test,
  documentation, and generated-path references.
