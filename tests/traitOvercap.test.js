import { describe, expect, it } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  getB2BTraitBonus,
  getBossKillerTraitBonus,
  getBurstTraitBonus,
  getComboTraitBonus,
  getDefenseTraitBonus,
  getGarbageTraitBonus,
  getPerfectClearTraitBonus,
  getSpinTraitBonus,
  getSurvivalTraitBonus,
  getTraitOvercap,
  getTraitOvercapBonus,
  getTraitProgress,
  getUtilityTraitBonus,
  isBossLikeEnemy,
  isTraitHighValueClear,
} from "../src/combat/upgradeEffects.js";

describe("trait overcap helpers", () => {
  it("reports progress and overcap from trait counts", () => {
    expect(getTraitProgress({ Spin: 5 }, "Spin")).toMatchObject({
      count: 5,
      fullCount: 6,
      isFull: false,
      overcap: 0,
    });
    expect(getTraitOvercap({ Spin: 6 }, "Spin")).toBe(0);
    expect(getTraitOvercap({ Spin: 8 }, "Spin")).toBe(2);
  });

  it("clamps generic overcap bonuses", () => {
    expect(getTraitOvercapBonus({ Spin: 8 }, "Spin")).toMatchObject({ damage: 6, guard: 1 });
    expect(getTraitOvercapBonus({ Spin: 99 }, "Spin")).toMatchObject({ damage: 18, guard: 3 });
  });

  it("calculates Perfect Clear trait thresholds and caps", () => {
    expect(getPerfectClearTraitBonus({ Perfect: 1 })).toMatchObject({
      delay: 1,
      guard: 8,
      executesNormalEnemy: false,
      bossMaxHpRatio: 0.35,
    });
    expect(getPerfectClearTraitBonus({ Perfect: 3 })).toMatchObject({
      delay: 1,
      guard: 15,
      executesNormalEnemy: true,
      bossMaxHpRatio: 0.45,
    });
    expect(getPerfectClearTraitBonus({ Perfect: 5 })).toMatchObject({
      overcap: 2,
      guard: 25,
      bossMaxHpRatio: 0.55,
    });
    expect(getPerfectClearTraitBonus({ Perfect: 8 })).toMatchObject({
      guard: 30,
      bossMaxHpRatio: 0.7,
    });
  });

  it("separates normal enemies from Boss and Mini Boss targets", () => {
    expect(isBossLikeEnemy({ id: "slime" })).toBe(false);
    expect(isBossLikeEnemy({ id: "king" })).toBe(true);
    expect(isBossLikeEnemy({ id: "sentinel" }, { miniBoss: true })).toBe(true);
  });

  it("calculates Spin overcap damage and Guard", () => {
    expect(getSpinTraitBonus({ Spin: 8 })).toEqual({ overcap: 2, damage: 6, guard: 1 });
    expect(getSpinTraitBonus({ Spin: 99 })).toEqual({ overcap: 93, damage: 18, guard: 3 });
  });

  it("calculates Combo overcap damage and capped delay", () => {
    expect(getComboTraitBonus({ Combo: 9 })).toMatchObject({ overcap: 3, damagePerCombo: 3, delay: 1 });
    expect(getComboTraitBonus({ Combo: 99 })).toMatchObject({ damagePerCombo: 5, delay: 2, traitDelayCap: 3 });
  });

  it("calculates Defense overcap Guard and reflect caps", () => {
    expect(getDefenseTraitBonus({ Defense: 9 })).toEqual({ overcap: 2, maxGuard: 4, clearGuard: 1, reflectDamage: 4 });
    expect(getDefenseTraitBonus({ Defense: 99 })).toEqual({ overcap: 92, maxGuard: 12, clearGuard: 4, reflectDamage: 10 });
  });

  it("calculates Survival wave-heal overcap", () => {
    expect(getSurvivalTraitBonus({ Survival: 9 })).toEqual({ overcap: 3, waveHeal: 6 });
    expect(getSurvivalTraitBonus({ Survival: 99 })).toEqual({ overcap: 93, waveHeal: 12 });
  });

  it("calculates Garbage counter and pressure-delay overcap", () => {
    expect(getGarbageTraitBonus({ Garbage: 9 })).toEqual({ overcap: 3, counterDamagePerRow: 9, graceDelay: 1 });
    expect(getGarbageTraitBonus({ Garbage: 99 })).toEqual({ overcap: 93, counterDamagePerRow: 18, graceDelay: 2 });
  });

  it("calculates B2B overcap damage and Guard", () => {
    expect(getB2BTraitBonus({ B2B: 6 })).toEqual({ overcap: 2, damage: 10, guard: 2 });
    expect(getB2BTraitBonus({ B2B: 99 })).toEqual({ overcap: 95, damage: 25, guard: 5 });
  });

  it("calculates Burst overcap and high-value operation gating", () => {
    expect(getBurstTraitBonus({ Burst: 10 })).toEqual({ overcap: 3, damage: 12 });
    expect(getBurstTraitBonus({ Burst: 99 })).toEqual({ overcap: 92, damage: 24 });
    expect(isTraitHighValueClear({ lines: 1 })).toBe(false);
    expect(isTraitHighValueClear({ lines: 4 })).toBe(true);
    expect(isTraitHighValueClear({ lines: 1, spinType: "full" })).toBe(true);
    expect(isTraitHighValueClear({ lines: 2, b2bActive: true })).toBe(false);
    expect(isTraitHighValueClear({ lines: 4, b2bActive: true })).toBe(true);
    expect(isTraitHighValueClear({ lines: 1, perfect: true })).toBe(true);
  });

  it("calculates Utility overcap charge", () => {
    expect(getUtilityTraitBonus({ Utility: 10 })).toEqual({ overcap: 4, ultimateCharge: 2 });
    expect(getUtilityTraitBonus({ Utility: 99 })).toEqual({ overcap: 93, ultimateCharge: 3 });
  });

  it("calculates Boss Killer overcap only for boss-like callers", () => {
    expect(getBossKillerTraitBonus({ "Boss Killer": 3 })).toEqual({ overcap: 1, damage: 10, maxHpRatio: 0.02 });
    expect(getBossKillerTraitBonus({ "Boss Killer": 99 })).toEqual({ overcap: 97, damage: 40, maxHpRatio: 0.08 });
    expect(isBossLikeEnemy({ id: "slime" })).toBe(false);
    expect(isBossLikeEnemy({ id: "beetle" }, { miniBoss: true })).toBe(true);
  });

  it("defines localized overcap UI strings", () => {
    for (const language of ["zh", "en"]) {
      for (const key of [
        "traitFull",
        "traitOvercap",
        "traitOvercapCount",
        "traitEveryExtraOne",
        "traitEveryExtraTwo",
        "traitEveryExtraThree",
        "traitPerfectExecute",
        "traitBossMaxHpDamage",
        "traitGainGuard",
        "traitCapped",
        "traitOvercapCapped",
      ]) {
        expect(translations[language][key]).toBeTruthy();
      }
    }
    expect(translations.zh.traitFull).toBe("滿羈絆");
    expect(translations.zh.traitOvercapCount).toContain("超量");
    expect(translations.en.traitFull).toBe("Full Trait");
    expect(translations.en.traitOvercapCount).toContain("Overcap");
  });
});
