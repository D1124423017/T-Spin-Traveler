import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies.js";

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
});
