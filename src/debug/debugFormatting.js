export const DEBUG_FIELD_SPECS = [
  ["mode", "mode"],
  ["runFinalized", "runFinalized"],
  ["playerHp", "playerHp"],
  ["active", "active"],
  ["active.type", "activeType"],
  ["active.x", "activeX"],
  ["active.y", "activeY"],
  ["active min cell y", "activeMinCellY"],
  ["active y<HIDDEN", "activeAboveHidden"],
  ["active y<0", "activeAboveTopBuffer"],
  ["active canMove down", "activeCanMoveDown"],
  ["active overlaps board", "activeOverlapsBoard"],
  ["lockTimer", "lockTimer"],
  ["dropTimer", "dropTimer"],
  ["countdownMs", "countdownMs"],
  ["hitStopMs", "hitStopMs"],
  ["pendingHits.length", "pendingHitsLength"],
  ["upgrade choice open", "upgradeChoiceOpen"],
  ["pause open", "pauseOpen"],
  ["hidden row 0", "hiddenRow0"],
  ["hidden row 1", "hiddenRow1"],
  ["spawn footprint blocked", "spawnFootprintBlocked"],
  ["lastDefeatSource", "lastDefeatSource"],
  ["lastDefeatMessageKey", "lastDefeatMessageKey"],
  ["triggerDefeat called", "triggerDefeatCalled"],
  ["finishRun called", "finishRunCalled"],
  ["drawResultOverlay called", "drawResultOverlayCalled"],
  ["asset loading", "assetLoading"],
  ["asset loaded", "assetLoaded"],
  ["asset error", "assetError"],
  ["asset total", "assetTotal"],
  ["asset age", "assetAge"],
  ["served-top-buffer", "servedTopBuffer"],
  ["last update age", "lastUpdateAge"],
  ["last draw age", "lastDrawAge"],
  ["draw error", "drawError"],
  ["debug build", "debugBuild"],
];

export function buildDebugRows(debugState, readers, now, debugBuild) {
  const allReaders = {
    ...readers,
    lastDefeatSource: () => debugState.lastDefeatSource,
    lastDefeatMessageKey: () => debugState.lastDefeatMessageKey,
    triggerDefeatCalled: () => debugState.triggerDefeatCalled,
    finishRunCalled: () => debugState.finishRunCalled,
    drawResultOverlayCalled: () => debugState.resultOverlayDrawn,
    lastUpdateAge: () => Math.round(now - debugState.lastUpdateAt),
    lastDrawAge: () => Math.round(now - debugState.lastDrawAt),
    drawError: () => debugState.drawError,
    debugBuild: () => debugBuild,
  };
  return DEBUG_FIELD_SPECS.map(([label, key]) => readDebugValue(label, allReaders[key]));
}

export function readDebugReader(reader) {
  try {
    return typeof reader === "function" ? reader() : undefined;
  } catch {
    return undefined;
  }
}

export function formatDebugValue(value) {
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return String(value);
}

function readDebugValue(label, reader) {
  try {
    return [label, typeof reader === "function" ? reader() : ""];
  } catch (error) {
    return [label, `ERR ${String(error?.message || error)}`];
  }
}
