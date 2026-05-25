const TRAIT_HUD_LABEL_KEYS = {
  Spin: "traitHud.spin",
  Combo: "traitHud.combo",
  Defense: "traitHud.defense",
  Burst: "traitHud.burst",
  Survival: "traitHud.survival",
  Garbage: "traitHud.garbage",
  Utility: "traitHud.utility",
  Perfect: "traitHud.perfect",
  B2B: "traitHud.b2b",
  "Boss Killer": "traitHud.bossKiller",
};

const identityTranslate = (key) => key;

export function getTraitProgressStatusText(trait, { format, getFullCount }) {
  if (trait.overcap > 0) return format("traitOvercapCount", { count: trait.overcap });
  if (trait.isFull) return format("traitFull");
  const fullCount = trait.fullCount || getFullCount(trait.tag);
  return `${trait.count}/${fullCount}`;
}

export function getTraitDetailTitle(trait, options) {
  const fullCount = trait.fullCount || options.getFullCount(trait.tag);
  const countText = fullCount ? `${trait.count}/${fullCount}` : `${trait.count}`;
  const statusText = getTraitProgressStatusText(trait, options);
  return trait.isFull ? `${trait.label} ${countText} ${statusText}` : `${trait.label} ${countText}`;
}

export function getTraitHudLabel(trait, { translate = identityTranslate } = {}) {
  const key = TRAIT_HUD_LABEL_KEYS[trait.tag];
  if (!key) return trait.label;
  const label = translate(key);
  return label === key ? trait.label : label;
}
