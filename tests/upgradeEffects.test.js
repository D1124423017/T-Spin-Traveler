import { describe, expect, it } from "vitest";
import { applyUpgradeEffect } from "../src/combat/upgradeEffects.js";
import { UPGRADES } from "../src/data/upgrades.js";

function getUpgrade(id) {
  return UPGRADES.find((upgrade) => upgrade.id === id);
}

function createRuntime(overrides = {}) {
  const state = {
    upgrades: {
      maxHpBonus: 0,
      tspinBonus: 0,
      comboDamage: 0,
      guardGain: 0,
      damageMultiplier: 0,
      singularitySpinCore: 0,
    },
    maxGuard: 20,
    guard: 5,
    playerMaxHp: 100,
    playerHp: 50,
    ...overrides.state,
  };
  return {
    state,
    basePlayerMaxHp: 100,
    getEffectiveMaxGuard: () => state.maxGuard,
    ...overrides.runtime,
  };
}

describe("upgrade effects", () => {
  it("increases max HP and heals by the configured amount", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("vital_core"), runtime);

    expect(runtime.state.upgrades.maxHpBonus).toBe(15);
    expect(runtime.state.playerMaxHp).toBe(115);
    expect(runtime.state.playerHp).toBe(65);
  });

  it("adds T-Spin bonus without changing the upgrade data value", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("tspin_amp"), runtime);

    expect(runtime.state.upgrades.tspinBonus).toBe(10);
  });

  it("adds combo damage", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("combo_resonator"), runtime);

    expect(runtime.state.upgrades.comboDamage).toBe(3);
  });

  it("sets a legendary unique flag", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("singularity_spin_core"), runtime);

    expect(runtime.state.upgrades.singularitySpinCore).toBe(1);
  });

  it("applies Guard Lattice max guard, guard gain, and current guard", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("guard_lattice"), runtime);

    expect(runtime.state.maxGuard).toBe(28);
    expect(runtime.state.upgrades.guardGain).toBe(1);
    expect(runtime.state.guard).toBe(13);
  });

  it("sets the new Angel special card flags without immediate healing", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("angel_halo_sanctuary"), runtime);
    applyUpgradeEffect(getUpgrade("angel_cleansing_prism"), runtime);
    applyUpgradeEffect(getUpgrade("angel_perfect_benediction"), runtime);

    expect(runtime.state.upgrades.angelHaloSanctuary).toBe(1);
    expect(runtime.state.upgrades.angelCleansingPrism).toBe(1);
    expect(runtime.state.upgrades.angelPerfectBenediction).toBe(1);
    expect(runtime.state.playerHp).toBe(50);
    expect(runtime.state.guard).toBe(5);
  });

  it("sets the new Devil special card flags without immediate HP payment", () => {
    const runtime = createRuntime();

    applyUpgradeEffect(getUpgrade("devil_blood_moon_pact"), runtime);
    applyUpgradeEffect(getUpgrade("devil_abyss_chain"), runtime);
    applyUpgradeEffect(getUpgrade("devil_fallen_crown"), runtime);

    expect(runtime.state.upgrades.devilBloodMoonPact).toBe(1);
    expect(runtime.state.upgrades.devilAbyssChain).toBe(1);
    expect(runtime.state.upgrades.devilFallenCrown).toBe(1);
    expect(runtime.state.playerHp).toBe(50);
    expect(runtime.state.upgrades.damageMultiplier).toBe(0);
  });
});
