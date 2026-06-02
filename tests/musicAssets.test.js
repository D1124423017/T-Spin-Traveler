import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

describe("music assets", () => {
  it("registers the formal bgm loops with exact filenames", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const registeredAudioPaths = [...assetsSource.matchAll(/registerAudioAsset\([^,]+,\s*"([^"]+\.wav)"/g)]
      .map((match) => match[1])
      .filter((assetPath) => assetPath.startsWith("assets/audio/bgm/"));
    const expected = [
      "assets/audio/bgm/bgm_menu_ancient_rift_loop.wav",
      "assets/audio/bgm/bgm_battle_forest_ruins_loop.wav",
      "assets/audio/bgm/bgm_battle_deep_ruins_loop.wav",
      "assets/audio/bgm/bgm_battle_rift_pressure_loop.wav",
      "assets/audio/bgm/bgm_boss_ancient_rift_colossus_loop.wav",
      "assets/audio/bgm/bgm_upgrade_relic_cards_loop.wav",
    ];
    const missingFiles = registeredAudioPaths.filter((assetPath) => !fs.existsSync(path.join(projectRoot, assetPath)));

    expect(registeredAudioPaths).toEqual(expected);
    expect(missingFiles).toEqual([]);
  });
});
