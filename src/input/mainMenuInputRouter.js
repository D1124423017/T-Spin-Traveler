import { pointInRect } from "../render/drawUtils.js";
import {
  getMainMenuActions,
  normalizeMainMenuSelectedIndex,
} from "../ui/mainMenuModel.js";

export function createMainMenuInputRouter({
  state,
  getButtonRects,
  actions = {},
  playSfx = () => {},
} = {}) {
  function getSelectedIndex() {
    const list = getMainMenuActions();
    const index = normalizeMainMenuSelectedIndex(state.mainMenuSelectedIndex, list.length);
    state.mainMenuSelectedIndex = index;
    return index;
  }

  function moveSelection(delta) {
    const list = getMainMenuActions();
    state.mainMenuSelectedIndex = normalizeMainMenuSelectedIndex(
      getSelectedIndex() + delta,
      list.length,
    );
    playSfx("uiHover");
    return state.mainMenuSelectedIndex;
  }

  function activateIndex(index = getSelectedIndex()) {
    const list = getMainMenuActions();
    const action = list[normalizeMainMenuSelectedIndex(index, list.length)];
    if (!action || action.enabled === false) return false;
    const callback = actions[action.id];
    if (typeof callback !== "function") return false;
    callback();
    return true;
  }

  function handleKeyDown({ key, code, repeat = false } = {}) {
    if (repeat) {
      return key === "ArrowUp"
        || key === "ArrowDown"
        || key === "Enter"
        || key === " "
        || code === "Space";
    }
    if (key === "ArrowUp") {
      moveSelection(-1);
      return true;
    }
    if (key === "ArrowDown") {
      moveSelection(1);
      return true;
    }
    if (key === "Enter" || key === " " || code === "Space") {
      return activateIndex();
    }
    return false;
  }

  function findActionIndexAtPoint(x, y) {
    const rects = getButtonRects();
    return getMainMenuActions().findIndex((action) => {
      const rect = rects[action.id];
      return rect && pointInRect(x, y, rect.x, rect.y, rect.w, rect.h);
    });
  }

  function updatePointerSelection(x, y) {
    const index = findActionIndexAtPoint(x, y);
    if (index < 0) return false;
    state.mainMenuSelectedIndex = index;
    return true;
  }

  function handlePointerDown(x, y) {
    const index = findActionIndexAtPoint(x, y);
    if (index < 0) return false;
    state.mainMenuSelectedIndex = index;
    return activateIndex(index);
  }

  return {
    activateIndex,
    handleKeyDown,
    handlePointerDown,
    moveSelection,
    updatePointerSelection,
  };
}
