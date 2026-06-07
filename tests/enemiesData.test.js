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

  it("keeps the Egypt mainline roster at five normal enemies and one Pharaoh boss", () => {
    const scarabScout = ENEMIES.find((enemy) => enemy.id === "blue_slime");
    const mummy = ENEMIES.find((enemy) => enemy.id === "slime");
    const priest = ENEMIES.find((enemy) => enemy.id === "mushroom");
    const anubisGuard = ENEMIES.find((enemy) => enemy.id === "beetle");
    const sphinx = ENEMIES.find((enemy) => enemy.id === "vine");
    const pharaoh = ENEMIES.find((enemy) => enemy.id === "king");

    expect(ENEMIES.map((enemy) => enemy.id)).toEqual(["blue_slime", "slime", "mushroom", "beetle", "vine", "king"]);
    expect(scarabScout).toMatchObject({
      name: "RIFT SCARAB SCOUT",
      trait: "SAND-RUNE CARAPACE",
      battleArt: "egyptRiftScarabScout",
      garbage: 0,
      attackSprite: true,
    });
    expect(scarabScout.hp).toBe(128);
    expect(scarabScout.damage).toBe(7);
    expect(mummy).toMatchObject({
      name: "SAND TOMB MUMMY",
      trait: "RUNE BANDAGES",
      battleArt: "sandTombMummy",
      hp: 120,
      damage: 8,
    });
    expect(priest).toMatchObject({
      name: "EGYPTIAN PRIEST",
      trait: "SOLAR HEX",
      battleArt: "egyptianPriest",
      hp: 110,
      damage: 6,
    });
    expect(anubisGuard).toMatchObject({
      name: "ANUBIS GUARD",
      trait: "OBELISK GUARD",
      battleArt: "anubisGuard",
      hp: 210,
      damage: 10,
    });
    expect(sphinx).toMatchObject({
      name: "SPHINX STONE GUARDIAN",
      trait: "STONE SENTINEL",
      battleArt: "sphinxStoneGuardian",
      hp: 165,
      damage: 9,
    });
    expect(pharaoh).toMatchObject({
      name: "PHARAOH KING",
      trait: "BOSS: ROYAL PRESSURE",
      battleArt: "pharaohKing",
      hp: 360,
      damage: 14,
      attackSprite: false,
    });
    expect(ENEMIES.filter((enemy) => enemy.id !== "king").every((enemy) => enemy.attackSprite)).toBe(true);
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
      "egyptScarabScout",
      "sandTombMummyPriest",
      "anubisRiftGuard",
      "mayaStoneBeastScout",
      "mayaEclipsePriest",
      "mayaFeatheredSerpentGuard",
      "atlantisCrystalJellyfishScout",
      "atlantisTidalShellGuard",
      "atlantisCrystalTempleSentinel",
    ]);
    const removedReferences = ENEMIES
      .filter((enemy) => removedBattleArtKeys.has(enemy.battleArt))
      .map((enemy) => `${enemy.id}:${enemy.battleArt}`);

    expect(removedReferences).toEqual([]);
  });

  it("wires the active Egypt battle portraits without old civilization battle art", () => {
    const expected = {
      blue_slime: { battleArt: "egyptRiftScarabScout", hp: 128, damage: 7, countdown: 6, garbage: 0 },
      slime: { battleArt: "sandTombMummy", hp: 120, damage: 8, countdown: 7, garbage: 0 },
      mushroom: { battleArt: "egyptianPriest", hp: 110, damage: 6, countdown: 5, garbage: 0 },
      beetle: { battleArt: "anubisGuard", hp: 210, damage: 10, countdown: 8, garbage: 1 },
      vine: { battleArt: "sphinxStoneGuardian", hp: 165, damage: 9, countdown: 7, garbage: 1 },
      king: { battleArt: "pharaohKing", hp: 360, damage: 14, countdown: 7, garbage: 1 },
    };

    for (const [id, expectation] of Object.entries(expected)) {
      expect(ENEMIES.find((enemy) => enemy.id === id)).toMatchObject(expectation);
    }
    expect(ENEMIES).toHaveLength(6);
  });

  it("keeps visible world copy on the ancient rift direction", () => {
    expect(translations.zh.navigationCore).toBe("導航核心：古文明裂隙");
    expect(translations.en.navigationCore).toBe("Navigation Core: Ancient Rift");
    expect(translations.zh.messageVictory).toContain("古文明裂隙航道");
    expect(translations.en.messageVictory).toContain("Ancient Rift Route");
    expect(translations.zh.floaterRootPressure).toBe("石像壓迫");
    expect(translations.en.floaterRootPressure).toBe("STONE GUARDIAN PRESSURE");
    expect(translations.zh.floaterMistHolesDrift).toBe("星霧洞漂移");
    expect(translations.en.floaterMistHolesDrift).toBe("STAR-MIST HOLES DRIFT");
    expect(translations.zh.floaterVineBlocksRemoved).toBe("石像障礙清除");
    expect(translations.en.floaterVineBlocksRemoved).toBe("STONE BLOCKS REMOVED");

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
