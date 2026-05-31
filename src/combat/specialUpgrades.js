export const SPECIAL_UPGRADE_FAMILIES = Object.freeze({
  angel: Object.freeze({
    key: "angel",
    tag: "Angel",
    labelKey: "bond.angel",
    color: "#dff7ff",
    ids: Object.freeze([
      "angel_halo_sanctuary",
      "angel_cleansing_prism",
      "angel_perfect_benediction",
    ]),
  }),
  devil: Object.freeze({
    key: "devil",
    tag: "Devil",
    labelKey: "bond.devil",
    color: "#ff8fca",
    ids: Object.freeze([
      "devil_blood_moon_pact",
      "devil_abyss_chain",
      "devil_fallen_crown",
    ]),
  }),
});

const FAMILY_BY_ID = new Map(
  Object.values(SPECIAL_UPGRADE_FAMILIES)
    .flatMap((family) => family.ids.map((id) => [id, family])),
);

export function getSpecialUpgradeFamily(upgradeOrId) {
  const id = typeof upgradeOrId === "string" ? upgradeOrId : upgradeOrId?.id;
  return id ? FAMILY_BY_ID.get(id) || null : null;
}

export function isSpecialUpgradeId(id) {
  return FAMILY_BY_ID.has(id);
}

export function getSpecialBondCounts(acquiredRelics = []) {
  const counts = {
    angel: 0,
    devil: 0,
  };
  const ownedByFamily = {
    angel: new Set(),
    devil: new Set(),
  };
  for (const entry of acquiredRelics || []) {
    const family = getSpecialUpgradeFamily(entry?.id);
    if (!family) continue;
    ownedByFamily[family.key].add(entry.id);
  }
  for (const family of Object.values(SPECIAL_UPGRADE_FAMILIES)) {
    counts[family.key] = Math.min(family.ids.length, ownedByFamily[family.key].size);
  }
  return counts;
}

export function getSpecialBondTier(familyKey, acquiredRelicsOrCounts = []) {
  const counts = Array.isArray(acquiredRelicsOrCounts)
    ? getSpecialBondCounts(acquiredRelicsOrCounts)
    : acquiredRelicsOrCounts || {};
  return Math.max(0, Math.min(3, counts[familyKey] || 0));
}

export function getSpecialBondPreview(upgrade, acquiredRelics = []) {
  const family = getSpecialUpgradeFamily(upgrade);
  if (!family) return null;
  const counts = getSpecialBondCounts(acquiredRelics);
  const before = getSpecialBondTier(family.key, counts);
  const owned = new Set(
    (acquiredRelics || [])
      .filter((entry) => getSpecialUpgradeFamily(entry?.id)?.key === family.key)
      .map((entry) => entry.id),
  );
  const after = Math.min(3, before + (owned.has(upgrade.id) ? 0 : 1));
  return {
    family,
    before,
    after,
    activates: after > before,
    max: family.ids.length,
  };
}
