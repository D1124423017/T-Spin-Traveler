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
});
