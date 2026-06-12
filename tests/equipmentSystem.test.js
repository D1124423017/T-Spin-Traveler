import { describe, expect, it, vi } from "vitest";
import { RARITY } from "../src/data/upgrades.js";
import { translations } from "../src/data/i18n.js";
import {
  EQUIPMENT_FILTER_ORDER,
  EQUIPMENT_DRAW_COSTS,
  EQUIPMENT_ITEMS,
  EQUIPMENT_SCREEN_VIEWS,
  EQUIPMENT_SLOT_ORDER,
  EQUIPMENT_WHEEL_LEVELS,
  EQUIPMENT_WHEEL_UPGRADE_COSTS,
  buildEquipmentWheelSegments,
  getEquipmentDrawCost,
  getEquipmentWheelLevel,
  getEquipmentWheelUpgradeCost,
} from "../src/data/equipment.js";
import {
  DEFAULT_EQUIPMENT_PROGRESS,
  drawEquipment,
  equipOwnedItem,
  getOwnedEquipmentForFilter,
  normalizeEquipmentProgress,
  upgradeEquipmentWheel,
} from "../src/core/equipmentProgress.js";
import {
  createEquipmentSpinMotion,
  getEquipmentMotionState,
} from "../src/ui/equipmentMotion.js";
import {
  getEquipmentRewardDuration,
  getEquipmentWheelPresentation,
} from "../src/ui/equipmentWheelPresentation.js";
import { createEquipmentScreenRenderer } from "../src/ui/equipmentScreen.js";
import { createEquipmentInputRouter } from "../src/input/equipmentInputRouter.js";
import {
  EQUIPMENT_INVENTORY_LAYOUT,
  EQUIPMENT_ROULETTE_LAYOUT,
  getEquipmentFilterRects,
  getEquipmentInventoryRects,
} from "../src/ui/equipmentLayout.js";
import { createEquipmentController } from "../src/core/equipmentController.js";

describe("equipment data", () => {
  it("defines fifteen items across the three supported slots", () => {
    expect(EQUIPMENT_ITEMS).toHaveLength(15);
    for (const slot of EQUIPMENT_SLOT_ORDER) {
      expect(EQUIPMENT_ITEMS.filter((item) => item.slot === slot)).toHaveLength(5);
    }
    expect(new Set(EQUIPMENT_ITEMS.map((item) => item.id)).size).toBe(15);
  });

  it("provides bilingual names, effects, wheel labels, and screen copy", () => {
    for (const language of ["zh", "en"]) {
      for (const item of EQUIPMENT_ITEMS) {
        expect(translations[language][item.nameKey]).toBeTruthy();
        expect(translations[language][item.descriptionKey]).toBeTruthy();
        expect(translations[language][item.effectKey]).toBeTruthy();
      }
      for (const wheel of EQUIPMENT_WHEEL_LEVELS) {
        expect(translations[language][wheel.nameKey]).toBeTruthy();
      }
      expect(translations[language].equipmentInventoryTitle).toBeTruthy();
      expect(translations[language].equipmentRouletteTitle).toBeTruthy();
      expect(translations[language].equipmentGoToRoulette).toBeTruthy();
      for (const filter of EQUIPMENT_FILTER_ORDER) {
        expect(translations[language][`equipmentFilter.${filter}`]).toBeTruthy();
      }
      expect(translations[language]["equipmentSlot.weapon"]).toBeTruthy();
    }
  });

  it("reuses only the existing upgrade-card rarity keys", () => {
    const existingRarities = new Set(Object.keys(RARITY));
    for (const item of EQUIPMENT_ITEMS) {
      expect(existingRarities.has(item.rarity)).toBe(true);
    }
    expect(new Set(EQUIPMENT_ITEMS.map((item) => item.rarity))).toEqual(
      new Set(["common", "rare", "relic", "legendary"]),
    );
  });

  it("gives every item a unique formal icon key and structured numeric effect data", () => {
    expect(new Set(EQUIPMENT_ITEMS.map((item) => item.iconAssetKey)).size).toBe(15);
    for (const item of EQUIPMENT_ITEMS) {
      expect(item.iconAssetKey).toBe(item.id);
      expect(item.effect.type).toBeTruthy();
      expect(Object.values(item.effect).some((value) => Number.isFinite(value))).toBe(true);
    }
  });

  it("keeps five wheel levels with exact four-rarity probabilities", () => {
    expect(EQUIPMENT_WHEEL_LEVELS).toHaveLength(5);
    for (const wheel of EQUIPMENT_WHEEL_LEVELS) {
      expect(Object.values(wheel.weights).reduce((sum, value) => sum + value, 0)).toBe(100);
    }
    expect(getEquipmentWheelLevel(1).weights).toEqual({
      common: 70,
      rare: 25,
      relic: 5,
      legendary: 0,
    });
    expect(getEquipmentWheelLevel(5).weights).toEqual({
      common: 10,
      rare: 25,
      relic: 30,
      legendary: 35,
    });
  });

  it("builds a readable 24-segment visual wheel at every level", () => {
    for (let level = 1; level <= 5; level += 1) {
      const segments = buildEquipmentWheelSegments(level);
      expect(segments).toHaveLength(24);
      expect(segments.map(({ index }) => index)).toEqual(
        Array.from({ length: 24 }, (_, index) => index),
      );
    }
    const levelOne = buildEquipmentWheelSegments(1);
    expect(levelOne.filter(({ rarity }) => rarity === "common")).toHaveLength(17);
    expect(levelOne.filter(({ rarity }) => rarity === "rare")).toHaveLength(6);
    expect(levelOne.filter(({ rarity }) => rarity === "relic")).toHaveLength(1);
  });

  it("uses the requested draw prices and a progressive wheel upgrade curve", () => {
    expect(EQUIPMENT_DRAW_COSTS).toEqual({ first: 100, repeat: 300 });
    expect(getEquipmentDrawCost({ drawCount: 0 })).toBe(100);
    expect(getEquipmentDrawCost({ drawCount: 1 })).toBe(300);
    expect(getEquipmentDrawCost({ drawCount: 99 })).toBe(300);
    expect(EQUIPMENT_WHEEL_UPGRADE_COSTS).toEqual([2000, 5000, 10000, 20000]);
    expect([1, 2, 3, 4, 5].map(getEquipmentWheelUpgradeCost))
      .toEqual([2000, 5000, 10000, 20000, null]);
  });
});

