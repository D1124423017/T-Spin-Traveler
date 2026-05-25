import {
  BUILD_FAMILY,
  BUILD_TAGS,
  TRAIT_DEFS,
  UPGRADES,
} from "../data/upgrades.js";
import {
  getTraitFullCount,
  getTraitProgress as getTraitProgressCore,
  getTraitStage,
} from "./upgradeEffects.js";

const identityTranslate = (key) => key;

export function getUpgradeById(id, upgrades = UPGRADES) {
  return upgrades.find((upgrade) => upgrade.id === id);
}

export function getUpgradeTags(upgrade) {
  if (Array.isArray(upgrade?.tags) && upgrade.tags.length) return upgrade.tags;
  return ["Burst"];
}

export function getBuildTagMeta(tag, buildTags = BUILD_TAGS) {
  return buildTags[tag] || buildTags.Burst;
}

export function buildTagLabel(tag, translate = identityTranslate, buildTags = BUILD_TAGS) {
  const meta = getBuildTagMeta(tag, buildTags);
  const label = translate(meta.labelKey);
  return label === meta.labelKey ? tag : label;
}

export function getUpgradeFamily(upgrade, buildTags = BUILD_TAGS, buildFamily = BUILD_FAMILY) {
  const primaryTag = getUpgradeTags(upgrade)[0];
  const meta = getBuildTagMeta(primaryTag, buildTags);
  return buildFamily[meta.family] || buildFamily.burst;
}

export function getAcquiredRelicGroups(acquiredRelics = [], options = {}) {
  const {
    upgrades = UPGRADES,
    buildTags = BUILD_TAGS,
    buildFamily = BUILD_FAMILY,
  } = options;
  const map = new Map();
  for (const entry of acquiredRelics || []) {
    if (!entry?.id) continue;
    const upgrade = getUpgradeById(entry.id, upgrades);
    if (!upgrade) continue;
    const group = map.get(entry.id);
    if (group) {
      group.count += 1;
      continue;
    }
    map.set(entry.id, {
      id: entry.id,
      upgrade,
      count: 1,
      rarity: entry.rarity || upgrade.rarity,
      tags: getUpgradeTags(upgrade),
      family: getUpgradeFamily(upgrade, buildTags, buildFamily),
    });
  }
  return [...map.values()];
}

export function getCurrentBuildFamilyStats(groups = [], options = {}) {
  const {
    translate = identityTranslate,
    buildTags = BUILD_TAGS,
  } = options;
  const stats = new Map();
  for (const group of groups) {
    for (const tag of group.tags) {
      const meta = getBuildTagMeta(tag, buildTags);
      const current = stats.get(tag) || { tag, meta, count: 0 };
      current.count += group.count;
      stats.set(tag, current);
    }
  }
  return [...stats.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ tag, meta, count }) => ({
      label: buildTagLabel(tag, translate, buildTags),
      color: meta.color,
      count,
    }));
}

export function getTraitCount(tag, groups = []) {
  let count = 0;
  for (const group of groups) {
    if (group.tags.includes(tag)) count += group.count;
  }
  return count;
}

export function getTraitProgress(tag, countOrGroups = 0) {
  const count = Array.isArray(countOrGroups) ? getTraitCount(tag, countOrGroups) : countOrGroups;
  return getTraitProgressCore(count, tag);
}

export function getTraitNextThreshold(tag, countOrGroups = 0) {
  return getTraitProgress(tag, countOrGroups).nextThreshold;
}

export function getTraitBonus(tag, values, groups = []) {
  const stage = getTraitStage(tag, getTraitCount(tag, groups));
  if (stage <= 0) return 0;
  return values[Math.min(stage, values.length) - 1] || 0;
}

export function getTraitEntries(groups = [], options = {}) {
  const {
    translate = identityTranslate,
    buildTags = BUILD_TAGS,
    traitDefs = TRAIT_DEFS,
  } = options;
  const stats = new Map();
  for (const group of groups) {
    for (const tag of group.tags) {
      const def = traitDefs[tag];
      if (!def) continue;
      const meta = getBuildTagMeta(tag, buildTags);
      const entry = stats.get(tag) || { tag, def, meta, count: 0 };
      entry.count += group.count;
      stats.set(tag, entry);
    }
  }
  return [...stats.values()]
    .map((entry) => {
      const progress = getTraitProgress(entry.tag, entry.count);
      return {
        ...entry,
        stage: progress.stage,
        nextThreshold: progress.nextThreshold,
        fullCount: progress.fullCount,
        isFull: progress.isFull,
        overcap: progress.overcap,
        active: progress.stage > 0,
        label: buildTagLabel(entry.tag, translate, buildTags),
        color: entry.meta.color,
      };
    })
    .sort((a, b) => (b.stage - a.stage) || (b.count - a.count) || a.label.localeCompare(b.label));
}

export function getTraitEffectText(entry, translate = identityTranslate) {
  if (!entry || entry.stage <= 0) return translate("traitEffectNone");
  const key = entry.def.effectKeys[Math.min(entry.stage, entry.def.effectKeys.length) - 1];
  return key ? translate(key) : translate("traitEffectNone");
}

export function getTraitChangeHintsForUpgrade(upgrade, groups = [], options = {}) {
  const {
    translate = identityTranslate,
    buildTags = BUILD_TAGS,
    traitDefs = TRAIT_DEFS,
  } = options;
  const tags = getUpgradeTags(upgrade);
  const hints = [];
  for (const tag of tags) {
    const def = traitDefs[tag];
    if (!def) continue;
    const before = getTraitCount(tag, groups);
    const after = before + 1;
    const beforeStage = getTraitStage(tag, before);
    const afterStage = getTraitStage(tag, after);
    if (afterStage > beforeStage) {
      const next = beforeStage === 0
        ? def.breakpoints[0]
        : getTraitNextThreshold(tag, after) || def.breakpoints[Math.min(afterStage - 1, def.breakpoints.length - 1)];
      hints.push({
        tag,
        label: buildTagLabel(tag, translate, buildTags),
        color: getBuildTagMeta(tag, buildTags).color,
        type: beforeStage === 0 ? "activate" : "upgrade",
        count: after,
        next,
        stage: afterStage,
        priority: beforeStage === 0 ? 0 : 1,
      });
      continue;
    }
    const next = getTraitNextThreshold(tag, before);
    if (!next) {
      const progress = getTraitProgress(tag, after);
      if (progress.isFull && progress.overcap > 0) {
        hints.push({
          tag,
          label: buildTagLabel(tag, translate, buildTags),
          color: getBuildTagMeta(tag, buildTags).color,
          type: "overcap",
          count: after,
          next: progress.fullCount,
          overcap: progress.overcap,
          stage: afterStage,
          priority: 1,
        });
      }
      continue;
    }
    const remaining = next - after;
    if (remaining <= 0) continue;
    hints.push({
      tag,
      label: buildTagLabel(tag, translate, buildTags),
      color: getBuildTagMeta(tag, buildTags).color,
      type: "progress",
      count: after,
      next,
      remaining,
      stage: beforeStage,
      priority: 2,
    });
  }
  return hints.sort((a, b) => (a.priority - b.priority) || ((a.remaining ?? 0) - (b.remaining ?? 0)) || a.label.localeCompare(b.label));
}

export { getTraitFullCount, getTraitStage };
