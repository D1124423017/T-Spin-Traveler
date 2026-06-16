import { describe, expect, it } from "vitest";
import {
  calculateEquipmentStats,
  getEquipmentLoadoutStats,
  getEquipmentStatBonuses,
  normalizeEquipmentStatBonus,
} from "../src/core/equipmentStats.js";
import { getEquipmentById } from "../src/data/equipment.js";

function progressWith(...ids) {
  const equipped = { head: null, cloak: null, weapon: null };
  for (const id of ids) {
    const item = getEquipmentById(id);
    if (item) equipped[item.slot] = id;
  }
  return {
    ownedEquipment: ids,
    equipped,
  };
}

describe("equipment stats", () => {
  it("normalizes missing legacy stat data to zero", () => {
    expect(normalizeEquipmentStatBonus()).toEqual({
      maxHpBonus: 0,
      attackBonus: 0,
      guardBonus: 0,
    });
    expect(normalizeEquipmentStatBonus({
      maxHpBonus: "bad",
      attackBonus: -4,
    })).toEqual({
      maxHpBonus: 0,
      attackBonus: 0,
      guardBonus: 0,
    });
  });

  it("calculates a single equipped item's bonuses", () => {
    expect(getEquipmentStatBonuses(progressWith("shard-crystal-dagger"))).toEqual({
      maxHpBonus: 2,
      attackBonus: 2,
      guardBonus: 0,
    });
  });

  it("adds bonuses from all three equipped slots", () => {
    const progress = progressWith(
      "royal-crystal-crown",
      "fate-deception-cloak",
      "cheaters-amethyst-sword",
    );

    expect(getEquipmentStatBonuses(progress)).toEqual({
      maxHpBonus: 42,
      attackBonus: 14,
      guardBonus: 14,
    });
  });

  it("adds the new specialized head, cloak, and weapon bonuses", () => {
    expect(getEquipmentStatBonuses(progressWith(
      "timeshift-observer-ring",
      "afterimage-lifeguard-cloak",
      "zero-boundary-lance",
    ))).toEqual({
      maxHpBonus: 32,
      attackBonus: 10,
      guardBonus: 10,
    });
  });

  it("returns unchanged base stats when nothing is equipped", () => {
    expect(calculateEquipmentStats({
      baseStats: { maxHp: 125, attack: 12, guard: 6 },
      equipmentProgress: {},
    })).toEqual({
      baseStats: { maxHp: 125, attack: 12, guard: 6 },
      equipmentBonuses: {
        maxHpBonus: 0,
        attackBonus: 0,
        guardBonus: 0,
      },
      finalStats: { maxHp: 125, attack: 12, guard: 6 },
    });
  });

  it("combines permanent progression and equipment for run-start HP and Guard", () => {
    const stats = getEquipmentLoadoutStats({
      metaUpgrades: {
        hpLevel: 2,
        attackLevel: 5,
        guardLevel: 2,
      },
      equipment: progressWith(
        "royal-crystal-crown",
        "fate-deception-cloak",
        "cheaters-amethyst-sword",
      ),
    });

    expect(stats.baseStats).toEqual({ maxHp: 110, attack: 11, guard: 6 });
    expect(stats.finalStats).toEqual({ maxHp: 152, attack: 25, guard: 20 });
  });
});
