import { describe, expect, it } from "vitest";
import {
  createEquipmentCombatState,
  getEquipmentBattleStartGuard,
  resolveEquipmentAttack,
  resolveEquipmentFatalHit,
  resolveEquipmentGuardGain,
  resolveEquipmentGuardImpact,
  startEquipmentCombatWave,
} from "../src/combat/equipmentEffects.js";
import { getEquipmentById } from "../src/data/equipment.js";

function equippedProgress(itemId) {
  const item = getEquipmentById(itemId);
  return {
    ownedEquipment: [itemId],
    equipped: {
      head: item.slot === "head" ? itemId : null,
      cloak: item.slot === "cloak" ? itemId : null,
      weapon: item.slot === "weapon" ? itemId : null,
    },
  };
}

function attack(itemId, context = {}, combatState = createEquipmentCombatState()) {
  return resolveEquipmentAttack({
    progress: equippedProgress(itemId),
    combatState,
    context: {
      lines: 1,
      combo: 0,
      b2bActive: false,
      perfect: false,
      ultimateActive: false,
      wave: 1,
      ...context,
    },
  });
}

describe("equipment combat effects", () => {
  it("applies the Drifter Observer Hood to every line-clear attack", () => {
    expect(attack("wanderer-observer-hood")).toMatchObject({
      attackStatBonus: 1,
      effectDamageBonus: 1,
      damageBonus: 2,
    });
    expect(attack("wanderer-observer-hood", { lines: 0 }).effectDamageBonus).toBe(0);
  });

  it("applies Torn Traveler Cloak Guard at battle start", () => {
    expect(getEquipmentBattleStartGuard(equippedProgress("torn-traveler-cloak"))).toBe(2);
  });

  it("applies Shard Crystal Dagger only to ordinary Single, Double, and Triple attacks", () => {
    expect(attack("shard-crystal-dagger", { lines: 2, combo: 4 }).effectDamageBonus).toBe(2);
    expect(attack("shard-crystal-dagger", { lines: 4 }).effectDamageBonus).toBe(0);
    expect(attack("shard-crystal-dagger", { spinType: "full" }).effectDamageBonus).toBe(0);
  });

  it("applies Star-Pattern Headwrap to T-Spins", () => {
    expect(attack("star-pattern-headwrap", { spinType: "full" }).effectDamageBonus).toBe(3);
    expect(attack("star-pattern-headwrap", { spinType: "mini" }).effectDamageBonus).toBe(3);
    expect(attack("star-pattern-headwrap").effectDamageBonus).toBe(0);
  });

  it("grants Resonance Cloak Guard when Combo reaches three", () => {
    expect(attack("resonance-cloak", { combo: 3 }).guardBonus).toBe(2);
    expect(attack("resonance-cloak", { combo: 4 }).guardBonus).toBe(0);
  });

  it("applies Pulse Crystal Blade only to active B2B attacks", () => {
    expect(attack("pulse-crystal-blade", { lines: 4, b2bActive: true }).effectDamageBonus).toBe(3);
    expect(attack("pulse-crystal-blade", { lines: 4 }).effectDamageBonus).toBe(0);
  });

  it("limits Rift Observer Crown to the first T-Spin in each wave", () => {
    const first = attack("rift-observer-crown", { spinType: "full", wave: 1 });
    const second = attack("rift-observer-crown", { spinType: "full", wave: 1 }, first.combatState);
    const nextWave = attack("rift-observer-crown", { spinType: "full", wave: 2 }, second.combatState);

    expect(first.effectDamageBonus).toBe(6);
    expect(second.effectDamageBonus).toBe(0);
    expect(nextWave.effectDamageBonus).toBe(6);
  });

  it("grants Phase Longcloak Guard on Perfect Clear", () => {
    expect(attack("phase-long-cloak", { lines: 4, perfect: true }).guardBonus).toBe(6);
    expect(attack("phase-long-cloak", { lines: 4 }).guardBonus).toBe(0);
  });

  it("applies Orbital Longsword from Combo four onward", () => {
    expect(attack("orbital-longsword", { combo: 3 }).effectDamageBonus).toBe(0);
    expect(attack("orbital-longsword", { combo: 4 }).effectDamageBonus).toBe(5);
  });

  it("applies Royal Crystal Crown to all attacks and adds its T-Spin bonus", () => {
    expect(attack("royal-crystal-crown").effectDamageBonus).toBe(3);
    expect(attack("royal-crystal-crown", { spinType: "full" }).effectDamageBonus).toBe(6);
  });

  it("doubles only the first low-HP Guard gain in each wave for Royal Nightfall Cloak", () => {
    const progress = equippedProgress("royal-nightfall-cloak");
    const first = resolveEquipmentGuardGain({
      progress,
      combatState: createEquipmentCombatState(),
      wave: 1,
      currentHp: 40,
      maxHp: 100,
      currentGuard: 0,
      maxGuard: 24,
      baseGain: 5,
    });
    const second = resolveEquipmentGuardGain({
      progress,
      combatState: first.combatState,
      wave: 1,
      currentHp: 35,
      maxHp: 100,
      currentGuard: first.gain,
      maxGuard: 24,
      baseGain: 5,
    });
    const nextWave = resolveEquipmentGuardGain({
      progress,
      combatState: startEquipmentCombatWave(second.combatState, 2),
      wave: 2,
      currentHp: 35,
      maxHp: 100,
      currentGuard: 0,
      maxGuard: 24,
      baseGain: 5,
    });

    expect(first).toMatchObject({ multiplier: 2, gain: 10 });
    expect(second).toMatchObject({ multiplier: 1, gain: 5 });
    expect(nextWave).toMatchObject({ multiplier: 2, gain: 10 });
  });

  it("applies Rift Sovereignty Blade once when an attack is B2B, Tetris, or both", () => {
    expect(attack("rift-sovereignty-blade", { lines: 4 }).effectDamageBonus).toBe(8);
    expect(attack("rift-sovereignty-blade", { lines: 2, spinType: "full", b2bActive: true }).effectDamageBonus).toBe(8);
    expect(attack("rift-sovereignty-blade", { lines: 4, b2bActive: true }).effectDamageBonus).toBe(8);
  });

  it("triggers Rift King Mask on every fifth line-clear attack across waves", () => {
    let state = createEquipmentCombatState();
    const bonuses = [];
    for (let index = 1; index <= 10; index += 1) {
      const result = attack("rift-king-mask", { wave: index <= 6 ? 1 : 2 }, state);
      state = result.combatState;
      bonuses.push(result.effectDamageBonus);
    }
    expect(bonuses).toEqual([0, 0, 0, 0, 10, 0, 0, 0, 0, 10]);
  });

  it("uses Fate Deception Cloak once per battle to retain one HP and grant Guard", () => {
    const progress = equippedProgress("fate-deception-cloak");
    const first = resolveEquipmentFatalHit({
      progress,
      combatState: createEquipmentCombatState(),
      wave: 1,
      currentHp: 12,
      damage: 20,
    });
    const second = resolveEquipmentFatalHit({
      progress,
      combatState: startEquipmentCombatWave(first.combatState, 2),
      wave: 2,
      currentHp: 8,
      damage: 20,
    });

    expect(first).toMatchObject({ damage: 11, guardGain: 10, saved: true });
    expect(second).toMatchObject({ damage: 20, guardGain: 0, saved: false });
  });

  it("applies Cheater's Amethyst Sword during Ultimate or Perfect Clear", () => {
    expect(attack("cheaters-amethyst-sword", { ultimateActive: true }).effectDamageBonus).toBe(15);
    expect(attack("cheaters-amethyst-sword", { perfect: true }).effectDamageBonus).toBe(15);
    expect(attack("cheaters-amethyst-sword").effectDamageBonus).toBe(0);
  });

  it("applies Twin-Line Rangefinder only to Double attacks", () => {
    expect(attack("twin-line-rangefinder", { lines: 2 }).effectDamageBonus).toBe(2);
    expect(attack("twin-line-rangefinder", { lines: 1 }).effectDamageBonus).toBe(0);
    expect(attack("twin-line-rangefinder", { lines: 3 }).effectDamageBonus).toBe(0);
  });

  it("grants Dustwalk Guardcloak Guard on the first multi-line clear each wave", () => {
    const single = attack("dustwalk-guardcloak", { lines: 1, wave: 1 });
    const first = attack("dustwalk-guardcloak", { lines: 2, wave: 1 }, single.combatState);
    const second = attack("dustwalk-guardcloak", { lines: 4, wave: 1 }, first.combatState);
    const nextWave = attack("dustwalk-guardcloak", { lines: 3, wave: 2 }, second.combatState);

    expect(single.guardBonus).toBe(0);
    expect(first.guardBonus).toBe(2);
    expect(second.guardBonus).toBe(0);
    expect(nextWave.guardBonus).toBe(2);
  });

  it("applies Four-Column Riftblade only to Tetris attacks", () => {
    expect(attack("four-column-riftblade", { lines: 4 }).effectDamageBonus).toBe(3);
    expect(attack("four-column-riftblade", { lines: 3 }).effectDamageBonus).toBe(0);
  });

  it("applies Chain Rhythm Crown from Combo three onward", () => {
    expect(attack("chain-rhythm-crown", { combo: 2 }).effectDamageBonus).toBe(0);
    expect(attack("chain-rhythm-crown", { combo: 3 }).effectDamageBonus).toBe(3);
    expect(attack("chain-rhythm-crown", { combo: 7 }).effectDamageBonus).toBe(3);
  });

  it("grants Vortex Guard Mantle Guard on the first T-Spin each wave", () => {
    const first = attack("vortex-guard-mantle", { spinType: "mini", wave: 1 });
    const second = attack("vortex-guard-mantle", { spinType: "full", wave: 1 }, first.combatState);
    const nextWave = attack("vortex-guard-mantle", { spinType: "full", wave: 2 }, second.combatState);

    expect(first.guardBonus).toBe(4);
    expect(second.guardBonus).toBe(0);
    expect(nextWave.guardBonus).toBe(4);
  });

  it("applies Faultline Greatblade to Triple and Tetris attacks", () => {
    expect(attack("faultline-greatblade", { lines: 2 }).effectDamageBonus).toBe(0);
    expect(attack("faultline-greatblade", { lines: 3 }).effectDamageBonus).toBe(5);
    expect(attack("faultline-greatblade", { lines: 4 }).effectDamageBonus).toBe(5);
  });

  it("delays the enemy on the first B2B attack each wave with Timeshift Observer Ring", () => {
    const first = attack("timeshift-observer-ring", { b2bActive: true, wave: 1 });
    const second = attack("timeshift-observer-ring", { b2bActive: true, wave: 1 }, first.combatState);
    const nextWave = attack("timeshift-observer-ring", { b2bActive: true, wave: 2 }, second.combatState);

    expect(first.enemyDelay).toBe(1);
    expect(second.enemyDelay).toBe(0);
    expect(nextWave.enemyDelay).toBe(1);
  });

  it("retains Guard once per wave when Afterimage Lifeguard Cloak is broken", () => {
    const progress = equippedProgress("afterimage-lifeguard-cloak");
    const first = resolveEquipmentGuardImpact({
      progress,
      combatState: createEquipmentCombatState(),
      wave: 1,
      currentGuard: 5,
      maxGuard: 24,
      blocked: 5,
      incomingDamage: 9,
    });
    const second = resolveEquipmentGuardImpact({
      progress,
      combatState: first.combatState,
      wave: 1,
      currentGuard: 3,
      maxGuard: 24,
      blocked: 3,
      incomingDamage: 8,
    });
    const nextWave = resolveEquipmentGuardImpact({
      progress,
      combatState: second.combatState,
      wave: 2,
      currentGuard: 2,
      maxGuard: 24,
      blocked: 2,
      incomingDamage: 8,
    });

    expect(first).toMatchObject({ guardAfter: 3, retainedGuard: 3 });
    expect(second).toMatchObject({ guardAfter: 0, retainedGuard: 0 });
    expect(nextWave).toMatchObject({ guardAfter: 3, retainedGuard: 3 });
  });

  it("applies Zero-Boundary Lance only to Perfect Clear attacks", () => {
    expect(attack("zero-boundary-lance", { perfect: true }).effectDamageBonus).toBe(10);
    expect(attack("zero-boundary-lance", { perfect: false }).effectDamageBonus).toBe(0);
  });

  it("delays the first Tetris or T-Spin each wave with Infallible Star Crown", () => {
    const first = attack("infallible-star-crown", { lines: 4, wave: 1 });
    const second = attack("infallible-star-crown", { spinType: "full", wave: 1 }, first.combatState);
    const nextWave = attack("infallible-star-crown", { spinType: "mini", wave: 2 }, second.combatState);

    expect(first.enemyDelay).toBe(1);
    expect(second.enemyDelay).toBe(0);
    expect(nextWave.enemyDelay).toBe(1);
  });

  it("restores Guard once per wave after a full block with Fate Reversal Barrier Cloak", () => {
    const progress = equippedProgress("fate-reversal-barrier-cloak");
    const first = resolveEquipmentGuardImpact({
      progress,
      combatState: createEquipmentCombatState(),
      wave: 1,
      currentGuard: 14,
      maxGuard: 24,
      blocked: 6,
      incomingDamage: 6,
    });
    const second = resolveEquipmentGuardImpact({
      progress,
      combatState: first.combatState,
      wave: 1,
      currentGuard: first.guardAfter,
      maxGuard: 24,
      blocked: 4,
      incomingDamage: 4,
    });
    const partialBlock = resolveEquipmentGuardImpact({
      progress,
      combatState: startEquipmentCombatWave(second.combatState, 2),
      wave: 2,
      currentGuard: 4,
      maxGuard: 24,
      blocked: 4,
      incomingDamage: 7,
    });

    expect(first).toMatchObject({ guardAfter: 16, restoredGuard: 8 });
    expect(second).toMatchObject({ guardAfter: 12, restoredGuard: 0 });
    expect(partialBlock).toMatchObject({ guardAfter: 0, restoredGuard: 0 });
  });

  it("applies Continuous Riftbreaker Greatsword from Combo six onward", () => {
    expect(attack("continuous-riftbreaker-greatsword", { combo: 5 }).effectDamageBonus).toBe(0);
    expect(attack("continuous-riftbreaker-greatsword", { combo: 6 }).effectDamageBonus).toBe(10);
  });

  it("keeps combat bonuses at zero without equipped items", () => {
    const result = resolveEquipmentAttack({
      progress: {},
      combatState: createEquipmentCombatState(),
      context: { lines: 4, spinType: "full", combo: 8, b2bActive: true, perfect: true },
    });
    const guard = resolveEquipmentGuardGain({
      progress: {},
      combatState: result.combatState,
      currentHp: 20,
      maxHp: 100,
      currentGuard: 0,
      maxGuard: 24,
      baseGain: 4,
    });

    expect(result).toMatchObject({
      attackStatBonus: 0,
      effectDamageBonus: 0,
      damageBonus: 0,
      guardBonus: 0,
      enemyDelay: 0,
    });
    expect(guard).toMatchObject({ multiplier: 1, gain: 4 });
  });
});
