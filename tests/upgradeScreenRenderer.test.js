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

function createRenderer({ currentBuildOpen = false, detailOpen = false } = {}) {
  const detailTexts = [];
  const fittedLabels = [];
  const state = {
    acquiredRelics: [],
    currentBuildOpen,
    pointer: { x: 0, y: 0 },
    upgradeChoices: [
      { id: "a", name: "A", rarity: "common", tags: ["Spin"], text: "A", shortText: "A" },
      { id: "b", name: "B", rarity: "rare", tags: ["Combo"], text: "B", shortText: "B" },
      { id: "c", name: "C", rarity: "relic", tags: ["Defense"], text: "C", shortText: "C" },
    ],
    upgradeDetailOpen: detailOpen,
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
    fitLabel(text) {
      fittedLabels.push(text);
    },
    wrapText() {},
    roundedRect() {},
    drawDimOverlay() {},
    drawCard() {},
    drawMenuButton() {},
    drawLimitedWrapText(text) {
      detailTexts.push(text);
    },
    prefersReducedMotion: () => true,
    upgradeName: (upgrade) => upgrade.name,
    upgradeText: (upgrade) => `${upgrade.name} full effect`,
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
  return { renderer, state, detailTexts, fittedLabels };
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

  it("keeps selected upgrade text visible across detail toggles and card changes", () => {
    const {
      renderer,
      state,
      detailTexts,
      fittedLabels,
    } = createRenderer({ detailOpen: true });

    expect(() => renderer.drawUpgradeOverlay()).not.toThrow();
    expect(detailTexts).toContain("A full effect");
    expect(fittedLabels).toContain("SPIN");

    state.upgradeSelectedIndex = 1;
    renderer.drawUpgradeOverlay();
    expect(detailTexts).toContain("B full effect");
    expect(fittedLabels).toContain("COMBO");

    state.upgradeDetailOpen = false;
    renderer.drawUpgradeOverlay();
    expect(detailTexts).toContain("B");
    expect(fittedLabels.filter((label) => label === "COMBO").length).toBeGreaterThanOrEqual(2);
  });
});
