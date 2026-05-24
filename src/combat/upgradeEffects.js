const UPGRADE_EFFECT_APPLIERS = {
  addUpgradeValue(effect, runtime) {
    runtime.state.upgrades[effect.key] += effect.value;
  },
  setUpgradeFlag(effect, runtime) {
    runtime.state.upgrades[effect.key] = effect.value;
  },
  setUpgradeMin(effect, runtime) {
    runtime.state.upgrades[effect.key] = Math.max(runtime.state.upgrades[effect.key], effect.value);
  },
  addStateValue(effect, runtime) {
    runtime.state[effect.key] += effect.value;
  },
  addGuard(effect, runtime) {
    runtime.state.guard = Math.min(runtime.getEffectiveMaxGuard(), runtime.state.guard + effect.value);
  },
  increasePlayerMaxHp(effect, runtime) {
    increasePlayerMaxHp(runtime.state, runtime.basePlayerMaxHp, effect.value, effect.healValue ?? effect.value);
  },
};

export const SUPPORTED_UPGRADE_EFFECT_TYPES = Object.freeze(Object.keys(UPGRADE_EFFECT_APPLIERS));

export function applyUpgradeEffect(upgrade, runtime) {
  const effects = Array.isArray(upgrade?.effects) ? upgrade.effects : [];
  for (const effect of effects) applyEffect(effect, runtime);
}

function applyEffect(effect, runtime) {
  const apply = UPGRADE_EFFECT_APPLIERS[effect.type];
  if (!apply) throw new Error(`Unknown upgrade effect type: ${effect.type}`);
  apply(effect, runtime);
}

function increasePlayerMaxHp(state, basePlayerMaxHp, amount, healAmount) {
  state.upgrades.maxHpBonus += amount;
  state.playerMaxHp = basePlayerMaxHp + state.upgrades.maxHpBonus;
  state.playerHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
}
