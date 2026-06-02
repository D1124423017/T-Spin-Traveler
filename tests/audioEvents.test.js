import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  BGM_PLAYLISTS,
  FILE_SFX_EVENTS,
  SPIN_READY_COOLDOWN_MS,
  getFileSfxAssetKeys,
  pickFileSfxAssetKey,
} from "../src/audio/audioEvents.js";

const projectRoot = process.cwd();

function getRegisteredAudioKeys() {
  const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
  return new Set([...assetsSource.matchAll(/(\w+): registerAudioAsset\(/g)].map((match) => match[1]));
}

describe("audio event maps", () => {
  it("points every bgm playlist key to a registered audio asset", () => {
    const registered = getRegisteredAudioKeys();
    const missing = Object.values(BGM_PLAYLISTS).flat().filter((key) => !registered.has(key));
    expect(missing).toEqual([]);
  });

  it("points every file sfx event key to a registered audio asset", () => {
    const registered = getRegisteredAudioKeys();
    const missing = Object.values(FILE_SFX_EVENTS).flat().filter((key) => !registered.has(key));
    expect(missing).toEqual([]);
  });

  it("keeps spin ready distinct from T-Spin success with a cooldown", () => {
    expect(getFileSfxAssetKeys("spinReady")).toEqual(["sfxSpinReady01", "sfxSpinReady02"]);
    expect(getFileSfxAssetKeys("tspin")).toEqual(["sfxTspinSuccess"]);
    expect(SPIN_READY_COOLDOWN_MS).toBeGreaterThanOrEqual(500);
  });

  it("rotates variations deterministically per event name", () => {
    const state = new Map();
    expect(pickFileSfxAssetKey("move", state)).toBe("sfxBlockMove01");
    expect(pickFileSfxAssetKey("move", state)).toBe("sfxBlockMove02");
    expect(pickFileSfxAssetKey("move", state)).toBe("sfxBlockMove03");
    expect(pickFileSfxAssetKey("move", state)).toBe("sfxBlockMove01");
  });
});
