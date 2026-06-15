import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

describe("music assets", () => {
  it("registers the temporary global rotation", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const registeredAudioPaths = [...assetsSource.matchAll(/registerAudioAsset\([^,]+,\s*"([^"]+\.wav)"/g)]
      .map((match) => match[1])
      .filter((assetPath) => assetPath.startsWith("assets/audio/bgm/"));
    const temporaryGlobalRotation = [
      "assets/audio/bgm/bgm_menu_01.wav",
      "assets/audio/bgm/bgm_menu_02.wav",
      "assets/audio/bgm/bgm_menu_03.wav",
      "assets/audio/bgm/bgm_menu_04.wav",
      "assets/audio/bgm/bgm_menu_05.wav",
      "assets/audio/bgm/bgm_menu_06.wav",
    ];
    const missingFiles = registeredAudioPaths.filter((assetPath) => !fs.existsSync(path.join(projectRoot, assetPath)));

    expect(registeredAudioPaths).toEqual(temporaryGlobalRotation);
    expect(missingFiles).toEqual([]);
  });
});
