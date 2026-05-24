import { describe, expect, it } from "vitest";
import { SUPPORTED_UPGRADE_EFFECT_TYPES } from "../src/combat/upgradeEffects.js";
import { BUILD_TAGS, RARITY, UPGRADES } from "../src/data/upgrades.js";
import { translations } from "../src/data/i18n.js";

const REQUIRED_UPGRADE_FIELDS = [
  "id",
  "name",
  "rarity",
  "tags",
  "stackRule",
  "shortTextKey",
  "textKey",
  "effects",
];

const EFFECT_FIELD_RULES = {
  addUpgradeValue: ["key", "value"],
  addStateValue: ["key", "value"],
  addGuard: ["value"],
  increasePlayerMaxHp: ["value"],
  setUpgradeFlag: ["key", "value"],
  setUpgradeMin: ["key", "value"],
};

describe("upgrade data consistency", () => {
  it("defines the required metadata fields for every upgrade", () => {
    const missingFields = [];
    for (const upgrade of UPGRADES) {
      for (const field of REQUIRED_UPGRADE_FIELDS) {
        if (!(field in upgrade)) missingFields.push(`${upgrade.id || "<missing id>"}.${field}`);
      }
      if (!Array.isArray(upgrade.tags) || upgrade.tags.length === 0) missingFields.push(`${upgrade.id}.tags`);
      if (!Array.isArray(upgrade.effects) || upgrade.effects.length === 0) missingFields.push(`${upgrade.id}.effects`);
    }

    expect(missingFields).toEqual([]);
  });

  it("uses unique ids", () => {
    const ids = UPGRADES.map((upgrade) => upgrade.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses defined rarity tiers and build tags", () => {
    const invalidRefs = [];
    for (const upgrade of UPGRADES) {
      if (!RARITY[upgrade.rarity]) invalidRefs.push(`${upgrade.id}.rarity:${upgrade.rarity}`);
      for (const tag of upgrade.tags) {
        if (!BUILD_TAGS[tag]) invalidRefs.push(`${upgrade.id}.tag:${tag}`);
      }
    }

    expect(invalidRefs).toEqual([]);
  });

  it("has localized text keys for descriptions and short descriptions", () => {
    const missingKeys = [];
    for (const upgrade of UPGRADES) {
      for (const language of ["zh", "en"]) {
        if (!translations[language][upgrade.textKey]) missingKeys.push(`${upgrade.id}.${language}.${upgrade.textKey}`);
        if (!translations[language][upgrade.shortTextKey]) missingKeys.push(`${upgrade.id}.${language}.${upgrade.shortTextKey}`);
      }
    }

    expect(missingKeys).toEqual([]);
  });

  it("uses supported effect descriptor types", () => {
    const supportedTypes = new Set(SUPPORTED_UPGRADE_EFFECT_TYPES);
    const unsupportedEffects = UPGRADES.flatMap((upgrade) =>
      upgrade.effects
        .filter((effect) => !supportedTypes.has(effect.type))
        .map((effect) => `${upgrade.id}:${effect.type}`),
    );

    expect(unsupportedEffects).toEqual([]);
  });

  it("defines required fields for every effect descriptor", () => {
    const invalidEffects = [];
    for (const upgrade of UPGRADES) {
      for (const effect of upgrade.effects) {
        const requiredFields = EFFECT_FIELD_RULES[effect.type] || [];
        for (const field of requiredFields) {
          if (!(field in effect)) invalidEffects.push(`${upgrade.id}:${effect.type}.${field}`);
        }
        if ("key" in effect && typeof effect.key !== "string") invalidEffects.push(`${upgrade.id}:${effect.type}.key`);
        if ("value" in effect && typeof effect.value !== "number") invalidEffects.push(`${upgrade.id}:${effect.type}.value`);
        if ("healValue" in effect && typeof effect.healValue !== "number") {
          invalidEffects.push(`${upgrade.id}:${effect.type}.healValue`);
        }
      }
    }

    expect(invalidEffects).toEqual([]);
  });

  it("uses flag-setting effects for legendary unique upgrades", () => {
    const invalidUniqueEffects = UPGRADES.filter(
      (upgrade) => upgrade.rarity === "legendary" || upgrade.stackRule === "unique",
    ).flatMap((upgrade) =>
      upgrade.effects
        .filter((effect) => effect.type !== "setUpgradeFlag")
        .map((effect) => `${upgrade.id}:${effect.type}`),
    );

    expect(invalidUniqueEffects).toEqual([]);
  });
});
