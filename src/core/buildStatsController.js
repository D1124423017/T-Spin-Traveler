import {
  getAcquiredRelicGroups as getAcquiredRelicGroupsForStats,
  getCurrentBuildFamilyStats as getCurrentBuildFamilyStatsForGroups,
  getTraitBonus as getTraitBonusForGroups,
  getTraitChangeHintsForUpgrade as getTraitChangeHintsForUpgradeForGroups,
  getTraitCount as getTraitCountForGroups,
  getTraitEffectText as getTraitEffectTextForEntry,
  getTraitEntries as getTraitEntriesForGroups,
  getTraitNextThreshold as getTraitNextThresholdForGroups,
  getTraitProgress as getTraitProgressForGroups,
} from "../combat/buildStats.js";
import {
  getTraitFullCount as getTraitFullCountFromDefs,
  getTraitStage as getTraitStageFromDefs,
} from "../combat/upgradeEffects.js";

export function createBuildStatsController({
  state,
  translate,
  format,
} = {}) {
  function getAcquiredRelicGroups() {
    if (!Array.isArray(state.acquiredRelics)) state.acquiredRelics = [];
    return getAcquiredRelicGroupsForStats(state.acquiredRelics);
  }

  function getCurrentBuildFamilyStats(groups = getAcquiredRelicGroups()) {
    return getCurrentBuildFamilyStatsForGroups(groups, { translate });
  }

  function getTraitEntries(groups = getAcquiredRelicGroups()) {
    return getTraitEntriesForGroups(groups, { translate });
  }

  function getTraitCount(tag, groups = getAcquiredRelicGroups()) {
    return getTraitCountForGroups(tag, groups);
  }

  function getTraitStage(tag, count = getTraitCount(tag)) {
    return getTraitStageFromDefs(tag, count);
  }

  function getTraitNextThreshold(tag, count = getTraitCount(tag)) {
    return getTraitNextThresholdForGroups(tag, count);
  }

  function getTraitFullCount(tag) {
    return getTraitFullCountFromDefs(tag);
  }

  function getTraitProgress(tag, count = getTraitCount(tag)) {
    return getTraitProgressForGroups(tag, count);
  }

  function getTraitBonus(tag, values) {
    return getTraitBonusForGroups(tag, values, getAcquiredRelicGroups());
  }

  function getTraitEffectText(entry) {
    return getTraitEffectTextForEntry(entry, translate);
  }

  function getTraitChangeHintsForUpgrade(upgrade) {
    return getTraitChangeHintsForUpgradeForGroups(
      upgrade,
      getAcquiredRelicGroups(),
      { translate },
    );
  }

  function getCurrentBuildDirectionText(stats) {
    if (!stats.length) return translate("currentBuildNoDirection");
    const families = stats.slice(0, 2).map((stat) => stat.label).join(" / ");
    return format("currentBuildDirection", { families });
  }

  return {
    getAcquiredRelicGroups,
    getCurrentBuildDirectionText,
    getCurrentBuildFamilyStats,
    getTraitBonus,
    getTraitChangeHintsForUpgrade,
    getTraitCount,
    getTraitEffectText,
    getTraitEntries,
    getTraitFullCount,
    getTraitNextThreshold,
    getTraitProgress,
    getTraitStage,
  };
}
