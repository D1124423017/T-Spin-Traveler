import {
  EQUIPMENT_FILTER_ORDER,
  EQUIPMENT_SLOT_ORDER,
} from "../data/equipment.js";

export const EQUIPMENT_INVENTORY_LAYOUT = Object.freeze({
  title: Object.freeze({ x: 42, y: 28, w: 640, h: 58 }),
  backButton: Object.freeze({ x: 1084, y: 28, w: 156, h: 42 }),
  heroStage: Object.freeze({ x: 28, y: 88, w: 360, h: 578 }),
  heroVisual: Object.freeze({ x: 40, y: 104, w: 336, h: 420 }),
  heroImage: Object.freeze({ x: 50, y: 86, w: 316, h: 438 }),
  currentStats: Object.freeze({ x: 44, y: 530, w: 328, h: 120 }),
  equipped: Object.freeze({ x: 410, y: 88, w: 830, h: 134 }),
  filters: Object.freeze({ x: 410, y: 240, w: 520, h: 42 }),
  rouletteButton: Object.freeze({ x: 1000, y: 238, w: 240, h: 46 }),
  inventory: Object.freeze({ x: 410, y: 300, w: 520, h: 358 }),
  details: Object.freeze({ x: 948, y: 300, w: 292, h: 358 }),
  equipButton: Object.freeze({ x: 970, y: 604, w: 248, h: 44 }),
  controlsHint: Object.freeze({ x: 410, y: 684, w: 830, h: 18 }),
});

export const EQUIPMENT_ROULETTE_LAYOUT = Object.freeze({
  title: Object.freeze({ x: 44, y: 28, w: 650, h: 58 }),
  backButton: Object.freeze({ x: 1030, y: 28, w: 210, h: 42 }),
  wheel: Object.freeze({ cx: 342, cy: 382, radius: 292 }),
  wheelImage: Object.freeze({ w: 612, h: 612 }),
  status: Object.freeze({ x: 694, y: 104, w: 546, h: 122 }),
  drawButton: Object.freeze({ x: 694, y: 250, w: 258, h: 60 }),
  upgradeButton: Object.freeze({ x: 970, y: 250, w: 270, h: 60 }),
  odds: Object.freeze({ x: 694, y: 350, w: 546, h: 168 }),
  message: Object.freeze({ x: 694, y: 552, w: 546, h: 22 }),
  controlsHint: Object.freeze({ x: 694, y: 636, w: 546, h: 18 }),
});

export const EQUIPMENT_SCREEN_LAYOUT = EQUIPMENT_ROULETTE_LAYOUT;
export const EQUIPMENT_INVENTORY_PAGE_SIZE = 15;

export function getEquipmentSlotRects(layout = EQUIPMENT_INVENTORY_LAYOUT) {
  const gap = 10;
  const inset = 14;
  const width = (layout.equipped.w - inset * 2 - gap * 2) / 3;
  return Object.fromEntries(EQUIPMENT_SLOT_ORDER.map((slot, index) => [
    slot,
    {
      x: layout.equipped.x + inset + index * (width + gap),
      y: layout.equipped.y + 40,
      w: width,
      h: 78,
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
  pageIndex = 0,
) {
  const columns = 3;
  const gap = 8;
  const inset = 14;
  const page = getEquipmentInventoryPage(pageIndex * EQUIPMENT_INVENTORY_PAGE_SIZE, ownedCount);
  const visibleCount = Math.max(0, Math.min(
    EQUIPMENT_INVENTORY_PAGE_SIZE,
    ownedCount - page.startIndex,
  ));
  const itemWidth = (layout.inventory.w - inset * 2 - gap * (columns - 1)) / columns;
  const itemHeight = 48;
  return Array.from({ length: visibleCount }, (_, localIndex) => ({
    x: layout.inventory.x + inset + (localIndex % columns) * (itemWidth + gap),
    y: layout.inventory.y + 48 + Math.floor(localIndex / columns) * (itemHeight + 5),
    w: itemWidth,
    h: itemHeight,
    index: page.startIndex + localIndex,
  }));
}

export function getEquipmentInventoryPage(selectedIndex, ownedCount) {
  const safeCount = Math.max(0, Math.floor(Number(ownedCount) || 0));
  const pageCount = Math.max(1, Math.ceil(safeCount / EQUIPMENT_INVENTORY_PAGE_SIZE));
  const safeSelected = Math.max(
    0,
    Math.min(Math.max(0, safeCount - 1), Math.floor(Number(selectedIndex) || 0)),
  );
  const pageIndex = Math.min(pageCount - 1, Math.floor(
    safeSelected / EQUIPMENT_INVENTORY_PAGE_SIZE,
  ));
  return {
    pageIndex,
    pageCount,
    startIndex: pageIndex * EQUIPMENT_INVENTORY_PAGE_SIZE,
  };
}

export function getEquipmentPaginationRects(layout = EQUIPMENT_INVENTORY_LAYOUT) {
  const y = layout.inventory.y + layout.inventory.h - 30;
  return {
    previous: { x: layout.inventory.x + 14, y, w: 76, h: 22 },
    next: { x: layout.inventory.x + layout.inventory.w - 90, y, w: 76, h: 22 },
  };
}
