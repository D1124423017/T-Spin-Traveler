export function getAssetLoadingTransition({
  loadingDone,
  startedAt,
  now,
  summary,
  minMs,
  maxMs,
  isComplete,
} = {}) {
  const elapsed = Math.max(0, now - startedAt);
  return {
    completed: !loadingDone && isComplete(summary, elapsed, { minMs, maxMs }),
    elapsed,
    summary,
  };
}

export function createAssetLoadingController({
  state,
  getSummary,
  minMs,
  maxMs,
  isComplete,
  onCompleted,
  now = () => performance.now(),
} = {}) {
  return function updateAssetLoading(currentTime = now()) {
    if (state.assetLoadingDone) return false;
    const summary = getSummary();
    const transition = getAssetLoadingTransition({
      loadingDone: state.assetLoadingDone,
      startedAt: state.assetLoadingStartedAt,
      now: currentTime,
      summary,
      minMs,
      maxMs,
      isComplete,
    });
    if (!transition.completed) return false;
    state.assetLoadingDone = true;
    state.menuRevealStartedAt = currentTime;
    onCompleted?.(transition);
    return true;
  };
}