describe("equipment progress", () => {
  it("normalizes legacy or malformed equipment state safely", () => {
    expect(normalizeEquipmentProgress({
      wheelLevel: 99,
      ownedEquipment: ["wanderer-observer-hood", "missing", "wanderer-observer-hood"],
      equipped: {
        head: "wanderer-observer-hood",
        cloak: "wanderer-observer-hood",
      },
      recentDrop: "missing",
      drawCount: -3,
    })).toEqual({
      wheelLevel: 5,
      ownedEquipment: ["wanderer-observer-hood"],
      equipped: {
        head: "wanderer-observer-hood",
        cloak: null,
        weapon: null,
      },
      recentDrop: null,
      drawCount: 0,
    });
  });

  it("draws from the configured rarity pool and keeps ownership unique", () => {
    const first = drawEquipment(DEFAULT_EQUIPMENT_PROGRESS, sequenceRng([0, 0]));
    expect(first.item.id).toBe("wanderer-observer-hood");
    expect(first.duplicate).toBe(false);
    expect(first.progress.ownedEquipment).toEqual(["wanderer-observer-hood"]);

    const duplicate = drawEquipment(first.progress, sequenceRng([0, 0]));
    expect(duplicate.item.id).toBe("wanderer-observer-hood");
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.progress.ownedEquipment).toEqual(["wanderer-observer-hood"]);
    expect(duplicate.progress.drawCount).toBe(2);
  });

  it("equips only owned items in their matching slot", () => {
    const owned = {
      ...DEFAULT_EQUIPMENT_PROGRESS,
      ownedEquipment: ["pulse-crystal-blade"],
    };
    const result = equipOwnedItem(owned, "pulse-crystal-blade");

    expect(result.ok).toBe(true);
    expect(result.progress.equipped.weapon).toBe("pulse-crystal-blade");
    expect(equipOwnedItem(DEFAULT_EQUIPMENT_PROGRESS, "pulse-crystal-blade"))
      .toMatchObject({ ok: false, reason: "notOwned" });
  });

  it("replaces only the matching equipped slot and filters owned gear by slot", () => {
    const owned = {
      ...DEFAULT_EQUIPMENT_PROGRESS,
      ownedEquipment: [
        "shard-crystal-dagger",
        "pulse-crystal-blade",
        "wanderer-observer-hood",
      ],
    };
    const first = equipOwnedItem(owned, "shard-crystal-dagger");
    const second = equipOwnedItem(first.progress, "pulse-crystal-blade");

    expect(second.progress.equipped).toEqual({
      head: null,
      cloak: null,
      weapon: "pulse-crystal-blade",
    });
    expect(getOwnedEquipmentForFilter(second.progress, "weapon").map(({ id }) => id))
      .toEqual(["shard-crystal-dagger", "pulse-crystal-blade"]);
    expect(getOwnedEquipmentForFilter(second.progress, "head").map(({ id }) => id))
      .toEqual(["wanderer-observer-hood"]);
  });

  it("upgrades the wheel to level five without overflowing", () => {
    let progress = DEFAULT_EQUIPMENT_PROGRESS;
    for (let level = 2; level <= 5; level += 1) {
      const result = upgradeEquipmentWheel(progress);
      expect(result).toMatchObject({ ok: true, level });
      progress = result.progress;
    }
    expect(upgradeEquipmentWheel(progress)).toMatchObject({ ok: false, reason: "maxed" });
  });
});

