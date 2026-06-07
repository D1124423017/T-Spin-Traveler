import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SPRITE_SHEET_CATALOG } from "../src/debug/spriteSheetCatalog.js";

const projectRoot = process.cwd();

function readPngInfo(relativePath) {
  const buffer = fs.readFileSync(path.join(projectRoot, relativePath));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer.readUInt8(25),
  };
}

describe("sprite sheet test catalog", () => {
  it("points every test button at an existing alpha PNG with a 4 x 4 grid", () => {
    expect(SPRITE_SHEET_CATALOG.length).toBeGreaterThan(0);

    for (const sheet of SPRITE_SHEET_CATALOG) {
      const fullPath = path.join(projectRoot, sheet.path);
      expect(fs.existsSync(fullPath), `${sheet.id} should point to an existing file`).toBe(true);

      const info = readPngInfo(sheet.path);
      expect(info.colorType, `${sheet.id} should keep alpha transparency`).toBe(6);
      expect(info.width % sheet.columns, `${sheet.id} width should divide by columns`).toBe(0);
      expect(info.height % sheet.rows, `${sheet.id} height should divide by rows`).toBe(0);
      expect(sheet.columns * sheet.rows, `${sheet.id} should be 16 frames`).toBe(16);
      expect(sheet.frames).toEqual(Array.from({ length: 16 }, (_, index) => index));
    }
  });

  it("uses stable ids and positive timing for every test sheet", () => {
    const ids = new Set();

    for (const sheet of SPRITE_SHEET_CATALOG) {
      expect(ids.has(sheet.id), `${sheet.id} should be unique`).toBe(false);
      ids.add(sheet.id);
      expect(sheet.frameMs, `${sheet.id} should have positive frame timing`).toBeGreaterThan(0);
    }
  });

  it("previews Scarab at 80ms and the other enemy bodies at 90ms", () => {
    const scarab = SPRITE_SHEET_CATALOG.find(
      (sheet) => sheet.id === "enemy-egypt-rift-scarab-attack-sheet-16",
    );
    const fixed90Ids = new Set([
      "enemy-egypt-mummy-attack-sheet-16",
      "enemy-egypt-priest-attack-sheet-16",
      "enemy-egypt-anubis-guard-attack-sheet-16",
      "enemy-egypt-sphinx-attack-sheet-16",
      "enemy-egypt-pharaoh-king-attack-sheet-16",
    ]);
    const matchingSheets = SPRITE_SHEET_CATALOG.filter((sheet) => fixed90Ids.has(sheet.id));

    expect(scarab.frameMs).toBe(80);
    expect(scarab.timing).toEqual(Array(16).fill(80));
    expect(matchingSheets).toHaveLength(fixed90Ids.size);
    for (const sheet of matchingSheets) {
      expect(sheet.frameMs).toBe(90);
      expect(sheet.timing).toEqual(Array(16).fill(90));
    }
  });

  it("previews all enemy projectile and impact sheets at 60ms frames", () => {
    const fixed60Ids = new Set([
      "enemy-rift-projectile-sheet-16",
      "enemy-impact-physical-sheet-16",
      "enemy-impact-arcane-sheet-16",
      "enemy-impact-stone-sheet-16",
      "enemy-pharaoh-projectile-sheet-16",
      "enemy-pharaoh-impact-sheet-16",
    ]);
    const matchingSheets = SPRITE_SHEET_CATALOG.filter((sheet) => fixed60Ids.has(sheet.id));

    expect(matchingSheets).toHaveLength(fixed60Ids.size);
    for (const sheet of matchingSheets) {
      expect(sheet.frameMs).toBe(60);
      expect(sheet.timing).toEqual(Array(16).fill(60));
    }
  });

  it("previews the complete hero hit and enemy death timing curves", () => {
    const heroHit = SPRITE_SHEET_CATALOG.find((sheet) => sheet.id === "hero-hit-sheet-16");
    const enemyDeath = SPRITE_SHEET_CATALOG.find((sheet) => sheet.id === "enemy-death-sheet-16");

    expect(heroHit.timing).toHaveLength(16);
    expect(heroHit.frameMs).toBe(60);
    expect(heroHit.timing).toEqual(Array(16).fill(60));
    expect(heroHit.timing.reduce((sum, frameMs) => sum + frameMs, 0)).toBe(960);
    expect(enemyDeath.timing).toHaveLength(16);
    expect(enemyDeath.timing.reduce((sum, frameMs) => sum + frameMs, 0)).toBe(1080);
  });

});
