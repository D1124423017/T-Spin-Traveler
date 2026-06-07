export const UPGRADE_CARD_ASSET_SIZE = Object.freeze({ w: 1024, h: 1536 });

export const UPGRADE_CARD_SAFE_ZONES = Object.freeze({
  badge: Object.freeze({ x: 90, y: 70, w: 300, h: 80 }),
  portrait: Object.freeze({ x: 120, y: 70, w: 784, h: 430 }),
  title: Object.freeze({ x: 120, y: 900, w: 784, h: 96 }),
  tags: Object.freeze({ x: 120, y: 1034, w: 784, h: 78 }),
  desc: Object.freeze({ x: 120, y: 1160, w: 784, h: 110 }),
  trait: Object.freeze({ x: 120, y: 1318, w: 784, h: 84 }),
});

export const SPECIAL_UPGRADE_CARD_SAFE_ZONES = Object.freeze({
  badge: UPGRADE_CARD_SAFE_ZONES.badge,
  portrait: Object.freeze({ x: 120, y: 70, w: 784, h: 560 }),
  title: Object.freeze({ x: 120, y: 1020, w: 784, h: 76 }),
  tags: Object.freeze({ x: 120, y: 1132, w: 784, h: 70 }),
  desc: Object.freeze({ x: 120, y: 1228, w: 784, h: 72 }),
  trait: Object.freeze({ x: 120, y: 1352, w: 784, h: 72 }),
});

const UPGRADE_CARD_TEXT_FRAME_ZONE = Object.freeze({ x: 148, y: 850, w: 728, h: 338 });
const SPECIAL_UPGRADE_CARD_TEXT_FRAME_ZONE = Object.freeze({ x: 138, y: 930, w: 748, h: 300 });

function scaleCardZone(card, zone) {
  const sx = card.w / UPGRADE_CARD_ASSET_SIZE.w;
  const sy = card.h / UPGRADE_CARD_ASSET_SIZE.h;
  return {
    x: Math.round(card.x + zone.x * sx),
    y: Math.round(card.y + zone.y * sy),
    w: Math.round(zone.w * sx),
    h: Math.round(zone.h * sy),
  };
}

export function clampUpgradeSelectionIndex(index, choiceCount) {
  const count = Math.max(0, Math.trunc(Number(choiceCount) || 0));
  if (count <= 0) return 0;
  const value = Math.trunc(Number(index) || 0);
  return Math.min(count - 1, Math.max(0, value));
}

export function getNextUpgradeSelectionIndex(currentIndex, direction, choiceCount) {
  const step = Math.sign(Number(direction) || 0);
  return clampUpgradeSelectionIndex(currentIndex + step, choiceCount);
}

export function getUpgradeOverlayPanelRect() {
  return { x: 198, y: 118, w: 934, h: 548 };
}

export function getUpgradeDraftLayout() {
  const panel = getUpgradeOverlayPanelRect();
  return {
    panel,
    title: { x: panel.x + 62, y: panel.y + 62, w: 530, size: 36 },
    bondSummary: { x: panel.x + 486, y: panel.y + 56 },
    selectedDetail: getUpgradeSelectedDetailRect(),
    detailToggle: getUpgradeDetailToggleRect(),
    buildButton: getCurrentBuildButtonRect(),
    help: { x: panel.x + 64, y: panel.y + panel.h + 29, w: panel.w - 128, size: 12 },
  };
}

export function getUpgradeCardRect(index) {
  const panel = getUpgradeOverlayPanelRect();
  const w = 240;
  const h = 360;
  const gap = 34;
  const totalW = w * 3 + gap * 2;
  const startX = panel.x + (panel.w - totalW) / 2;
  return { x: startX + index * (w + gap), y: panel.y + 82, w, h };
}

export function getUpgradeSelectedDetailRect() {
  const panel = getUpgradeOverlayPanelRect();
  return { x: panel.x + 64, y: panel.y + 444, w: panel.w - 128, h: 90 };
}

export function getUpgradeDetailToggleRect() {
  const detail = getUpgradeSelectedDetailRect();
  return { x: detail.x + detail.w - 130, y: detail.y + 27, w: 108, h: 36 };
}

export function getUpgradeCardContentLayout(card, variant = "default") {
  const zones = variant === "special" ? SPECIAL_UPGRADE_CARD_SAFE_ZONES : UPGRADE_CARD_SAFE_ZONES;
  const badge = scaleCardZone(card, zones.badge);
  const portrait = scaleCardZone(card, zones.portrait);
  const title = scaleCardZone(card, zones.title);
  const textFrame = scaleCardZone(card, variant === "special" ? SPECIAL_UPGRADE_CARD_TEXT_FRAME_ZONE : UPGRADE_CARD_TEXT_FRAME_ZONE);
  const trait = scaleCardZone(card, zones.trait);
  const isSpecial = variant === "special";
  const titleText = { x: title.x, y: title.y + 7, w: title.w, lineH: 14, size: 13, maxLines: 2 };
  const tagsText = { x: textFrame.x, y: textFrame.y + (isSpecial ? 2 : 0), w: textFrame.w, maxTags: 3 };
  const descText = {
    x: textFrame.x,
    y: textFrame.y + (isSpecial ? 39 : 44),
    w: textFrame.w,
    lineH: isSpecial ? 14 : 15,
    size: isSpecial ? 11 : 12,
    maxLines: 2,
  };
  const traitHint = { x: trait.x, y: trait.y, w: trait.w, h: Math.max(34, trait.h) };
  return {
    badge: { ...badge, h: Math.max(22, badge.h) },
    portrait,
    title: titleText,
    tags: tagsText,
    divider: { x: textFrame.x, y: descText.y - 10, w: textFrame.w },
    desc: descText,
    trait: traitHint,
    panels: {
      tags: { x: tagsText.x - 6, y: tagsText.y - 4, w: tagsText.w + 12, h: 28 },
      desc: {
        x: descText.x - 7,
        y: descText.y - 7,
        w: descText.w + 14,
        h: descText.lineH * descText.maxLines + 15,
      },
    },
  };
}

export function getCurrentBuildButtonRect() {
  const panel = getUpgradeOverlayPanelRect();
  return { x: panel.x + panel.w - 190, y: panel.y + 52, w: 150, h: 36 };
}

export function getCurrentBuildPanelRect() {
  return { x: 190, y: 82, w: 900, h: 560 };
}

export function getCurrentBuildCloseRect() {
  const panel = getCurrentBuildPanelRect();
  return { x: panel.x + panel.w - 178, y: panel.y + 34, w: 132, h: 38 };
}
