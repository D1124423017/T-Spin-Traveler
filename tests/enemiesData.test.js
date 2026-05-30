import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies.js";
import { translations } from "../src/data/i18n.js";

describe("enemy data", () => {
  it("assigns a battle portrait key to every enemy and avoids runtime facing flips", () => {
    const missingBattleArt = ENEMIES.filter((enemy) => !enemy.battleArt).map((enemy) => enemy.id);
    const runtimeFacingFlips = ENEMIES.filter((enemy) => "artFacing" in enemy).map((enemy) => enemy.id);

    expect(missingBattleArt).toEqual([]);
    expect(runtimeFacingFlips).toEqual([]);
  });

  it("keeps the Egyptian rift slice on early enemy slots without changing values", () => {
    const scarabScout = ENEMIES.find((enemy) => enemy.id === "blue_slime");
    const mummyPriest = ENEMIES.find((enemy) => enemy.id === "slime");
    const anubisGuard = ENEMIES.find((enemy) => enemy.id === "beetle");

    expect(ENEMIES[0].id).toBe("blue_slime");
    expect(scarabScout).toMatchObject({
      name: "SCARAB SCOUT",
      trait: "RIFT CARAPACE",
      battleArt: "egyptScarabScout",
      garbage: 0,
    });
    expect(scarabScout.hp).toBe(128);
    expect(scarabScout.damage).toBe(7);
    expect(mummyPriest).toMatchObject({
      name: "SAND TOMB MUMMY PRIEST",
      trait: "STAR TOMB HEX",
      battleArt: "sandTombMummyPriest",
      hp: 120,
      damage: 8,
    });
    expect(anubisGuard).toMatchObject({
      name: "ANUBIS RIFT GUARD",
      trait: "OBELISK GUARD",
      battleArt: "anubisRiftGuard",
      hp: 210,
      damage: 10,
    });
  });

  it("does not reference removed forest battle portrait keys", () => {
    const removedBattleArtKeys = new Set([
      "slime",
      "blueSlime",
      "vine",
      "mushroom",
      "beetle",
      "mist",
      "thorn",
      "wisp",
      "sentinel",
      "king",
    ]);
    const removedReferences = ENEMIES
      .filter((enemy) => removedBattleArtKeys.has(enemy.battleArt))
      .map((enemy) => `${enemy.id}:${enemy.battleArt}`);

    expect(removedReferences).toEqual([]);
  });

  it("wires ancient civilization battle portraits without changing enemy values", () => {
    const expected = {
      blue_slime: { battleArt: "egyptScarabScout", hp: 128, damage: 7, countdown: 6, garbage: 0 },
      slime: { battleArt: "sandTombMummyPriest", hp: 120, damage: 8, countdown: 7, garbage: 0 },
      vine: { battleArt: "mayaStoneBeastScout", hp: 150, damage: 7, countdown: 7, garbage: 1 },
      mushroom: { battleArt: "mayaEclipsePriest", hp: 110, damage: 6, countdown: 5, garbage: 0 },
      beetle: { battleArt: "anubisRiftGuard", hp: 210, damage: 10, countdown: 8, garbage: 1 },
      mist: { battleArt: "atlantisCrystalJellyfishScout", hp: 145, damage: 8, countdown: 6, garbage: 1 },
      thorn: { battleArt: "atlantisTidalShellGuard", hp: 165, damage: 9, countdown: 6, garbage: 1 },
      wisp: { battleArt: "atlantisCrystalJellyfishScout", hp: 130, damage: 8, countdown: 5, garbage: 0 },
      sentinel: { battleArt: "mayaFeatheredSerpentGuard", hp: 245, damage: 11, countdown: 8, garbage: 1 },
      king: { battleArt: "atlantisCrystalTempleSentinel", hp: 360, damage: 14, countdown: 7, garbage: 1 },
    };

    for (const [id, expectation] of Object.entries(expected)) {
      expect(ENEMIES.find((enemy) => enemy.id === id)).toMatchObject(expectation);
    }
  });

  it("keeps visible world copy on the ancient rift direction", () => {
    expect(translations.zh.navigationCore).toBe("導航核心：古文明裂隙");
    expect(translations.en.navigationCore).toBe("Navigation Core: Ancient Rift");
    expect(translations.zh.messageVictory).toContain("古文明裂隙航道");
    expect(translations.en.messageVictory).toContain("Ancient Rift Route");
    expect(translations.zh.floaterRootPressure).toBe("裂隙壓迫");
    expect(translations.en.floaterRootPressure).toBe("RIFT PRESSURE");
    expect(translations.zh.floaterMistHolesDrift).toBe("星霧洞漂移");
    expect(translations.en.floaterMistHolesDrift).toBe("STAR-MIST HOLES DRIFT");
    expect(translations.zh.floaterVineBlocksRemoved).toBe("遺跡障礙清除");
    expect(translations.en.floaterVineBlocksRemoved).toBe("RELIC BLOCKS REMOVED");

    const visibleCopyLines = [
      translations.zh.menuHeroClick2,
      translations.zh.navigationCore,
      translations.zh.messageVictory,
      translations.zh.floaterRootPressure,
      translations.zh.floaterMistHolesDrift,
      translations.zh.floaterVineBlocksRemoved,
      translations.en.menuHeroClick2,
      translations.en.navigationCore,
      translations.en.messageVictory,
      translations.en.floaterRootPressure,
      translations.en.floaterMistHolesDrift,
      translations.en.floaterVineBlocksRemoved,
    ];

    expect(visibleCopyLines.join("\n")).not.toMatch(/Forest Border|forest border|森林邊境|藤蔓壓迫|藤蔓障礙清除/);
    expect(visibleCopyLines).not.toContain("ROOT PRESSURE");
    expect(visibleCopyLines).not.toContain("MIST HOLES DRIFT");
    expect(visibleCopyLines).not.toContain("VINE BLOCKS REMOVED");
    expect(visibleCopyLines).not.toContain("霧洞漂移");
  });
});
