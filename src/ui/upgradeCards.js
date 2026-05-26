export const UPGRADE_CARD_ASSET_SIZE = Object.freeze({ w: 1024, h: 1536 });

export const UPGRADE_CARD_SAFE_ZONES = Object.freeze({
  badge: Object.freeze({ x: 90, y: 70, w: 300, h: 80 }),
  skull: Object.freeze({ x: 362, y: 110, w: 300, h: 260 }),
  icon: Object.freeze({ x: 382, y: 250, w: 260, h: 260 }),
  title: Object.freeze({ x: 120, y: 545, w: 784, h: 130 }),
  tags: Object.freeze({ x: 120, y: 700, w: 784, h: 90 }),
  desc: Object.freeze({ x: 120, y: 820, w: 784, h: 390 }),
  trait: Object.freeze({ x: 110, y: 1270, w: 804, h: 120 }),
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
    help: { x: panel.x + 64, y: panel.y + panel.h - 28, w: 470, size: 13 },
  };
}

export function getUpgradeCardRect(index) {
  const panel = getUpgradeOverlayPanelRect();
  const w = 232;
  const h = 348;
  const gap = 44;
  const totalW = w * 3 + gap * 2;
  const startX = panel.x + (panel.w - totalW) / 2;
  return { x: startX + index * (w + gap), y: panel.y + 142, w, h };
}

export function getUpgradeCardContentLayout(card) {
  const badge = scaleCardZone(card, UPGRADE_CARD_SAFE_ZONES.badge);
  const icon = scaleCardZone(card, UPGRADE_CARD_SAFE_ZONES.icon);
  const title = scaleCardZone(card, UPGRADE_CARD_SAFE_ZONES.title);
  const tags = scaleCardZone(card, UPGRADE_CARD_SAFE_ZONES.tags);
  const desc = scaleCardZone(card, UPGRADE_CARD_SAFE_ZONES.desc);
  const trait = scaleCardZone(card, UPGRADE_CARD_SAFE_ZONES.trait);
  return {
    badge,
    icon: { x: icon.x + icon.w / 2, y: icon.y + icon.h / 2, size: Math.round(Math.min(icon.w, icon.h) * 0.86) },
    title: { x: title.x, y: title.y + 8, w: title.w, lineH: 16, size: 14, maxLines: 2 },
    tags: { x: tags.x, y: tags.y + 4, w: tags.w, maxTags: 2 },
    divider: { x: desc.x, y: desc.y - 10, w: desc.w },
    desc: { x: desc.x, y: desc.y + 8, w: desc.w, lineH: 14, size: 11, maxLines: 5 },
    trait: { x: trait.x, y: trait.y, w: trait.w, h: Math.max(30, trait.h) },
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
