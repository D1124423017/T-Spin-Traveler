export function getUpgradeOverlayPanelRect() {
  return { x: 238, y: 126, w: 804, h: 546 };
}

export function getUpgradeCardRect(index) {
  const w = 232;
  const gap = 28;
  return { x: 280 + index * (w + gap), y: 262, w, h: 348 };
}

export function getUpgradeCardContentLayout(card) {
  return {
    badge: { x: card.x + 25, y: card.y + 18, w: 88, h: 23 },
    icon: { x: card.x + card.w / 2, y: card.y + 88, size: 68 },
    title: { x: card.x + 28, y: card.y + 154, w: card.w - 56, lineH: 19, size: 16 },
    tags: { x: card.x + 28, y: card.y + 203, w: card.w - 56 },
    divider: { x: card.x + 28, y: card.y + 234, w: card.w - 56 },
    desc: { x: card.x + 28, y: card.y + 252, w: card.w - 56, lineH: 15, size: 11 },
    trait: { x: card.x + 24, y: card.y + card.h - 58, w: card.w - 48, h: 36 },
  };
}

export function getCurrentBuildButtonRect() {
  return { x: 790, y: 216, w: 166, h: 36 };
}

export function getCurrentBuildPanelRect() {
  return { x: 190, y: 82, w: 900, h: 560 };
}

export function getCurrentBuildCloseRect() {
  const panel = getCurrentBuildPanelRect();
  return { x: panel.x + panel.w - 178, y: panel.y + 34, w: 132, h: 38 };
}
