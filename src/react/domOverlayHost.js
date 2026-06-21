import {
  getDomOverlayLayer,
  registerOverlayCleanup,
} from "../dom/domOverlayRoot.js";

export const REACT_DEBUG_LAYER_NAME = "react-debug";

export function getReactDebugOverlayHost() {
  const layer = getDomOverlayLayer(REACT_DEBUG_LAYER_NAME, "tst-react-debug-layer");
  if (!layer) return null;
  layer.setAttribute("aria-hidden", "false");
  return layer;
}

export function registerReactDebugOverlayCleanup(handler) {
  return registerOverlayCleanup(handler);
}
