import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

describe("music assets", () => {
  it("registers existing wav files with exact filenames", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const registeredAudioPaths = [...assetsSource.matchAll(/registerAudioAsset\([^,]+,\s*"([^"]+\.wav)"/g)]
      .map((match) => match[1]);
    const audioDirectory = path.join(projectRoot, "assets/audio");
    const exactFilenames = new Set(fs.readdirSync(audioDirectory));
    const missingFiles = registeredAudioPaths.filter((assetPath) => {
      const filename = path.basename(assetPath);
      return !exactFilenames.has(filename) || !fs.existsSync(path.join(projectRoot, assetPath));
    });

    expect(registeredAudioPaths).toHaveLength(20);
    expect(missingFiles).toEqual([]);
  });
});
