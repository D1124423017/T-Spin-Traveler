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
