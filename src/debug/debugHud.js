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

export const DEFAULT_DEBUG_ART_TUNING = Object.freeze({
  playerScale: 1,
  enemyScale: 1,
  heroAttackScale: 1,
  enemyAttackScale: 1,
});

const DEBUG_ART_TUNING_KEY = "tspin-traveler-debug-art-tuning-v1";

let domHud = null;
let domArtTuning = null;
let debugArtTuning = null;
let debugEnergyTool = null;

export function getDebugArtTuning({ enabled = isDebugHudEnabled() } = {}) {
  if (!enabled) return DEFAULT_DEBUG_ART_TUNING;
  if (!debugArtTuning) debugArtTuning = loadDebugArtTuning();
  return debugArtTuning;
}

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

export function updateDebugArtTuningDom({
  enabled = isDebugHudEnabled(),
  tuning = getDebugArtTuning({ enabled }),
  energyTool = null,
} = {}) {
  if (!enabled || !tuning) {
    if (domArtTuning?.isConnected) domArtTuning.remove();
    domArtTuning = null;
    return;
  }
  debugEnergyTool = energyTool;
  const panel = ensureDebugArtTuningDom();
  if (!panel) return;
  for (const input of panel.querySelectorAll("input[data-debug-art-key]")) {
    const key = input.dataset.debugArtKey;
    const value = Number(tuning[key] ?? DEFAULT_DEBUG_ART_TUNING[key] ?? 1);
    if (document.activeElement !== input) input.value = String(value);
    const output = panel.querySelector(`[data-debug-art-value="${key}"]`);
    if (output) output.textContent = value.toFixed(2);
  }
  const energyButton = panel.querySelector("[data-debug-energy-add]");
  if (energyButton && energyTool?.buttonLabel) {
    energyButton.textContent = energyTool.buttonLabel;
  }
  const energyValue = panel.querySelector("[data-debug-energy-value]");
  if (energyValue && energyTool?.valueLabel) {
    energyValue.textContent = energyTool.valueLabel;
  }
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

function ensureDebugArtTuningDom() {
  if (domArtTuning?.isConnected) return domArtTuning;
  if (typeof document === "undefined" || !document.body) return null;

  const panel = document.createElement("section");
  panel.id = "tst-debug-art-tuning";
  Object.assign(panel.style, {
    position: "fixed",
    right: "10px",
    top: "10px",
    zIndex: "2147483647",
    width: "284px",
    maxHeight: "92vh",
    overflow: "auto",
    margin: "0",
    padding: "10px 12px",
    border: "1px solid rgba(255, 240, 166, 0.62)",
    borderRadius: "8px",
    background: "rgba(5, 8, 14, 0.9)",
    color: "#f5f1e6",
    font: "11px/1.35 system-ui, sans-serif",
    boxShadow: "0 16px 42px rgba(0,0,0,0.35)",
  });

  const title = document.createElement("div");
  title.textContent = "Battle Art Tuning";
  Object.assign(title.style, {
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fff0a6",
    marginBottom: "8px",
  });
  panel.appendChild(title);

  const controls = [
    ["playerScale", "Player scale"],
    ["enemyScale", "Enemy scale"],
    ["heroAttackScale", "Hero attack scale"],
    ["enemyAttackScale", "Enemy attack scale"],
  ];
  for (const [key, label] of controls) {
    panel.appendChild(createScaleControl(key, label));
  }

  const actions = document.createElement("div");
  Object.assign(actions.style, {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  });
  const reset = createDebugButton("Reset");
  reset.addEventListener("click", () => {
    Object.assign(getDebugArtTuning(), DEFAULT_DEBUG_ART_TUNING);
    saveDebugArtTuning(getDebugArtTuning());
    updateDebugArtTuningDom();
  });
  const copy = createDebugButton("Copy");
  copy.addEventListener("click", async () => {
    const text = JSON.stringify(getDebugArtTuning(), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = "Copied";
      setTimeout(() => { copy.textContent = "Copy"; }, 900);
    } catch {
      console.log("[T-Spin Traveler] Debug art tuning", text);
    }
  });
  actions.append(reset, copy);
  panel.appendChild(actions);

  const energySection = document.createElement("div");
  Object.assign(energySection.style, {
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(185, 135, 255, 0.28)",
  });
  const energyValue = document.createElement("div");
  energyValue.dataset.debugEnergyValue = "true";
  energyValue.textContent = "Rift Energy";
  Object.assign(energyValue.style, {
    marginBottom: "7px",
    color: "#d9c5ff",
    fontVariantNumeric: "tabular-nums",
  });
  const addEnergy = createDebugButton("Add 10000 Rift Energy");
  addEnergy.dataset.debugEnergyAdd = "true";
  addEnergy.style.width = "100%";
  addEnergy.addEventListener("click", () => {
    const nextValue = debugEnergyTool?.onActivate?.();
    if (Number.isFinite(nextValue) && debugEnergyTool?.formatValue) {
      energyValue.textContent = debugEnergyTool.formatValue(nextValue);
    }
  });
  energySection.append(energyValue, addEnergy);
  panel.appendChild(energySection);

  document.body.appendChild(panel);
  domArtTuning = panel;
  return domArtTuning;
}

function createScaleControl(key, label) {
  const row = document.createElement("label");
  Object.assign(row.style, {
    display: "grid",
    gridTemplateColumns: "1fr 42px",
    gap: "8px",
    alignItems: "center",
    margin: "8px 0",
  });

  const text = document.createElement("span");
  text.textContent = label;
  text.style.color = "rgba(238,244,252,0.82)";

  const value = document.createElement("output");
  value.dataset.debugArtValue = key;
  value.textContent = "1.00";
  value.style.textAlign = "right";
  value.style.color = "#9df7da";
  value.style.fontVariantNumeric = "tabular-nums";

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0.5";
  input.max = "1.4";
  input.step = "0.01";
  input.value = "1";
  input.dataset.debugArtKey = key;
  Object.assign(input.style, {
    gridColumn: "1 / 3",
    width: "100%",
  });
  input.addEventListener("input", () => {
    const tuning = getDebugArtTuning();
    tuning[key] = Number(input.value);
    saveDebugArtTuning(tuning);
    value.textContent = tuning[key].toFixed(2);
  });

  row.append(text, value, input);
  return row;
}

function createDebugButton(text) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  Object.assign(button.style, {
    flex: "1",
    border: "1px solid rgba(126, 231, 255, 0.35)",
    borderRadius: "6px",
    background: "rgba(126, 231, 255, 0.1)",
    color: "#f5f1e6",
    padding: "6px 8px",
    font: "11px/1.2 system-ui, sans-serif",
    cursor: "pointer",
  });
  return button;
}

function loadDebugArtTuning() {
  const next = { ...DEFAULT_DEBUG_ART_TUNING };
  if (typeof localStorage === "undefined") return next;
  try {
    const saved = JSON.parse(localStorage.getItem(DEBUG_ART_TUNING_KEY) || "{}");
    for (const key of Object.keys(next)) {
      const value = Number(saved[key]);
      if (Number.isFinite(value)) next[key] = Math.max(0.5, Math.min(1.4, value));
    }
  } catch {
    // Ignore malformed debug-only localStorage.
  }
  return next;
}

function saveDebugArtTuning(tuning) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(DEBUG_ART_TUNING_KEY, JSON.stringify(tuning));
}

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
