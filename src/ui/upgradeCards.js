export const UPGRADE_CARD_ASSET_SIZE = Object.freeze({ w: 1024, h: 1536 });

export const UPGRADE_CARD_SAFE_ZONES = Object.freeze({
  badge: Object.freeze({ x: 90, y: 70, w: 300, h: 80 }),
  skull: Object.freeze({ x: 362, y: 110, w: 300, h: 260 }),
  icon: Object.freeze({ x: 748, y: 848, w: 150, h: 150 }),
  title: Object.freeze({ x: 145, y: 852, w: 580, h: 95 }),
  tags: Object.freeze({ x: 145, y: 960, w: 734, h: 78 }),
  desc: Object.freeze({ x: 145, y: 1045, w: 734, h: 210 }),
  trait: Object.freeze({ x: 145, y: 1340, w: 734, h: 72 }),
});

export const SPECIAL_UPGRADE_CARD_SAFE_ZONES = Object.freeze({
  badge: UPGRADE_CARD_SAFE_ZONES.badge,
  skull: UPGRADE_CARD_SAFE_ZONES.skull,
  icon: Object.freeze({ x: 748, y: 1004, w: 150, h: 150 }),
  title: Object.freeze({ x: 145, y: 1000, w: 580, h: 68 }),
  tags: Object.freeze({ x: 145, y: 1078, w: 734, h: 70 }),
  desc: Object.freeze({ x: 145, y: 1155, w: 734, h: 138 }),
  trait: Object.freeze({ x: 145, y: 1368, w: 734, h: 64 }),
});

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

function expandRect(rect, xPad, yPad, minH = 0) {
  return {
    x: rect.x - xPad,
    y: rect.y - yPad,
    w: rect.w + xPad * 2,
    h: Math.max(minH, rect.h + yPad * 2),
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
    title: { x: panel.x + 62, y: panel.y + 82, w: 530, size: 34 },
    detail: { x: panel.x + 64, y: panel.y + 116, w: 590, lineH: 18, size: 14 },
    safeHint: { x: panel.x + 64, y: panel.y + 156, w: 360, size: 12 },
    buildButton: getCurrentBuildButtonRect(),
    help: { x: panel.x + 64, y: panel.y + panel.h - 22, w: 470, size: 12 },
  };
}

export function getUpgradeCardRect(index) {
  const panel = getUpgradeOverlayPanelRect();
  const w = 246;
  const h = 369;
  const gap = 34;
  const totalW = w * 3 + gap * 2;
  const startX = panel.x + (panel.w - totalW) / 2;
  return { x: startX + index * (w + gap), y: panel.y + 128, w, h };
}

export function getUpgradeCardContentLayout(card, variant = "default") {
  const zones = variant === "special" ? SPECIAL_UPGRADE_CARD_SAFE_ZONES : UPGRADE_CARD_SAFE_ZONES;
  const badge = scaleCardZone(card, zones.badge);
  const icon = scaleCardZone(card, zones.icon);
  const title = scaleCardZone(card, zones.title);
  const tags = scaleCardZone(card, zones.tags);
  const desc = scaleCardZone(card, zones.desc);
  const trait = scaleCardZone(card, zones.trait);
  const titleText = { x: title.x, y: title.y + 7, w: title.w, lineH: 15, size: 13, maxLines: 2 };
  const tagsText = { x: tags.x, y: tags.y + 4, w: tags.w, maxTags: 2 };
  const descText = { x: desc.x, y: desc.y + 7, w: desc.w, lineH: 12, size: 10, maxLines: variant === "special" ? 3 : 4 };
  const traitHint = { x: trait.x, y: trait.y, w: trait.w, h: Math.max(34, trait.h) };
  return {
    badge: { ...badge, h: Math.max(22, badge.h) },
    icon: { x: icon.x + icon.w / 2, y: icon.y + icon.h / 2, size: Math.round(Math.min(icon.w, icon.h) * 0.78) },
    title: titleText,
    tags: tagsText,
    divider: { x: desc.x, y: desc.y - 10, w: desc.w },
    desc: descText,
    trait: traitHint,
    panels: {
      title: expandRect({ x: title.x, y: title.y + 3, w: title.w, h: title.h - 4 }, 8, 4, 44),
      tags: expandRect({ x: tags.x, y: tags.y + 1, w: tags.w, h: tags.h - 3 }, 8, 3, 28),
      desc: expandRect({ x: desc.x, y: desc.y + 4, w: desc.w, h: desc.h - 8 }, 8, 4, variant === "special" ? 46 : 58),
      trait: expandRect(traitHint, 4, 3, 40),
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
