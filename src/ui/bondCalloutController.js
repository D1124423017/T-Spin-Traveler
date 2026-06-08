export function createBondCalloutController({
  translate,
  format,
  showBondCallout,
} = {}) {
  function showSpecialBondUpgradeCallout(preview) {
    if (!preview?.activates) return;
    showBondCallout({
      family: preview.family.key,
      text: format("bondHintUpgrade", {
        bond: translate(preview.family.labelKey),
        before: preview.before,
        after: preview.after,
      }),
      detail: translate("bondCalloutActivated"),
      durationMs: 1450,
    });
  }

  function showSpecialBondEffectCallout(family, text) {
    if (!text) return;
    showBondCallout({
      family,
      text,
      detail: translate("bondCalloutEffect"),
      durationMs: 1250,
    });
  }

  return {
    showSpecialBondEffectCallout,
    showSpecialBondUpgradeCallout,
  };
}
