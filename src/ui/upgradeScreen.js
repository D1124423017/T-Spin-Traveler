import { SPECIAL_UPGRADE_FAMILIES } from "../combat/specialUpgrades.js";
import {
  OVERLAY_READABILITY,
  hexToRgba,
  pointInRect,
} from "../render/drawUtils.js";
import {
  getUpgradeCardRect,
  getUpgradeDraftLayout,
} from "./upgradeCards.js";
import {
  getUpgradeCardMotion,
  getUpgradeDetailMotion,
  getUpgradeOverlayMotion,
} from "./upgradeMotion.js";
import { createCurrentBuildPanelRenderer } from "./currentBuildPanel.js";
import { createUpgradeCardRenderer } from "./upgradeCardRenderer.js";
import { createUpgradeUiPrimitives } from "./upgradeUiPrimitives.js";

export function createUpgradeScreenRenderer(deps = {}) {
  const {
    ctx,
    state,
    t,
    fitLabel,
    roundedRect,
    drawDimOverlay,
    drawCard,
    drawMenuButton,
    getSpecialBondCountsForRun,
    prefersReducedMotion,
  } = deps;
  const primitives = createUpgradeUiPrimitives(deps);
  const cardRenderer = createUpgradeCardRenderer({
    ...deps,
    primitives,
  });
  const currentBuildRenderer = createCurrentBuildPanelRenderer({
    ...deps,
    primitives,
    getRarityVisual: cardRenderer.getRarityVisual,
  });
  const {
    drawUpgradeChoiceCard,
    drawUpgradeMotionHint,
    drawUpgradeMotionTitle,
    drawUpgradeSelectedDetail,
    getRarityVisual,
    getUpgradeCardAccentVisual,
    getSpecialUpgradeCardFrame,
  } = cardRenderer;
  const {
    drawCurrentBuildPanel,
  } = currentBuildRenderer;

function drawSpecialBondProgressSummary(x, y) {
  const counts = getSpecialBondCountsForRun();
  drawSpecialBondChip(SPECIAL_UPGRADE_FAMILIES.angel, counts.angel, x, y);
  drawSpecialBondChip(SPECIAL_UPGRADE_FAMILIES.devil, counts.devil, x + 128, y);
}

function drawSpecialBondChip(family, count, x, y) {
  const w = 116;
  const h = 28;
  const active = count > 0;
  ctx.save();
  ctx.fillStyle = active ? hexToRgba(family.color, 0.18) : "rgba(238,244,252,0.06)";
  roundedRect(x, y, w, h, 9, true, false);
  ctx.strokeStyle = active ? hexToRgba(family.color, 0.46) : "rgba(238,244,252,0.13)";
  ctx.lineWidth = active ? 1.2 : 1;
  roundedRect(x, y, w, h, 9, false, true);
  fitLabel(`${t(family.labelKey)} ${count}/3`, x + 10, y + 18, 58, 11, active ? family.color : "rgba(238,244,252,0.54)", 8, "900", true);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < count ? family.color : "rgba(238,244,252,0.18)";
    roundedRect(x + 73 + i * 11, y + 10, 7, 7, 3, true, false);
  }
  ctx.restore();
}

function drawUpgradeOverlay() {
  ctx.save();
  const now = performance.now();
  const reducedMotion = prefersReducedMotion();
  const motionState = state.upgradeMotion || {
    openedAt: now,
    selectedAt: now,
    selectedIndex: state.upgradeSelectedIndex,
  };
  const overlayMotion = getUpgradeOverlayMotion({
    now,
    openedAt: motionState.openedAt,
    reducedMotion,
  });
  drawDimOverlay(OVERLAY_READABILITY.scrim.upgrade);
  ctx.save();
  ctx.globalAlpha *= overlayMotion.alpha;
  ctx.translate(0, overlayMotion.y);
  const draftLayout = getUpgradeDraftLayout();
  const panel = draftLayout.panel;
  drawCard(panel.x, panel.y, panel.w, panel.h);
  drawUpgradeMotionTitle(t("relicDraft").toUpperCase(), draftLayout.title, now, overlayMotion.glow);
  drawSpecialBondProgressSummary(draftLayout.bondSummary.x, draftLayout.bondSummary.y);
  const buildButton = draftLayout.buildButton;
  drawMenuButton(buildButton.x, buildButton.y, buildButton.w, buildButton.h, t("currentBuild"), "");
  for (let i = 0; i < 3; i += 1) {
    const upgrade = state.upgradeChoices[i];
    if (!upgrade) continue;
    const rarity = getRarityVisual(upgrade.rarity);
    const card = getUpgradeCardRect(i);
    const hovered = !state.upgradePickConfirm && pointInRect(state.pointer.x, state.pointer.y, card.x, card.y, card.w, card.h);
    const selected = !state.upgradePickConfirm && state.upgradeSelectedIndex === i;
    const dimmed = state.upgradePickConfirm && state.upgradePickConfirm.index !== i;
    const specialFrame = getSpecialUpgradeCardFrame(upgrade);
    const cardMotion = getUpgradeCardMotion({
      now,
      openedAt: motionState.openedAt,
      selectedAt: motionState.selectedIndex === i ? motionState.selectedAt : motionState.openedAt,
      index: i,
      selected,
      hovered,
      dimmed,
      confirming: state.upgradePickConfirm?.index === i,
      confirmElapsed: state.upgradePickConfirm?.elapsed || 0,
      confirmDuration: state.upgradePickConfirm?.duration || 1,
      reducedMotion,
    });
    drawUpgradeChoiceCard({
      upgrade,
      card,
      rarity,
      hovered,
      selected,
      active: hovered || selected || state.upgradePickConfirm?.index === i,
      specialFrame,
      layoutVariant: specialFrame ? "special" : "default",
      motion: cardMotion,
      pickNumber: i + 1,
    });
  }
  const selectedUpgrade = state.upgradeChoices[state.upgradeSelectedIndex];
  if (selectedUpgrade) {
    drawUpgradeSelectedDetail(
      selectedUpgrade,
      draftLayout.selectedDetail,
      getUpgradeCardAccentVisual(selectedUpgrade, getRarityVisual(selectedUpgrade.rarity)),
      getUpgradeDetailMotion({
        now,
        selectedAt: motionState.selectedAt,
        reducedMotion,
      }),
      {
        expanded: state.upgradeDetailOpen,
        toggleRect: draftLayout.detailToggle,
      },
    );
  }
  drawUpgradeMotionHint(t("upgradeHelp"), draftLayout.help, now, overlayMotion.glow);
  ctx.restore();
  if (state.currentBuildOpen) drawCurrentBuildPanel();
  ctx.restore();
}

  return {
    drawUpgradeOverlay,
  };
}
