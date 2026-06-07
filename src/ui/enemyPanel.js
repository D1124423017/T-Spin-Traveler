import {
  clamp,
  hexToRgba,
} from "../render/drawUtils.js";

export function createEnemyPanelRenderer({
  ctx,
  state,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  roundedRect,
  getEnemyAttackGarbagePreview,
  getBossPhase,
  enemyWeaknessToken,
} = {}) {
function drawEnemyBehaviorChips(x, y, enemy, w = 294) {
  const chips = [
    { label: t("boardEffectShort"), value: t(`special.${enemy.id}`), color: enemy.color },
    { label: t("weakShort"), value: enemyWeaknessToken(enemy), color: "#fff0a6" },
  ];
  ctx.save();
  const gap = 8;
  const chipW = (w - gap) / 2;
  for (let i = 0; i < chips.length; i += 1) {
    const chip = chips[i];
    const cy = y;
    const cx = x + i * (chipW + gap);
    ctx.fillStyle = "rgba(7, 10, 16, 0.5)";
    roundedRect(cx, cy, chipW, 27, 7, true, false);
    ctx.strokeStyle = hexToRgba(chip.color.startsWith("#") ? chip.color : "#8fe8dc", 0.22);
    roundedRect(cx, cy, chipW, 27, 7, false, true);
    label(String(chip.label).toUpperCase(), cx + 9, cy + 11, 8, "rgba(238,244,252,0.48)");
    fitLabel(String(chip.value), cx + 9, cy + 22, chipW - 18, 11, chip.color, 9, "800");
  }
  ctx.restore();
}

function drawBossPhaseBar(x, y) {
  const phase = getBossPhase();
  const ratio = state.enemyMaxHp ? clamp(1 - state.enemyHp / state.enemyMaxHp, 0, 1) : 0;
  ctx.save();
  label(`${t("bossPhaseBar").toUpperCase()} P${phase}`, x, y - 2, 10, "#fff0a6");
  ctx.fillStyle = "rgba(8, 13, 20, 0.68)";
  roundedRect(x + 104, y - 11, 126, 7, 4, true, false);
  const g = ctx.createLinearGradient(x + 104, y - 11, x + 230, y - 11);
  g.addColorStop(0, "#9df7da");
  g.addColorStop(0.5, "#fff0a6");
  g.addColorStop(1, "#ff7782");
  ctx.fillStyle = g;
  roundedRect(x + 104, y - 11, 126 * ratio, 7, 4, true, false);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.24)";
  roundedRect(x + 104, y - 11, 126, 7, 4, false, true);
  for (const marker of [0.3, 0.6, 0.8]) {
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fillRect(x + 104 + 126 * marker, y - 13, 1, 11);
  }
  ctx.restore();
}

function getEnemyIntent(enemy) {
  const garbage = getEnemyAttackGarbagePreview(enemy);
  const cancelText = garbage > 0 ? t("enemyCancelable") : "-";
  const icon = {
    slime: "!",
    vine: "G",
    mushroom: "N",
    beetle: "A",
    mist: "?",
    thorn: "X",
    wisp: "*",
    sentinel: "S",
    king: "B",
  }[enemy.id] || "!";
  if (enemy.id === "mushroom") {
    return { icon, title: t("intentSporeHex"), detail: `${fmt("intentSporeHexDetail", { damage: state.enemyAttackDamage })} / ${cancelText}`, color: "#77e8ff" };
  }
  if (enemy.id === "beetle") {
    return { icon, title: t("intentArmorCrush"), detail: `${fmt("intentArmorCrushDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#c6b38a" };
  }
  if (enemy.id === "thorn") {
    return { icon, title: t("intentDashSlash"), detail: `${fmt("intentDashSlashDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#b174ff" };
  }
  if (enemy.id === "wisp") {
    return { icon, title: t("intentHomingBolt"), detail: fmt("intentHomingBoltDetail", { damage: state.enemyAttackDamage }), color: "#c7a7ff" };
  }
  if (enemy.id === "sentinel") {
    return { icon, title: t("intentGroundSlam"), detail: `${fmt("intentGroundSlamDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#d7c28f" };
  }
  if (enemy.id === "king") {
    return { icon, title: fmt("intentBossPhase", { phase: getBossPhase() }), detail: `${fmt("intentBossPhaseDetail", { damage: state.enemyAttackDamage })} / +${garbage}`, color: "#f1d36b" };
  }
  if (garbage > 0) {
    return { icon, title: t("intentGarbageSurge"), detail: `${fmt("intentGarbageSurgeDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#c9d4da" };
  }
  return { icon, title: t("intentStrike"), detail: fmt("intentStrikeDetail", { damage: state.enemyAttackDamage }), color: "#98f07e" };
}

function drawEnemyIntent(x, y, intent, w = 294) {
  const enemy = state.enemyType;
  const garbage = getEnemyAttackGarbagePreview(enemy);
  const h = 92;
  const danger = state.enemyCountdown <= 1;
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.44)";
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = hexToRgba(intent.color, 0.36);
  ctx.lineWidth = 1.5;
  roundedRect(x, y, w, h, 8, false, true);
  ctx.fillStyle = hexToRgba(intent.color, 0.22);
  roundedRect(x + 12, y + 14, 34, 38, 7, true, false);
  ctx.strokeStyle = hexToRgba(intent.color, 0.48);
  roundedRect(x + 12, y + 14, 34, 38, 7, false, true);
  ctx.font = canvasFont("900", 18, intent.icon || "!");
  ctx.fillStyle = intent.color;
  ctx.textAlign = "center";
  ctx.fillText(intent.icon || "!", x + 29, y + 39);
  ctx.textAlign = "left";
  label(t("enemyIntent").toUpperCase(), x + 58, y + 25, 10, "rgba(238,244,252,0.48)");
  fitLabel(intent.title, x + 58, y + 45, w - 74, 15, intent.color, 11, "900");

  const gap = 6;
  const pillW = (w - 24 - gap * 2) / 3;
  const pillY = y + 60;
  drawIntentPill(x + 12, pillY, pillW, `${t("intentAttackLabel")} ${state.enemyAttackDamage}`, "#ffb7bd", true);
  drawIntentPill(x + 12 + pillW + gap, pillY, pillW, fmt("turnsLater", { count: state.enemyCountdown }), danger ? "#ff7782" : "#98f07e", danger);
  drawIntentPill(x + 12 + (pillW + gap) * 2, pillY, pillW, `${t("intentGarbageLabel")} +${garbage}`, garbage > 0 ? "#c9d4da" : "rgba(238,244,252,0.56)");
  ctx.restore();
}

function drawIntentPill(x, y, w, text, color, emphasis = false) {
  const accent = color.startsWith("#") ? color : "#dce8ee";
  ctx.save();
  ctx.fillStyle = hexToRgba(accent, emphasis ? 0.16 : 0.09);
  roundedRect(x, y, w, 22, 6, true, false);
  ctx.strokeStyle = hexToRgba(accent, emphasis ? 0.32 : 0.16);
  roundedRect(x, y, w, 22, 6, false, true);
  ctx.textBaseline = "middle";
  fitLabel(String(text), x + 8, y + 12, w - 16, 12, color, 9, "800");
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

  return {
    drawBossPhaseBar,
    drawEnemyBehaviorChips,
    drawEnemyIntent,
    getEnemyIntent,
  };
}
