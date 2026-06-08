export function createUiTextHelpers({
  state,
  translations,
}) {
  function t(key) {
    const table = translations[state.language] || translations.zh;
    return table[key] || translations.en[key] || translations.zh[key] || key;
  }

  function fmt(key, vars = {}) {
    return t(key).replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
  }

  function setMessage(key, vars = {}) {
    state.messageKey = key;
    state.messageVars = vars;
    state.message = fmt(key, vars);
  }

  function getMessage() {
    return state.messageKey ? fmt(state.messageKey, state.messageVars) : state.message;
  }

  function upgradeText(upgrade) {
    if (upgrade.textKey) return t(upgrade.textKey);
    return state.language === "zh" ? upgrade.text : upgrade.textEn || upgrade.text;
  }

  function upgradeShortText(upgrade) {
    if (upgrade.shortTextKey) return t(upgrade.shortTextKey);
    return upgradeText(upgrade);
  }

  function upgradeName(upgrade) {
    const key = `upgradeName.${upgrade.id}`;
    const translated = t(key);
    return translated === key ? upgrade.name : translated;
  }

  function rarityLabel(rarity) {
    const labels = {
      common: { zh: "Common", en: "Common" },
      rare: { zh: "Rare", en: "Rare" },
      relic: { zh: "Relic", en: "Relic" },
      legendary: { zh: "Legendary", en: "Legendary" },
      boss: { zh: "Boss", en: "Boss" },
      special: { zh: "Special", en: "Special" },
    };
    return (labels[rarity] && labels[rarity][state.language]) || rarity;
  }

  function enemyWeaknessLabel(enemy) {
    const keyByWeakness = {
      none: "weaknessNone",
      combo: "weaknessCombo",
      perfect: "weaknessPerfect",
      spin: "weaknessSpin",
      allspin: "weaknessAllSpin",
      "all-spin": "weaknessAllSpin",
      b2b: "weaknessB2B",
    };
    return t(keyByWeakness[enemy.weakness] || "weaknessNone");
  }

  function enemyWeaknessToken(enemy) {
    return {
      none: "-",
      combo: "Combo",
      perfect: "PC",
      spin: "Spin",
      allspin: "All",
      "all-spin": "All",
      b2b: "B2B",
    }[enemy.weakness] || "-";
  }

  function enemyName(enemy) {
    return t(`enemy.${enemy.id}.name`);
  }

  function enemyTrait(enemy) {
    return t(`enemy.${enemy.id}.trait`);
  }

  return {
    enemyName,
    enemyTrait,
    enemyWeaknessLabel,
    enemyWeaknessToken,
    fmt,
    getMessage,
    rarityLabel,
    setMessage,
    t,
    upgradeName,
    upgradeShortText,
    upgradeText,
  };
}
