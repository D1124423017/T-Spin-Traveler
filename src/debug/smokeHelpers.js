export function createSmokeDebugReaders({
  state,
  hiddenRows,
  isPieceAboveTopBuffer,
  collides,
  isActivePieceOverlappingBoard,
  getHiddenRowsDebugInfo,
  isSpawnBlockedForDefeat,
  getAssetLoadingSummary,
  now = performance.now(),
} = {}) {
  const active = state.active;
  const activeHasCellAboveHiddenRows = () => {
    if (!state.active) return false;
    for (let r = 0; r < state.active.shape.length; r += 1) {
      for (let c = 0; c < state.active.shape[r].length; c += 1) {
        if (state.active.shape[r][c] && state.active.y + r < hiddenRows) return true;
      }
    }
    return false;
  };
  const activeHasCellAboveTopBuffer = () => isPieceAboveTopBuffer(state.active);
  const canActiveMoveDown = () => {
    if (!state.active) return false;
    return !collides(state.active, state.active.x, state.active.y + 1, state.active.shape);
  };
  const getActiveDebugKey = () => {
    if (!state.active) return "";
    return `${state.active.type}:${state.active.x}:${state.active.y}:${state.active.shape.map((row) => row.join("")).join("/")}`;
  };
  const getActiveCellMinY = () => {
    if (!state.active) return "";
    let minY = Infinity;
    for (let r = 0; r < state.active.shape.length; r += 1) {
      for (let c = 0; c < state.active.shape[r].length; c += 1) {
        if (state.active.shape[r][c]) minY = Math.min(minY, state.active.y + r);
      }
    }
    return Number.isFinite(minY) ? minY : "";
  };

  return {
    mode: () => state.mode,
    runFinalized: () => state.runFinalized,
    playerHp: () => state.playerHp,
    active: () => Boolean(active),
    activeType: () => active?.type || "",
    activeX: () => active?.x ?? "",
    activeY: () => active?.y ?? "",
    activeMinCellY: getActiveCellMinY,
    activeAboveHidden: activeHasCellAboveHiddenRows,
    activeAboveTopBuffer: activeHasCellAboveTopBuffer,
    activeCanMoveDown: canActiveMoveDown,
    activeOverlapsBoard: isActivePieceOverlappingBoard,
    lockTimer: () => state.lockTimer === null ? "null" : Math.round(now - state.lockTimer),
    dropTimer: () => Math.round(state.dropTimer || 0),
    countdownMs: () => Math.round(state.countdownMs || 0),
    hitStopMs: () => Math.round(state.hitStopMs || 0),
    pendingHitsLength: () => state.pendingHits.length,
    upgradeChoiceOpen: () => state.mode === "upgrade" || state.upgradeChoices.length > 0,
    pauseOpen: () => state.mode === "paused",
    hiddenRow0: () => getHiddenRowsDebugInfo().rows[0] || false,
    hiddenRow1: () => getHiddenRowsDebugInfo().rows[1] || false,
    spawnFootprintBlocked: isSpawnBlockedForDefeat,
    assetLoading: () => getAssetLoadingSummary().loading,
    assetLoaded: () => getAssetLoadingSummary().loaded,
    assetError: () => getAssetLoadingSummary().error,
    assetTotal: () => getAssetLoadingSummary().total,
    assetAge: () => `${Math.round(now - state.assetLoadingStartedAt)}ms`,
    servedTopBuffer: () => hiddenRows === 5,
    activeDebugKey: getActiveDebugKey,
    activeBlockedDown: () => state.mode === "playing" && Boolean(state.active) && !canActiveMoveDown(),
  };
}
