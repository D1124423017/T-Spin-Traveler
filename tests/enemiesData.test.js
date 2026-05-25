import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies.js";

describe("enemy data", () => {
  it("assigns a battle portrait key to every enemy and avoids runtime facing flips", () => {
    const missingBattleArt = ENEMIES.filter((enemy) => !enemy.battleArt).map((enemy) => enemy.id);
    const runtimeFacingFlips = ENEMIES.filter((enemy) => "artFacing" in enemy).map((enemy) => enemy.id);

    expect(missingBattleArt).toEqual([]);
    expect(runtimeFacingFlips).toEqual([]);
  });

  it("includes the blue slime as a non-boss early enemy", () => {
    const blueSlime = ENEMIES.find((enemy) => enemy.id === "blue_slime");

    expect(ENEMIES[0].id).toBe("blue_slime");
    expect(blueSlime).toMatchObject({
      name: "RIFT BLUE SLIME",
      trait: "GEL WAVE",
      battleArt: "blueSlime",
      garbage: 0,
    });
    expect(blueSlime.hp).toBeLessThanOrEqual(140);
    expect(blueSlime.damage).toBeLessThanOrEqual(8);
  });
});
