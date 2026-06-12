import {
  EQUIPMENT_FILTER_ORDER,
  EQUIPMENT_SLOT_ORDER,
} from "../data/equipment.js";

export const EQUIPMENT_INVENTORY_LAYOUT = Object.freeze({
  title: Object.freeze({ x: 42, y: 28, w: 640, h: 58 }),
  backButton: Object.freeze({ x: 1084, y: 28, w: 156, h: 42 }),
  heroStage: Object.freeze({ x: 38, y: 100, w: 326, h: 558 }),
  heroImage: Object.freeze({ x: 55, y: 126, w: 292, h: 486 }),
  equipped: Object.freeze({ x: 388, y: 94, w: 852, h: 134 }),
  filters: Object.freeze({ x: 388, y: 246, w: 536, h: 42 }),
  rouletteButton: Object.freeze({ x: 1010, y: 244, w: 230, h: 46 }),
  inventory: Object.freeze({ x: 388, y: 306, w: 538, h: 350 }),
  details: Object.freeze({ x: 944, y: 306, w: 296, h: 350 }),
  equipButton: Object.freeze({ x: 970, y: 602, w: 244, h: 46 }),
  controlsHint: Object.freeze({ x: 388, y: 684, w: 852, h: 18 }),
});

export const EQUIPMENT_ROULETTE_LAYOUT = Object.freeze({
  title: Object.freeze({ x: 44, y: 28, w: 650, h: 58 }),
  backButton: Object.freeze({ x: 1060, y: 28, w: 180, h: 42 }),
  wheel: Object.freeze({ cx: 342, cy: 382, radius: 292 }),
  wheelImage: Object.freeze({ x: 36, y: 76, w: 612, h: 612 }),
  status: Object.freeze({ x: 688, y: 92, w: 552, h: 108 }),
  drawButton: Object.freeze({ x: 688, y: 220, w: 260, h: 58 }),
  upgradeButton: Object.freeze({ x: 966, y: 220, w: 274, h: 58 }),
  recent: Object.freeze({ x: 688, y: 302, w: 552, h: 120 }),
  odds: Object.freeze({ x: 688, y: 446, w: 552, h: 112 }),
  message: Object.freeze({ x: 688, y: 582, w: 552, h: 22 }),
  controlsHint: Object.freeze({ x: 688, y: 636, w: 552, h: 18 }),
});

export const EQUIPMENT_SCREEN_LAYOUT = EQUIPMENT_ROULETTE_LAYOUT;

export function getEquipmentSlotRects(layout = EQUIPMENT_INVENTORY_LAYOUT) {
  const gap = 12;
  const inset = 14;
  const width = (layout.equipped.w - inset * 2 - gap * 2) / 3;
  return Object.fromEntries(EQUIPMENT_SLOT_ORDER.map((slot, index) => [
    slot,
    {
      x: layout.equipped.x + inset + index * (width + gap),
      y: layout.equipped.y + 40,
      w: width,
      h: 80,
    },
  ]));
}

export function getEquipmentFilterRects(layout = EQUIPMENT_INVENTORY_LAYOUT) {
  const gap = 8;
  const width = (layout.filters.w - gap * (EQUIPMENT_FILTER_ORDER.length - 1))
    / EQUIPMENT_FILTER_ORDER.length;
  return EQUIPMENT_FILTER_ORDER.map((filter, index) => ({
    filter,
    x: layout.filters.x + index * (width + gap),
    y: layout.filters.y,
    w: width,
    h: layout.filters.h,
  }));
}

export function getEquipmentInventoryRects(
  ownedCount,
  layout = EQUIPMENT_INVENTORY_LAYOUT,
) {
  const columns = 3;
  const gap = 8;
  const inset = 14;
  const itemWidth = (layout.inventory.w - inset * 2 - gap * (columns - 1)) / columns;
  const itemHeight = 50;
  return Array.from({ length: ownedCount }, (_, index) => ({
    x: layout.inventory.x + inset + (index % columns) * (itemWidth + gap),
    y: layout.inventory.y + 48 + Math.floor(index / columns) * (itemHeight + 8),
    w: itemWidth,
    h: itemHeight,
    index,
  }));
}
