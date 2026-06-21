export function getAssetLoadingTransition({
  loadingDone,
  completingAt = 0,
  startedAt,
  now,
  summary,
  criticalReadiness,
  minMs,
  maxMs,
  completionDelayMs = 0,
  isComplete,
} = {}) {
  const elapsed = Math.max(0, now - startedAt);
  const criticalReady = criticalReadiness?.ready !== false;
  const loadingComplete = isComplete(summary, elapsed, { minMs, maxMs, criticalReady });
  const completionStartedAt = completingAt || (loadingComplete ? now : 0);
  const completionElapsed = completionStartedAt ? Math.max(0, now - completionStartedAt) : 0;
  return {
    completed: !loadingDone && loadingComplete && completionElapsed >= completionDelayMs,
    loadingComplete,
    completionStartedAt,
    completionElapsed,
    criticalReadiness,
    elapsed,
    summary,
  };
}

export function createAssetLoadingController({
  state,
  getSummary,
  getCriticalReadiness,
  minMs,
  maxMs,
  completionDelayMs = 0,
  isComplete,
  onCompleted,
  now = () => performance.now(),
} = {}) {
  return function updateAssetLoading(currentTime = now()) {
    if (state.assetLoadingDone) return false;
    const summary = getSummary();
    const criticalReadiness = getCriticalReadiness?.();
    const transition = getAssetLoadingTransition({
      loadingDone: state.assetLoadingDone,
      completingAt: state.assetLoadingCompletingAt || 0,
      startedAt: state.assetLoadingStartedAt,
      now: currentTime,
      summary,
      criticalReadiness,
      minMs,
      maxMs,
      completionDelayMs,
      isComplete,
    });
    if (completionDelayMs > 0 && transition.loadingComplete && !state.assetLoadingCompletingAt) {
      state.assetLoadingCompletingAt = transition.completionStartedAt;
      return false;
    }
    if (!transition.completed) return false;
    state.assetLoadingDone = true;
    state.assetLoadingCompletedAt = currentTime;
    state.menuRevealStartedAt = currentTime;
    onCompleted?.(transition);
    return true;
  };
}
