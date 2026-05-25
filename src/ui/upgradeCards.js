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
  const w = 226;
  const h = 352;
  const gap = 44;
  const totalW = w * 3 + gap * 2;
  const startX = panel.x + (panel.w - totalW) / 2;
  return { x: startX + index * (w + gap), y: panel.y + 142, w, h };
}

export function getUpgradeCardContentLayout(card) {
  return {
    badge: { x: card.x + 22, y: card.y + 18, w: 86, h: 22 },
    icon: { x: card.x + card.w / 2, y: card.y + 78, size: 56 },
    title: { x: card.x + 24, y: card.y + 124, w: card.w - 48, lineH: 17, size: 14, maxLines: 2 },
    tags: { x: card.x + 24, y: card.y + 178, w: card.w - 48, maxTags: 2 },
    divider: { x: card.x + 24, y: card.y + 212, w: card.w - 48 },
    desc: { x: card.x + 24, y: card.y + 230, w: card.w - 48, lineH: 15, size: 11, maxLines: 4 },
    trait: { x: card.x + 18, y: card.y + card.h - 54, w: card.w - 36, h: 38 },
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