describe("equipment presentation and input", () => {
  it("targets a matching rarity segment and enables the NOA cheat hook at high level", () => {
    const motion = createEquipmentSpinMotion({
      now: 100,
      wheelLevel: 4,
      rarity: "legendary",
      itemId: "rift-sovereignty-blade",
      random: () => 0,
    });
    const segments = buildEquipmentWheelSegments(4);

    expect(segments[motion.targetIndex].rarity).toBe("legendary");
    expect(motion.cheat).toBe(true);
    expect(motion.itemId).toBe("rift-sovereignty-blade");
    expect(getEquipmentMotionState(motion, 100 + motion.durationMs).settled).toBe(true);
  });

  it("makes each wheel level visibly and rhythmically more elaborate", () => {
    const levels = [1, 2, 3, 4, 5].map(getEquipmentWheelPresentation);
    expect(levels.map(({ ringCount }) => ringCount)).toEqual([1, 2, 3, 4, 5]);
    expect(levels.map(({ particleCount }) => particleCount))
      .toEqual([10, 15, 21, 29, 38]);
    expect(levels.map(({ spinTurns }) => spinTurns)).toEqual([5, 6, 7, 8, 10]);
    expect(levels.map(({ spinDurationMs }) => spinDurationMs))
      .toEqual([1920, 2070, 2240, 2440, 2680]);
    expect(levels[4].interferenceStrength).toBeGreaterThan(levels[0].interferenceStrength);
  });

  it("reveals the acquired equipment briefly after the wheel nears its stop", () => {
    const motion = createEquipmentSpinMotion({
      now: 100,
      wheelLevel: 5,
      rarity: "legendary",
      itemId: "cheaters-amethyst-sword",
      reducedMotion: false,
      random: () => 0,
    });
    const beforeReveal = getEquipmentMotionState(motion, motion.revealStartedAt - 1);
    const duringReveal = getEquipmentMotionState(
      motion,
      motion.revealStartedAt + motion.revealDurationMs / 2,
    );
    const afterReveal = getEquipmentMotionState(
      motion,
      motion.revealStartedAt + motion.revealDurationMs + 1,
    );

    expect(beforeReveal.revealActive).toBe(false);
    expect(duringReveal.revealActive).toBe(true);
    expect(duringReveal.revealProgress).toBeCloseTo(0.5);
    expect(afterReveal.revealActive).toBe(false);
    expect(getEquipmentRewardDuration("legendary", false))
      .toBeGreaterThan(getEquipmentRewardDuration("common", false));
    expect(getEquipmentRewardDuration("legendary", true)).toBe(760);

    const reduced = createEquipmentSpinMotion({
      now: 100,
      wheelLevel: 5,
      rarity: "legendary",
      itemId: "cheaters-amethyst-sword",
      reducedMotion: true,
      random: () => 0,
    });
    expect(reduced.durationMs).toBe(1);
    expect(reduced.endRotation).toBeLessThan(Math.PI * 2);
  });

  it("keeps inventory and roulette input focus in separate sub-screens", () => {
    const actions = {
      backToInventory: vi.fn(),
      backToMain: vi.fn(),
      draw: vi.fn(),
      equip: vi.fn(),
      openRoulette: vi.fn(),
      upgrade: vi.fn(),
    };
    const state = {
      metaProgress: {
        equipment: {
          ownedEquipment: [
            "wanderer-observer-hood",
            "pulse-crystal-blade",
          ],
          equipped: {
            head: null,
            cloak: null,
            weapon: null,
          },
        },
      },
      equipmentUi: {
        view: EQUIPMENT_SCREEN_VIEWS.inventory,
        filter: "all",
        selectedOwnedIndex: 0,
      },
    };
    const router = createEquipmentInputRouter({ state, actions });

    expect(router.handleKeyDown({ key: "Enter" })).toBe(true);
    expect(actions.equip).toHaveBeenCalledWith("wanderer-observer-hood");
    expect(actions.draw).not.toHaveBeenCalled();
    expect(router.handleKeyDown({ key: "ArrowRight" })).toBe(true);
    expect(state.equipmentUi.filter).toBe("head");
    expect(router.handleKeyDown({ key: "r" })).toBe(true);
    expect(actions.openRoulette).toHaveBeenCalledOnce();

    const weaponFilterRect = getEquipmentFilterRects()
      .find(({ filter }) => filter === "weapon");
    expect(router.handlePointerDown(
      weaponFilterRect.x + 4,
      weaponFilterRect.y + 4,
    )).toBe(true);
    expect(state.equipmentUi.filter).toBe("weapon");
    const [weaponRect] = getEquipmentInventoryRects(1);
    expect(router.handlePointerDown(weaponRect.x + 4, weaponRect.y + 4)).toBe(true);
    expect(state.equipmentUi.selectedOwnedIndex).toBe(0);
    expect(router.handlePointerDown(
      EQUIPMENT_INVENTORY_LAYOUT.equipButton.x + 4,
      EQUIPMENT_INVENTORY_LAYOUT.equipButton.y + 4,
    )).toBe(true);
    expect(actions.equip).toHaveBeenLastCalledWith("pulse-crystal-blade");

    state.equipmentUi.view = EQUIPMENT_SCREEN_VIEWS.roulette;
    expect(router.handleKeyDown({ key: "Enter" })).toBe(true);
    expect(actions.draw).toHaveBeenCalledOnce();
    expect(router.handleKeyDown({ key: "u" })).toBe(true);
    expect(actions.upgrade).toHaveBeenCalledOnce();
    expect(router.handlePointerDown(
      EQUIPMENT_ROULETTE_LAYOUT.backButton.x + 4,
      EQUIPMENT_ROULETTE_LAYOUT.backButton.y + 4,
    )).toBe(true);
    expect(actions.backToInventory).toHaveBeenCalledOnce();
    expect(router.handleKeyDown({ key: "Escape" })).toBe(true);
    expect(actions.backToInventory).toHaveBeenCalledTimes(2);
    state.equipmentUi.view = EQUIPMENT_SCREEN_VIEWS.inventory;
    expect(router.handleKeyDown({ key: "Escape" })).toBe(true);
    expect(actions.backToMain).toHaveBeenCalledOnce();
  });

  it("dispatches inventory and roulette renderers from one equipment overlay", () => {
    const labels = [];
    const ctx = createCanvasContextStub();
    const state = {
      pointer: { x: -1, y: -1 },
      metaProgress: {
        riftEnergy: 0,
        equipment: normalizeEquipmentProgress(),
      },
      equipmentUi: {
        view: EQUIPMENT_SCREEN_VIEWS.inventory,
        filter: "all",
        motion: null,
        message: { key: "", vars: {}, until: 0 },
        selectedOwnedIndex: 0,
      },
    };
    const renderer = createEquipmentScreenRenderer({
      ctx,
      state,
      t: (key) => key,
      fmt: (key) => key,
      canvasFont: () => "12px sans-serif",
      label: (text) => labels.push(text),
      fitLabel: (text) => labels.push(text),
      wrapText: (text) => labels.push(text),
      roundedRect: vi.fn(),
      drawImageContain: vi.fn(),
      drawMainMenuScene: vi.fn(),
      drawDimOverlay: vi.fn(),
      drawCard: vi.fn(),
      drawMenuButton: vi.fn(),
      isImageReady: () => false,
      now: () => 0,
    });

    renderer.drawEquipmentScreen();
    expect(labels).toContain("equipmentInventoryTitle");
    expect(labels).not.toContain("equipmentRouletteTitle");

    labels.length = 0;
    state.equipmentUi.view = EQUIPMENT_SCREEN_VIEWS.roulette;
    renderer.drawEquipmentScreen();
    expect(labels).toContain("equipmentRouletteTitle");
    expect(labels).not.toContain("equipmentInventoryTitle");
  });

  it("orchestrates inventory, roulette, equip, save, and paid upgrades", () => {
    const state = {
      mode: "start",
      metaProgress: null,
      equipmentUi: {
        view: EQUIPMENT_SCREEN_VIEWS.inventory,
        filter: "all",
        motion: null,
        message: { key: "", vars: {}, until: 0 },
        selectedOwnedIndex: 0,
      },
    };
    let persisted = {
      riftEnergy: 12000,
      equipment: normalizeEquipmentProgress(),
    };
    const saveMetaProgress = vi.fn((value) => {
      persisted = structuredClone(value);
    });
    const controller = createEquipmentController({
      state,
      loadMetaProgress: () => structuredClone(persisted),
      saveMetaProgress,
      spendRiftEnergy: (progress, cost) => progress.riftEnergy >= cost
        ? {
          ok: true,
          cost,
          progress: { ...progress, riftEnergy: progress.riftEnergy - cost },
        }
        : {
          ok: false,
          cost,
          progress,
        },
      setGameMode: (mode) => {
        state.mode = mode;
      },
      translate: (key) => key,
      format: (key) => key,
      prefersReducedMotion: () => true,
      createSpinMotion: () => ({ kind: "draw" }),
      createUpgradeMotion: () => ({ kind: "upgrade" }),
      getMotionState: () => ({ active: false }),
      showToast: vi.fn(),
      playSfx: vi.fn(),
      now: () => 100,
      random: sequenceRng([0, 0, 0]),
    });

    controller.openEquipmentScreen();
    expect(state.mode).toBe("equipment");
    expect(state.equipmentUi.view).toBe(EQUIPMENT_SCREEN_VIEWS.inventory);
    expect(controller.drawEquipmentRoulette()).toBe(false);
    controller.openEquipmentRoulette();
    expect(state.equipmentUi.view).toBe(EQUIPMENT_SCREEN_VIEWS.roulette);
    expect(controller.drawEquipmentRoulette()).toBe(true);
    expect(persisted.riftEnergy).toBe(11900);
    expect(persisted.equipment.ownedEquipment).toEqual(["wanderer-observer-hood"]);
    controller.returnToEquipmentInventory();
    expect(state.equipmentUi.view).toBe(EQUIPMENT_SCREEN_VIEWS.inventory);
    expect(controller.equipEquipmentItem("wanderer-observer-hood")).toBe(true);
    expect(persisted.equipment.equipped.head).toBe("wanderer-observer-hood");
    controller.openEquipmentRoulette();
    state.equipmentUi.motion = null;
    expect(controller.upgradeEquipmentRoulette()).toBe(true);
    expect(persisted.riftEnergy).toBe(9900);
    expect(persisted.equipment.wheelLevel).toBe(2);
    expect(saveMetaProgress).toHaveBeenCalledTimes(3);
  });

  it("does not draw or upgrade when Rift Energy cannot cover the current price", () => {
    const state = {
      mode: "equipment",
      metaProgress: null,
      equipmentUi: {
        view: EQUIPMENT_SCREEN_VIEWS.roulette,
        filter: "all",
        motion: null,
        message: { key: "", vars: {}, until: 0 },
        selectedOwnedIndex: 0,
      },
    };
    const persisted = {
      riftEnergy: 99,
      equipment: normalizeEquipmentProgress(),
    };
    const saveMetaProgress = vi.fn();
    const controller = createEquipmentController({
      state,
      loadMetaProgress: () => structuredClone(persisted),
      saveMetaProgress,
      spendRiftEnergy: (progress, cost) => ({
        ok: progress.riftEnergy >= cost,
        cost,
        progress,
      }),
      setGameMode: vi.fn(),
      translate: (key) => key,
      format: (key) => key,
      prefersReducedMotion: () => true,
      createSpinMotion: vi.fn(),
      createUpgradeMotion: vi.fn(),
      getMotionState: () => ({ active: false }),
      showToast: vi.fn(),
      playSfx: vi.fn(),
      now: () => 100,
    });

    expect(controller.drawEquipmentRoulette()).toBe(false);
    expect(state.equipmentUi.message).toMatchObject({
      key: "equipmentDrawNotEnough",
      vars: { cost: 100 },
    });
    expect(controller.upgradeEquipmentRoulette()).toBe(false);
    expect(state.equipmentUi.message).toMatchObject({
      key: "equipmentWheelUpgradeNotEnough",
      vars: { cost: 2000 },
    });
    expect(saveMetaProgress).not.toHaveBeenCalled();
  });
});

function sequenceRng(values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)] ?? 0;
}

function createCanvasContextStub() {
  const gradient = { addColorStop: vi.fn() };
  return new Proxy({
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: (text) => ({ width: String(text).length * 8 }),
    restore: vi.fn(),
    save: vi.fn(),
  }, {
    get(target, property) {
      if (!(property in target)) target[property] = vi.fn();
      return target[property];
    },
  });
}
