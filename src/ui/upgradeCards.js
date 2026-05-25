export function getUpgradeOverlayPanelRect() {
  return { x: 198, y: 118, w: 934, h: 548 };
}

export function getUpgradeDraftLayout() {
  const panel = getUpgradeOverlayPanelRect();
  return {
    panel,
    title: { x: panel.x + 62, y: panel.y + 90, w: 470, size: 34 },
    detail: { x: panel.x + 64, y: panel.y + 122, w: 560, lineH: 18, size: 15 },
    safeHint: { x: panel.x + 64, y: panel.y + 164, w: 360, size: 12 },
    buildButton: getCurrentBuildButtonRect(),
    buildRail: { x: panel.x + 768, y: panel.y + 206, w: 148, h: 312 },
    help: { x: panel.x + 64, y: panel.y + panel.h - 28, w: 470, size: 13 },
  };
}

export function getUpgradeCardRect(index) {
  const w = 214;
  const gap = 26;
  return { x: 250 + index * (w + gap), y: 282, w, h: 344 };
}

export function getUpgradeCardContentLayout(card) {
  return {
    badge: { x: card.x + 22, y: card.y + 16, w: 82, h: 22 },
    icon: { x: card.x + card.w / 2, y: card.y + 86, size: 62 },
    title: { x: card.x + 24, y: card.y + 148, w: card.w - 48, lineH: 18, size: 15 },
    tags: { x: card.x + 24, y: card.y + 204, w: card.w - 48 },
    divider: { x: card.x + 24, y: card.y + 234, w: card.w - 48 },
    desc: { x: card.x + 24, y: card.y + 252, w: card.w - 48, lineH: 16, size: 12 },
    trait: { x: card.x + 20, y: card.y + card.h - 48, w: card.w - 40, h: 34 },
  };
}

export function getCurrentBuildButtonRect() {
  const panel = getUpgradeOverlayPanelRect();
  return { x: panel.x + 768, y: panel.y + 156, w: 148, h: 36 };
}

export function getCurrentBuildPanelRect() {
  return { x: 190, y: 82, w: 900, h: 560 };
}

export function getCurrentBuildCloseRect() {
  const panel = getCurrentBuildPanelRect();
  return { x: panel.x + panel.w - 178, y: panel.y + 34, w: 132, h: 38 };
}
