import { describe, expect, it } from "vitest";
import {
  MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS,
  getFirstPaintReadiness,
  isFirstPaintReady,
} from "../src/core/firstPaintReadiness.js";

function createAssetApi(records) {
  return {
    getSummary: () => ({
      images: records,
    }),
  };
}

describe("main menu first-paint readiness", () => {
  it("waits for all critical menu and NOA images", () => {
    const records = MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS.map((id) => ({
      id,
      status: id === "hero-idle-canonical" ? "loading" : "loaded",
    }));

    const readiness = getFirstPaintReadiness(createAssetApi(records));

    expect(readiness.ready).toBe(false);
    expect(isFirstPaintReady(readiness)).toBe(false);
    expect(readiness.loading).toContain("hero-idle-canonical");
    expect(readiness.total).toBe(MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS.length);
  });

  it("becomes ready when the critical first-paint set is loaded", () => {
    const records = MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS.map((id) => ({
      id,
      status: "loaded",
    }));

    const readiness = getFirstPaintReadiness(createAssetApi(records));

    expect(readiness).toMatchObject({
      ready: true,
      loaded: MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS.length,
      error: 0,
      total: MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS.length,
    });
  });

  it("ignores audio and non-first-screen assets", () => {
    const records = MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS.map((id) => ({
      id,
      status: "loaded",
    })).concat([
      { id: "bgm-menu-01", status: "loading" },
      { id: "story-prologue-panel-01", status: "loading" },
      { id: "enemy-battle-egypt-rift-scarab-scout-left", status: "loading" },
    ]);

    expect(getFirstPaintReadiness(createAssetApi(records)).ready).toBe(true);
  });

  it("reports missing critical assets as loading instead of ready", () => {
    const records = MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS
      .filter((id) => id !== "menu-idle-cube-sheet-16")
      .map((id) => ({
        id,
        status: "loaded",
      }));

    const readiness = getFirstPaintReadiness(createAssetApi(records));

    expect(readiness.ready).toBe(false);
    expect(readiness.missing).toEqual(["menu-idle-cube-sheet-16"]);
    expect(readiness.loading).toContain("menu-idle-cube-sheet-16");
  });
});
