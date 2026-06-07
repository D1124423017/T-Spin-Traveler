import { describe, expect, it } from "vitest";

class MockMedia {
  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
  }

  addEventListener() {}
  removeEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const { createUpgradeScreenRenderer } = await import("../src/ui/upgradeScreen.js");

function createContext() {
  const gradient = { addColorStop() {} };
  return new Proxy({
    globalAlpha: 1,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: (text) => ({ width: String(text).length * 8 }),
  }, {
    get(target, key) {
      if (key in target) return target[key];
      return () => {};
    },
  });
}

function createRenderer({ currentBuildOpen = false } = {}) {
  const state = {
    acquiredRelics: [],
    currentBuildOpen,
    pointer: { x: 0, y: 0 },
    upgradeChoices: [
      { id: "a", name: "A", rarity: "common", tags: ["Spin"], text: "A", shortText: "A" },
      { id: "b", name: "B", rarity: "rare", tags: ["Combo"], text: "B", shortText: "B" },
      { id: "c", name: "C", rarity: "relic", tags: ["Defense"], text: "C", shortText: "C" },
    ],
    upgradeDetailOpen: false,
    upgradeMotion: {
      openedAt: 0,
      selectedAt: 0,
      selectedIndex: 0,
    },
    upgradePickConfirm: null,
    upgradeSelectedIndex: 0,
  };
  const renderer = createUpgradeScreenRenderer({
    ctx: createContext(),
    state,
    t: (key) => key,
    fmt: (key) => key,
    canvasFont: () => "12px sans-serif",
    label() {},
    fitLabel() {},
    wrapText() {},
    roundedRect() {},
    drawDimOverlay() {},
    drawCard() {},
    drawMenuButton() {},
    drawLimitedWrapText() {},
    prefersReducedMotion: () => true,
    upgradeName: (upgrade) => upgrade.name,
    upgradeShortText: (upgrade) => upgrade.shortText,
    rarityLabel: (rarity) => rarity,
    getSpecialBondCountsForRun: () => ({ angel: 0, devil: 0 }),
    getTraitChangeHintsForUpgrade: () => [],
    getAcquiredRelicGroups: () => [],
    getCurrentBuildFamilyStats: () => [],
    getTraitEntries: () => [],
    getTraitEffectText: () => "",
    getCurrentBuildDirectionText: () => "",
    getTraitFullCount: () => 4,
  });
  return { renderer, state };
}

describe("upgrade screen renderer wiring", () => {
  it("draws all three upgrade cards without mutating selection state", () => {
    const { renderer, state } = createRenderer();
    const snapshot = structuredClone(state);

    expect(() => renderer.drawUpgradeOverlay()).not.toThrow();
    expect(state).toEqual(snapshot);
  });

  it("draws the nested current build panel through the same renderer boundary", () => {
    const { renderer } = createRenderer({ currentBuildOpen: true });

    expect(() => renderer.drawUpgradeOverlay()).not.toThrow();
  });
});
