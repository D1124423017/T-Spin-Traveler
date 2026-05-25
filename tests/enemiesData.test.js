import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies.js";

describe("enemy data", () => {
  it("assigns a battle portrait key to every enemy and avoids runtime facing flips", () => {
    const missingBattleArt = ENEMIES.filter((enemy) => !enemy.battleArt).map((enemy) => enemy.id);
    const runtimeFacingFlips = ENEMIES.filter((enemy) => "artFacing" in enemy).map((enemy) => enemy.id);

    expect(missingBattleArt).toEqual([]);
    expect(runtimeFacingFlips).toEqual([]);
  });
});
