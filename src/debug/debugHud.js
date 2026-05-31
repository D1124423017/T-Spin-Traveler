import {
  buildDebugRows,
  formatDebugValue,
  readDebugReader,
} from "./debugFormatting.js";

export const DEBUG_HUD_BUILD = "debug-hud-2026-05-31-module";

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

let domHud = null;

export function updateDebugDomHud({
  enabled = isDebugHudEnabled(),
  debugState,
  readers = {},
  now = getNow(),
} = {}) {
  if (!enabled || !debugState) return;
  updateFlowStuckState(debugState, readers, now);
  const hud = ensureDebugDomHud();
  if (!hud) return;

  const rows = buildDebugRows(debugState, readers, now, DEBUG_HUD_BUILD);
  if (debugState.flowStuck) {
    rows.unshift(["FLOW STUCK", `${Math.round(now - debugState.stuckSince)}ms`]);
  }
  hud.textContent = rows.map(([key, value]) => `${key}: ${formatDebugValue(value)}`).join("\n");
  hud.style.borderColor = debugState.flowStuck
    ? "rgba(255, 120, 132, 0.95)"
    : "rgba(126, 231, 255, 0.72)";
}

function updateFlowStuckState(debugState, readers, now) {
  const blockedDown = readDebugReader(readers.activeBlockedDown) === true;
  const activeKey = readDebugReader(readers.activeDebugKey) || "";
  if (!blockedDown) {
    debugState.stuckActiveKey = "";
    debugState.stuckSince = 0;
    debugState.flowStuck = false;
    return;
  }
  if (debugState.stuckActiveKey !== activeKey) {
    debugState.stuckActiveKey = activeKey;
    debugState.stuckSince = now;
    debugState.flowStuck = false;
    return;
  }
  debugState.flowStuck = debugState.stuckSince > 0 && now - debugState.stuckSince > 2000;
}

function ensureDebugDomHud() {
  if (domHud?.isConnected) return domHud;
  if (typeof document === "undefined" || !document.body) return null;
  const hud = document.createElement("pre");
  hud.id = "tst-debug-hud";
  Object.assign(hud.style, {
    position: "fixed",
    left: "10px",
    top: "10px",
    zIndex: "2147483647",
    maxWidth: "420px",
    maxHeight: "92vh",
    overflow: "hidden",
    margin: "0",
    padding: "8px 10px",
    border: "1px solid rgba(126, 231, 255, 0.72)",
    borderRadius: "6px",
    background: "rgba(5, 8, 14, 0.86)",
    color: "#f5f1e6",
    font: "10px/1.3 monospace",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
  });
  document.body.appendChild(hud);
  domHud = hud;
  return domHud;
}

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
