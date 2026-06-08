export function createBattleFeedbackController({
  state,
  translate,
  format,
  positions,
  buildOperationReadout,
  buildCombatPopup,
  showComboFeedback,
  showB2BFeedback,
  showTSpinFeedback,
  showPerfectClearFeedback,
  showDamageNumber,
}) {
  function showEnemyDamageFeedback(amount, {
    duration = 220,
    intensity = 1.08,
  } = {}) {
    state.enemyHit = Math.max(state.enemyHit, duration);
    state.enemyHitIntensity = Math.max(state.enemyHitIntensity, intensity);
    showDamageNumber({
      amount,
      position: positions.damage,
    });
  }

  function showPlayerDamageFeedback(hit) {
    const damageTier = Math.min(1.8, Math.max(0.35, hit.damage / 72));
    const specialTier = hit.context?.perfect
      ? 2.4
      : hit.context?.spinType
        ? 1.65
        : hit.b2bHit
          ? 1.35
          : hit.comboBurst
            ? 1.22
            : hit.context?.lines >= 4
              ? 1.18
              : 0.82;
    const intensity = Math.min(2.6, Math.max(damageTier, specialTier));
    showEnemyDamageFeedback(hit.damage, {
      duration: 230 + intensity * 110,
      intensity,
    });
  }

  function addCombatPopup(popup) {
    state.combatPopups.unshift(popup);
    state.combatPopups = state.combatPopups.slice(0, 5);
  }

  function pushOperationReadout(lines, pieceType, spinType, meta = {}) {
    const readout = buildOperationReadout(lines, pieceType, spinType, meta);
    if (!readout) return;
    state.operationReadouts.unshift(readout);
    state.operationReadouts = state.operationReadouts.slice(0, 4);
    addCombatPopup(buildCombatPopup(lines, pieceType, spinType, meta));
  }

  function showBattleClearFeedback(result) {
    if (!result || result.lines <= 0) return;
    const comboCount = result.context?.combo || 0;
    if (comboCount >= 2) {
      showComboFeedback({
        combo: comboCount,
        label: format("floaterCombo", { combo: comboCount }),
        subtitle: result.damage > 0 ? `${result.damage} ${translate("dmgShort")}` : "",
        position: positions.combo,
      });
    }

    const isDifficultClear = result.lines === 4 || Boolean(result.spinType);
    if (isDifficultClear && state.b2bActive) {
      showB2BFeedback({
        chain: state.b2bChain,
        label: state.b2bChain > 1
          ? format("b2bChain", { count: state.b2bChain })
          : translate("b2bReady"),
        subtitle: result.damage > 0 ? `${result.damage} ${translate("dmgShort")}` : "",
        position: positions.b2b,
      });
    }

    const isTSpin = result.pieceType === "T"
      && (result.spinType === "full" || result.spinType === "mini");
    if (isTSpin) {
      showTSpinFeedback({
        spinType: result.spinType,
        label: result.spinType === "mini"
          ? translate("hitTSpinMini")
          : translate("hitTSpin"),
        subtitle: result.damage > 0 ? `${result.damage} ${translate("dmgShort")}` : "",
        position: positions.tspin,
      });
    }

    if (result.context?.perfect) {
      showPerfectClearFeedback({
        label: translate("perfectClearTitle"),
        subtitle: result.damage > 0 ? `${result.damage} ${translate("dmgShort")}` : "",
        position: positions.perfect,
      });
    }
  }

  return {
    addCombatPopup,
    pushOperationReadout,
    showBattleClearFeedback,
    showEnemyDamageFeedback,
    showPlayerDamageFeedback,
  };
}
