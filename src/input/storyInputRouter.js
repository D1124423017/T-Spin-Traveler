import { pointInRect } from "../render/drawUtils.js";

export function isStoryNextKey({ key = "", code = "" } = {}) {
  return key === "Enter" || code === "Space" || key === " ";
}

export function isStorySkipKey({ key = "" } = {}) {
  const normalized = String(key).toLowerCase();
  return normalized === "s" || key === "Escape";
}

export function createStoryInputRouter({
  state,
  getLayout,
  actions = {},
} = {}) {
  function isStoryMode() {
    return state?.mode === "story";
  }

  function handleKeyDown({ key = "", code = "", repeat = false } = {}) {
    if (!isStoryMode() || repeat) return false;
    if (isStorySkipKey({ key, code })) {
      actions.skip?.();
      return true;
    }
    if (isStoryNextKey({ key, code })) {
      actions.next?.();
      return true;
    }
    return false;
  }

  function isInteractivePoint(x, y) {
    if (!isStoryMode()) return false;
    const layout = getLayout?.();
    if (!layout) return false;
    return pointInRect(x, y, layout.skipButton.x, layout.skipButton.y, layout.skipButton.w, layout.skipButton.h)
      || pointInRect(x, y, layout.nextButton.x, layout.nextButton.y, layout.nextButton.w, layout.nextButton.h)
      || pointInRect(x, y, layout.panelHitRect.x, layout.panelHitRect.y, layout.panelHitRect.w, layout.panelHitRect.h);
  }

  function handlePointerDown(x, y) {
    if (!isStoryMode()) return false;
    const layout = getLayout?.();
    if (!layout) return false;

    if (pointInRect(x, y, layout.skipButton.x, layout.skipButton.y, layout.skipButton.w, layout.skipButton.h)) {
      actions.skip?.();
      return true;
    }
    if (pointInRect(x, y, layout.nextButton.x, layout.nextButton.y, layout.nextButton.w, layout.nextButton.h)) {
      actions.next?.();
      return true;
    }
    if (pointInRect(x, y, layout.panelHitRect.x, layout.panelHitRect.y, layout.panelHitRect.w, layout.panelHitRect.h)) {
      actions.next?.();
      return true;
    }
    return false;
  }

  return {
    handleKeyDown,
    handlePointerDown,
    isInteractivePoint,
  };
}
