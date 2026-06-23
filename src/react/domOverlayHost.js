import {
  getDomOverlayLayer,
  registerOverlayCleanup,
} from "../dom/domOverlayRoot.js";

export const REACT_DEBUG_LAYER_NAME = "react-debug";
export const REACT_GAMEPLAY_HUD_LAYER_NAME = "react-gameplay-hud";
export const REACT_MAIN_MENU_LAYER_NAME = "react-main-menu";

export function getReactDebugOverlayHost() {
  const layer = getDomOverlayLayer(REACT_DEBUG_LAYER_NAME, "tst-react-debug-layer");
  if (!layer) return null;
  layer.setAttribute("aria-hidden", "false");
  return layer;
}

export function getReactGameplayHudOverlayHost() {
  const layer = getDomOverlayLayer(REACT_GAMEPLAY_HUD_LAYER_NAME, "tst-react-gameplay-hud-layer");
  if (!layer) return null;
  layer.setAttribute("aria-hidden", "false");
  return layer;
}

export function getReactMainMenuOverlayHost() {
  const layer = getDomOverlayLayer(REACT_MAIN_MENU_LAYER_NAME, "tst-react-main-menu-layer");
  if (!layer) return null;
  layer.setAttribute("aria-hidden", "false");
  return layer;
}

export function registerReactDebugOverlayCleanup(handler) {
  return registerOverlayCleanup(handler);
}

export function registerReactGameplayHudOverlayCleanup(handler) {
  return registerOverlayCleanup(handler);
}

export function registerReactMainMenuOverlayCleanup(handler) {
  return registerOverlayCleanup(handler);
}
