export function formatDamageSources(damageSources = {}, { translate = identityTranslate } = {}) {
  const labels = {
    base: translate("damageBase"),
    spin: "Spin",
    combo: "Combo",
    b2b: "B2B",
    perfect: "Perfect",
    weakness: translate("enemyInfoWeakness"),
    upgrade: translate("summaryUpgradeSource"),
  };
  const top = Object.entries(damageSources)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  if (!top.length) return "-";
  return top.map(([key, value]) => `${labels[key] || key} ${value}`).join(" / ");
}

export function formatMetaUpgradeEffect(def, level, { format = identityFormat } = {}) {
  const value = Math.max(0, level) * def.valuePerLevel;
  if (def.id === "hp") return format("metaUpgradeHpEffect", { value });
  if (def.id === "attack") return format("metaUpgradeAttackEffect", { value });
  if (def.id === "guard") return format("metaUpgradeGuardEffect", { value });
  return `+${value}`;
}

export function formatControlKey(key) {
  const map = {
    arrowleft: "←",
    arrowright: "→",
    arrowdown: "↓",
    arrowup: "↑",
    shift: "SHIFT",
    enter: "ENTER",
    escape: "ESC",
    control: "CTRL",
    alt: "ALT",
    tab: "TAB",
    backspace: "BACKSPACE",
  };
  if (key === " ") return "SPACE";
  if (map[key]) return map[key];
  if (key.length === 1) return key.toUpperCase();
  return key.toUpperCase();
}

function identityTranslate(key) {
  return key;
}

function identityFormat(key, values = {}) {
  const valueText = Object.entries(values)
    .map(([name, value]) => `${name}:${value}`)
    .join(",");
  return valueText ? `${key}(${valueText})` : key;
}
