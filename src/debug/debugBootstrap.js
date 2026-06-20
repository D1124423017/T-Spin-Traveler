export const DEBUG_HUD_BUILD = "debug-hud-2026-05-31-module";

export const DEFAULT_DEBUG_ART_TUNING = Object.freeze({
  playerScale: 1,
  enemyScale: 1,
  heroAttackScale: 1,
  enemyAttackScale: 1,
});

export function isDebugHudEnabled(search = globalThis?.location?.search || "") {
  try {
    return new URLSearchParams(search).get("debug") === "1";
  } catch {
    return false;
  }
}

export function createDebugHudState() {
  return {
    lastDefeatSource: "",
    lastDefeatMessageKey: "",
    triggerDefeatCalled: false,
    finishRunCalled: false,
    resultOverlayDrawn: false,
    stuckActiveKey: "",
    stuckSince: 0,
    flowStuck: false,
    lastUpdateAt: 0,
    lastDrawAt: 0,
    drawError: "",
  };
}

export function createPendingDebugUiController({
  allowed = true,
  initialVisible = false,
} = {}) {
  const debugAllowed = Boolean(allowed);
  let visible = debugAllowed && Boolean(initialVisible);

  function setVisible(nextVisible) {
    visible = debugAllowed && Boolean(nextVisible);
    return visible;
  }

  return {
    isAllowed: () => debugAllowed,
    isVisible: () => visible,
    setVisible,
    toggle: () => setVisible(!visible),
  };
}

export function handleDebugUiShortcut(
  event,
  toggleDebugUi,
  { enabled = true } = {},
) {
  if (event?.key !== "F1" && event?.code !== "F1") return false;
  if (!enabled) return false;
  if (isTextEntryTarget(event?.target)) return false;
  event.preventDefault?.();
  toggleDebugUi?.();
  return true;
}

export function isTextEntryTarget(target) {
  if (!target || typeof target !== "object") return false;
  if (target.isContentEditable) return true;
  const tagName = String(target.tagName || "").toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

export function readActivePieceDebugInfo(activePiece) {
  if (!activePiece) return null;
  return {
    type: activePiece.type,
    x: activePiece.x,
    y: activePiece.y,
  };
}

export function readHiddenRowsDebugInfo(
  board,
  hiddenRowCount,
  rowHasPlayableCells,
) {
  const hiddenRows = board.slice(0, hiddenRowCount);
  return {
    occupied: hiddenRows.some(rowHasPlayableCells),
    rows: hiddenRows.map(rowHasPlayableCells),
  };
}
