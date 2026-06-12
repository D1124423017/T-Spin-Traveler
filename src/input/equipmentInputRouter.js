import {
  EQUIPMENT_FILTER_ORDER,
  EQUIPMENT_SCREEN_VIEWS,
} from "../data/equipment.js";
import { getOwnedEquipmentForFilter } from "../core/equipmentProgress.js";
import { pointInRect } from "../render/drawUtils.js";
import {
  EQUIPMENT_INVENTORY_LAYOUT,
  EQUIPMENT_ROULETTE_LAYOUT,
  getEquipmentFilterRects,
  getEquipmentInventoryRects,
} from "../ui/equipmentLayout.js";
import { clampEquipmentSelection } from "../ui/equipmentUiPrimitives.js";

export function createEquipmentInputRouter({
  state,
  actions,
  inventoryLayout = EQUIPMENT_INVENTORY_LAYOUT,
  rouletteLayout = EQUIPMENT_ROULETTE_LAYOUT,
} = {}) {
  function handleKeyDown({ key, code, repeat = false } = {}) {
    if (repeat) return false;
    if (currentView() === EQUIPMENT_SCREEN_VIEWS.roulette) {
      return handleRouletteKeyDown(key, code);
    }
    return handleInventoryKeyDown(key);
  }

  function handleInventoryKeyDown(key) {
    if (key === "Escape") {
      actions.backToMain?.();
      return true;
    }
    const normalized = String(key).toLowerCase();
    if (normalized === "r") {
      actions.openRoulette?.();
      return true;
    }
    if (key === "ArrowLeft" || key === "ArrowRight") {
      cycleFilter(key === "ArrowLeft" ? -1 : 1);
      return true;
    }
    if (key === "ArrowUp" || key === "ArrowDown") {
      moveInventorySelection(key === "ArrowUp" ? -1 : 1);
      return true;
    }
    if (key === "Enter" || normalized === "e") {
      equipSelectedItem();
      return true;
    }
    return false;
  }

  function handleRouletteKeyDown(key, code) {
    if (key === "Escape") {
      actions.backToInventory?.();
      return true;
    }
    if (key === "Enter" || key === " " || code === "Space") {
      actions.draw?.();
      return true;
    }
    if (String(key).toLowerCase() === "u") {
      actions.upgrade?.();
      return true;
    }
    return false;
  }

  function handlePointerDown(x, y) {
    if (currentView() === EQUIPMENT_SCREEN_VIEWS.roulette) {
      return handleRoulettePointerDown(x, y);
    }
    return handleInventoryPointerDown(x, y);
  }

  function handleInventoryPointerDown(x, y) {
    if (pointIn(inventoryLayout.backButton, x, y)) {
      actions.backToMain?.();
      return true;
    }
    if (pointIn(inventoryLayout.rouletteButton, x, y)) {
      actions.openRoulette?.();
      return true;
    }
    const filterRect = getEquipmentFilterRects(inventoryLayout)
      .find((entry) => pointIn(entry, x, y));
    if (filterRect) {
      state.equipmentUi.filter = filterRect.filter;
      state.equipmentUi.selectedOwnedIndex = 0;
      return true;
    }
    const owned = filteredOwned();
    const itemRect = getEquipmentInventoryRects(owned.length, inventoryLayout)
      .find((entry) => pointIn(entry, x, y));
    if (itemRect) {
      state.equipmentUi.selectedOwnedIndex = itemRect.index;
      return true;
    }
    if (pointIn(inventoryLayout.equipButton, x, y)) {
      equipSelectedItem();
      return true;
    }
    return false;
  }

  function handleRoulettePointerDown(x, y) {
    if (pointIn(rouletteLayout.backButton, x, y)) {
      actions.backToInventory?.();
      return true;
    }
    if (pointIn(rouletteLayout.drawButton, x, y)) {
      actions.draw?.();
      return true;
    }
    if (pointIn(rouletteLayout.upgradeButton, x, y)) {
      actions.upgrade?.();
      return true;
    }
    return false;
  }

  function isInteractivePoint(x, y) {
    if (currentView() === EQUIPMENT_SCREEN_VIEWS.roulette) {
      return [
        rouletteLayout.backButton,
        rouletteLayout.drawButton,
        rouletteLayout.upgradeButton,
      ].some((rect) => pointIn(rect, x, y));
    }
    if ([
      inventoryLayout.backButton,
      inventoryLayout.rouletteButton,
      inventoryLayout.equipButton,
      ...getEquipmentFilterRects(inventoryLayout),
    ].some((rect) => pointIn(rect, x, y))) {
      return true;
    }
    return getEquipmentInventoryRects(filteredOwned().length, inventoryLayout)
      .some((rect) => pointIn(rect, x, y));
  }

  function cycleFilter(direction) {
    const current = Math.max(0, EQUIPMENT_FILTER_ORDER.indexOf(currentFilter()));
    const next = (current + direction + EQUIPMENT_FILTER_ORDER.length)
      % EQUIPMENT_FILTER_ORDER.length;
    state.equipmentUi.filter = EQUIPMENT_FILTER_ORDER[next];
    state.equipmentUi.selectedOwnedIndex = 0;
  }

  function moveInventorySelection(direction) {
    const owned = filteredOwned();
    if (!owned.length) return;
    const current = clampEquipmentSelection(
      state.equipmentUi?.selectedOwnedIndex,
      owned.length,
    );
    state.equipmentUi.selectedOwnedIndex = (current + direction + owned.length)
      % owned.length;
  }

  function equipSelectedItem() {
    const owned = filteredOwned();
    const index = clampEquipmentSelection(
      state.equipmentUi?.selectedOwnedIndex,
      owned.length,
    );
    const item = owned[index];
    if (item) actions.equip?.(item.id);
  }

  function filteredOwned() {
    return getOwnedEquipmentForFilter(
      state.metaProgress?.equipment,
      currentFilter(),
    );
  }

  function currentFilter() {
    return EQUIPMENT_FILTER_ORDER.includes(state.equipmentUi?.filter)
      ? state.equipmentUi.filter
      : "all";
  }

  function currentView() {
    return state.equipmentUi?.view === EQUIPMENT_SCREEN_VIEWS.roulette
      ? EQUIPMENT_SCREEN_VIEWS.roulette
      : EQUIPMENT_SCREEN_VIEWS.inventory;
  }

  return {
    handleKeyDown,
    handlePointerDown,
    isInteractivePoint,
  };
}

function pointIn(rect, x, y) {
  return pointInRect(x, y, rect.x, rect.y, rect.w, rect.h);
}
