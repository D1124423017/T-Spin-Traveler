export function createCombatReadoutModel({
  translate,
  format,
  buildDamageEquation,
  boardX,
  boardY,
  random = Math.random,
} = {}) {
  function getLineHitLabel(lines) {
    return {
      1: translate("hitSingle"),
      2: translate("hitDouble"),
      3: translate("hitTriple"),
      4: translate("hitTetris"),
    }[lines] || `${lines} ${translate("linesShort")}`;
  }

  function getOperationTitle(lines, pieceType, spinType, perfect) {
    if (perfect) return translate("perfectClearTitle");
    const lineName = {
      1: translate("line.single"),
      2: translate("line.double"),
      3: translate("line.triple"),
      4: translate("line.tetris"),
    }[lines] || format("line.generic", { lines });
    if (spinType === "full") return `T-SPIN ${lineName}`;
    if (spinType === "mini") return `T-SPIN MINI ${lineName}`;
    if (spinType === "all-mini") return `${pieceType}-SPIN ${lineName}`;
    return lineName;
  }

  function getHitBreakdownTitle(lines, pieceType, spinType, meta = {}) {
    if (meta.perfect) return translate("hitPerfect");
    const parts = [];
    if (spinType) {
      if (spinType === "full") parts.push(translate("hitTSpin"));
      else if (spinType === "mini") parts.push(translate("hitTSpinMini"));
      else parts.push(`${pieceType}-SPIN`);
    } else {
      parts.push(getLineHitLabel(lines));
    }
    if (meta.combo >= 2) parts.push(translate("hitCombo"));
    if (meta.b2b) parts.push(translate("hitB2B"));
    return parts.filter(Boolean).slice(0, 3).join(" + ");
  }

  function getPopupType(lines, spinType, { combo = 0, b2b = false, perfect = false } = {}) {
    if (perfect) return "perfect";
    if (spinType === "full") return "tspin";
    if (spinType) return "spin";
    if (b2b) return "b2b";
    if (combo >= 2) return "combo";
    if (lines >= 4) return "tetris";
    return "lineClear";
  }

  function getHitPopupColor(type, lines, combo) {
    return {
      perfect: "#fff0a6",
      tspin: "#ffb7ff",
      spin: "#d7c2ff",
      b2b: "#fff0a6",
      combo: combo >= 4 ? "#7ef7ff" : "#d7c2ff",
      tetris: "#9df7da",
      lineClear: lines >= 2 ? "#f5f1e6" : "#b9c2ff",
    }[type] || "#f5f1e6";
  }

  function getHitPopupAccent(type) {
    return {
      perfect: "#8ff7ff",
      tspin: "#8ff7ff",
      spin: "#8ff7ff",
      b2b: "#d7c2ff",
      combo: "#ffb7ff",
      tetris: "#fff0a6",
      lineClear: "#8ff7ff",
    }[type] || "#8ff7ff";
  }

  function getCombatPopupAnchor(type) {
    const x = boardX - 104;
    const baseY = boardY + 404;
    return {
      x,
      y: baseY + ({
        perfect: -120,
        tspin: -56,
        spin: -48,
        b2b: -34,
        combo: -18,
        tetris: -8,
        lineClear: 0,
      }[type] || 0),
    };
  }

  function getHitPopupScale(type, combo = 0) {
    if (type === "perfect") return 1.18;
    if (type === "tspin") return 1.06;
    if (type === "spin" || type === "b2b") return 1;
    if (type === "combo") return 0.98 + Math.min(0.2, combo * 0.026);
    if (type === "tetris") return 1.02;
    return 0.92;
  }

  function getHitPopupLife(type) {
    return {
      perfect: 1240,
      tspin: 1120,
      spin: 1020,
      b2b: 1040,
      combo: 980,
      tetris: 920,
      lineClear: 820,
    }[type] || 900;
  }

  function buildOperationReadout(lines, pieceType, spinType, meta = {}) {
    if (lines <= 0) return null;
    const title = getOperationTitle(lines, pieceType, spinType, meta.perfect);
    const color = meta.perfect
      ? "#fff0a6"
      : spinType
        ? "#d7c2ff"
        : lines >= 4
          ? "#9df7da"
          : lines >= 2
            ? "#f5f1e6"
            : "#b9c2ff";
    return {
      title,
      combo: meta.combo || 0,
      b2b: Boolean(meta.b2b),
      effectiveLines: meta.effectiveLines || lines,
      damage: meta.damage || 0,
      equation: meta.breakdown
        ? buildDamageEquation(meta.breakdown, { translate, compact: true })
        : "",
      color,
      life: 1650,
      duration: 1650,
    };
  }

  function buildCombatPopup(lines, pieceType, spinType, meta = {}) {
    const combo = meta.combo || 0;
    const b2b = Boolean(meta.b2b);
    const perfect = Boolean(meta.perfect);
    const type = getPopupType(lines, spinType, { combo, b2b, perfect });
    const life = perfect ? 1240 : getHitPopupLife(type);
    return {
      ...getCombatPopupAnchor(type),
      text: getHitBreakdownTitle(lines, pieceType, spinType, { combo, b2b, perfect }),
      subText: meta.damage ? `${meta.damage} ${translate("dmgShort")}` : "",
      color: perfect ? "#fff0a6" : getHitPopupColor(type, lines, combo),
      accent: perfect ? "#8ff7ff" : getHitPopupAccent(type),
      scale: perfect ? 1.18 : getHitPopupScale(type, combo),
      type,
      life,
      maxLife: life,
      seed: random() * 1000,
    };
  }

  return {
    buildCombatPopup,
    buildOperationReadout,
    getOperationTitle,
  };
}
